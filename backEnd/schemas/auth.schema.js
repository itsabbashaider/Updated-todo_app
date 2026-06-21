const Joi = require('joi');

exports.signupSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'string.max': 'Password must not exceed 50 characters',
      'any.required': 'Password is required',
    }),

  first_name: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'First name must not exceed 50 characters',
    }),

  last_name: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Last name must not exceed 50 characters',
    }),

  security_question_1: Joi.string()
    .required()
    .messages({
      'any.required': 'First security question is required',
    }),

  security_answer_1: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to first security question is required',
    }),

  security_question_2: Joi.string()
    .required()
    .messages({
      'any.required': 'Second security question is required',
    }),

  security_answer_2: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to second security question is required',
    }),
}).custom((value, helpers) => {
  if (value.security_question_1 === value.security_question_2) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Two different security questions');

exports.loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

exports.changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must not exceed 50 characters',
      'any.required': 'New password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
}).custom((value, helpers) => {
  if (value.currentPassword === value.newPassword) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'New password must be different from current password');

exports.resetPasswordSchema = Joi.object({
  resetToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
    }),

  newPassword: Joi.string()
    .min(6)
    .max(50)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters',
      'string.max': 'New password must not exceed 50 characters',
      'any.required': 'New password is required',
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
    }),
});

exports.updateSecurityQuestionsSchema = Joi.object({
  security_question_1: Joi.string()
    .required()
    .messages({
      'any.required': 'First security question is required',
    }),

  security_answer_1: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to first security question is required',
    }),

  security_question_2: Joi.string()
    .required()
    .messages({
      'any.required': 'Second security question is required',
    }),

  security_answer_2: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to second security question is required',
    }),
}).custom((value, helpers) => {
  if (value.security_question_1 === value.security_question_2) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'Two different security questions');

exports.updateProfileSchema = Joi.object({
  first_name: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'First name must not exceed 50 characters',
    }),

  last_name: Joi.string()
    .trim()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Last name must not exceed 50 characters',
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
});

exports.verifySecurityAnswersSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),

  question_id_1: Joi.string()
    .required()
    .messages({
      'any.required': 'First question ID is required',
    }),

  question_id_2: Joi.string()
    .required()
    .messages({
      'any.required': 'Second question ID is required',
    }),

  answer_1: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to first question is required',
    }),

  answer_2: Joi.string()
    .trim()
    .required()
    .messages({
      'any.required': 'Answer to second question is required',
    }),
});