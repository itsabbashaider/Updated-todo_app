const HTTP_STATUSES = require('../constants/http-status.constant');

// Helper: Levenshtein Distance function to catch domain typos
function getEditDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Complete Express Middleware to Validate Profile Updates
const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, email } = req.body;

  // 1. Check for missing fields
  if (!firstName || !lastName || !email) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({ 
      success: false,
      error: { message: 'First name, last name, and email are required.' } 
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // 2. Structural Regex Check
  if (/\.\./.test(cleanEmail) || !emailRegex.test(cleanEmail)) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({ 
      success: false,
      error: { message: 'Invalid email address format.' } 
    });
  }

  const domain = cleanEmail.split('@')[1] || '';

  // 3. Block `.co` variations explicitly
  if (domain.endsWith('.co')) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({ 
      success: false,
      error: { message: 'Did you mean .com? Please check your email ending.' } 
    });
  }

  // 4. Matrix of Known Typos (Blocks mail.com, ail.com, gamil.com etc.)
  const KNOWN_TYPO_DOMAINS = [
    'mail.com', 'gamil.com', 'gmial.com', 'gmal.com', 
    'gmaill.com', 'ail.com', 'yaho.com', 'vahoo.com', 
    'hotmial.com', 'hotmale.com'
  ];

  if (KNOWN_TYPO_DOMAINS.includes(domain)) {
    return res.status(HTTP_STATUSES.BAD_REQUEST).json({ 
      success: false,
      error: { message: 'Invalid or misspelled email provider domain detected. Please verify your address.' } 
    });
  }

  // 5. Fuzzy Match Check against popular providers
  const ALLOWED_PROVIDERS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  
  if (!ALLOWED_PROVIDERS.includes(domain)) {
    for (const trusted of ALLOWED_PROVIDERS) {
      const distance = getEditDistance(domain, trusted);
      if (distance > 0 && distance <= 2) {
        return res.status(HTTP_STATUSES.BAD_REQUEST).json({ 
          success: false,
          error: { message: `Typo detected. Did you mean "@${trusted}"? Please check your spelling.` } 
        });
      }
    }
  }

  // If validation passes, append cleaned email and pass control forward
  req.body.email = cleanEmail;
  next();
};

module.exports = { validateProfileUpdate };