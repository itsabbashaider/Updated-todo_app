const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const { User } = require('../models');
const {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} = require('../errors');

const {
  generateAccessToken,
  generateRefreshToken,
  normalizeEmail,
  normalizeAnswer,
  getUserResponse,
} = require('../utils/auth.util');

const SECURITY_QUESTIONS = require('../constants/security-questions.constant');

exports.signup = async (email, password, first_name, last_name, security_question_1, security_answer_1, security_question_2, security_answer_2) => {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) throw new BadRequestError('Email already registered');

  const user = await User.create({
    email:              normalizedEmail,
    password:           await bcrypt.hash(password, 10),
    first_name:         first_name || null,
    last_name:          last_name  || null,
    security_question_1,
    security_answer_1:  await bcrypt.hash(normalizeAnswer(security_answer_1), 10),
    security_question_2,
    security_answer_2:  await bcrypt.hash(normalizeAnswer(security_answer_2), 10),
    is_email_verified:  true,
    last_login:         new Date(),
  });

  return {
    user:         getUserResponse(user),
    accessToken:  generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

exports.login = async (email, password) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) throw new UnauthorizedError('Invalid email or password');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new UnauthorizedError('Invalid email or password');

  if (!user.is_active) throw new UnauthorizedError('Account is deactivated');

  user.last_login = new Date();
  await user.save();

  return {
    user:         getUserResponse(user),
    accessToken:  generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

exports.refreshTokens = (refreshToken) => {
  const { verifyRefreshToken } = require('../utils/auth.util');
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  return {
    accessToken:  generateAccessToken({ user_id: decoded.user_id }),
    refreshToken: generateRefreshToken({ user_id: decoded.user_id }),
  };
};

exports.getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password'] },
  });

  if (!user) throw new NotFoundError('User not found');

  return user;
};

exports.updateProfile = async (userId, updates) => {
  const { first_name, last_name, email } = updates;

  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  if (email !== undefined) {
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await User.findOne({
      where: { 
        email: normalizedEmail, 
        user_id: { [require('sequelize').Op.ne]: userId } 
      }
    });
    if (existingUser) throw new BadRequestError('Email already in use');

    user.email = normalizedEmail;
  }

  if (first_name !== undefined) user.first_name = first_name.trim() || null;
  if (last_name !== undefined)  user.last_name  = last_name.trim()  || null;

  await user.save();

  return getUserResponse(user);
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) throw new BadRequestError('Current password is incorrect');

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return getUserResponse(user);
};

exports.getSecurityQuestions = () => {
  return Object.values(SECURITY_QUESTIONS).map(q => ({
    id: q.id,
    text: q.text,
  }));
};

exports.getUserSecurityQuestions = async (email) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.security_question_1 || !user.security_question_2) {
    throw new BadRequestError('Security questions not configured for this account');
  }

  const getQuestionDetails = (dbValue) => {
    const cleanValue = String(dbValue).trim();
    const list = Object.values(SECURITY_QUESTIONS);

    // 1. Direct match with our updated string IDs
    let match = list.find(q => String(q.id) === cleanValue);
    if (match) return match;

    // 2. Legacy Lookup Fallback: Map old index selections accurately
    const legacyMap = {
      '1': 'mother_maiden_name',
      '2': 'first_pet_name',
      '3': 'birth_city',
      '4': 'favorite_book',
      '5': 'high_school_name'
    };

    if (legacyMap[cleanValue]) {
      const realId = legacyMap[cleanValue];
      if (SECURITY_QUESTIONS[realId]) return SECURITY_QUESTIONS[realId];
    }

    return { id: dbValue, text: `Security Question #${dbValue}` };
  };

  const q1 = getQuestionDetails(user.security_question_1);
  const q2 = getQuestionDetails(user.security_question_2);

  return [
    { id: q1.id, text: q1.text },
    { id: q2.id, text: q2.text },
  ];
};

exports.verifySecurityAnswers = async (email, question_id_1, question_id_2, answer_1, answer_2) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    throw new BadRequestError('User not found');
  }

  if (!user.security_answer_1 || !user.security_answer_2) {
    throw new BadRequestError('Security questions not configured for this account');
  }

  // Get raw string representations from the DB and Request Payload
  const dbQ1 = String(user.security_question_1).trim();
  const dbQ2 = String(user.security_question_2).trim();
  const reqQ1 = String(question_id_1).trim();
  const reqQ2 = String(question_id_2).trim();

  // Legacy index map to match numeric entries to our new key layout
  const legacyMap = {
    '1': 'mother_maiden_name',
    '2': 'first_pet_name',
    '3': 'birth_city',
    '4': 'favorite_book',
    '5': 'high_school_name'
  };

  // Check if they match directly, OR match through the legacy numeric mapping layer
  const isValidQuestion1 = (reqQ1 === dbQ1 || legacyMap[dbQ1] === reqQ1 || legacyMap[reqQ1] === dbQ1);
  const isValidQuestion2 = (reqQ2 === dbQ2 || legacyMap[dbQ2] === reqQ2 || legacyMap[reqQ2] === dbQ2);

  if (!isValidQuestion1 || !isValidQuestion2) {
    throw new BadRequestError('Security questions validation mismatch');
  }

  // Verify the hashed answers securely
  const isAnswer1Valid = await bcrypt.compare(
    normalizeAnswer(answer_1),
    user.security_answer_1
  );

  const isAnswer2Valid = await bcrypt.compare(
    normalizeAnswer(answer_2),
    user.security_answer_2
  );

  if (!isAnswer1Valid || !isAnswer2Valid) {
    throw new BadRequestError('Security answers are incorrect');
  }

  // All looks good! Generate password reset configuration token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.password_reset_token = resetToken;
  user.password_reset_expires_at = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry
  await user.save();

  return {
    resetToken,
    message: 'Security answers verified. Use the reset token to change your password.',
  };
};

exports.resetPassword = async (resetToken, newPassword) => {
  const user = await User.findOne({
    where: {
      password_reset_token: resetToken,
      password_reset_expires_at: { [require('sequelize').Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new BadRequestError('Invalid or expired reset token');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.password_reset_token = null;
  user.password_reset_expires_at = null;
  await user.save();

  return getUserResponse(user);
};

exports.updateSecurityQuestions = async (userId, security_question_1, security_answer_1, security_question_2, security_answer_2) => {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  user.security_question_1 = security_question_1;
  user.security_answer_1 = await bcrypt.hash(normalizeAnswer(security_answer_1), 10);
  user.security_question_2 = security_question_2;
  user.security_answer_2 = await bcrypt.hash(normalizeAnswer(security_answer_2), 10);
  
  await user.save();

  return {
    success: true,
    message: 'Security questions updated successfully',
  };
};