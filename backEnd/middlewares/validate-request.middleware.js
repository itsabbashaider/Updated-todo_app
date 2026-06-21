// ─── Dependencies ─────────────────────────────────────────────────────────────
const { ValidationError } = require('../errors');

// ─── Validate Request ─────────────────────────────────────────────────────────
const validateRequest = (schema, source = 'body') => (req, res, next) => {

  // ─── Resolve Source ─────────────────────────────────────────────────────────
  let dataToValidate;

  switch (source) {
    case 'query'  : dataToValidate = req.query;  break;
    case 'params' : dataToValidate = req.params; break;
    case 'body'   :
    default       : dataToValidate = req.body;   break;
  }

  // ─── Validate ───────────────────────────────────────────────────────────────
  const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

  if (error) {
    const details = error.details.map((err) => ({
      field   : err.path.join('.'),
      message : err.message,
    }));

    return next(new ValidationError('Validation failed', details));
  }

  // ─── Assign Validated Value ──────────────────────────────────────────────────
  if      (source === 'query')  req.query  = value;
  else if (source === 'params') req.params = value;
  else                          req.body   = value;

  next();
};

module.exports = validateRequest;