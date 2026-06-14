import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/reset-pass.service';
import { password_reset } from '../services/storage.service';
import { getErrorMessage } from '../utils/error-handler.util';

function ResetPasswordPage() {
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const navigate = useNavigate();
  const [resetToken] = useState(() => password_reset.getResetToken() || '');
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!resetToken) {
      navigate('/forgot-password');
    }
  }, [resetToken, navigate]);

  const validatePassword = () => {
    const errors = {};

    if (!passwords.new) {
      errors.new = 'Password is required';
    } else if (passwords.new.length < 8) {
      errors.new = 'Password must be at least 8 characters';
    } else if ((passwords.new.match(/[A-Za-z]/g) || []).length < 2) {
      errors.new = 'Password must contain at least 2 letters';
    } else if ((passwords.new.match(/\d/g) || []).length < 2) {
      errors.new = 'Password must contain at least 2 numbers';
    }

    if (passwords.new !== passwords.confirm) {
      errors.confirm = 'Passwords do not match';
    }

    return errors;
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));

    // Clear errors when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear confirm error if passwords now match
    if (name === 'new' && passwordErrors.confirm) {
      if (value === passwords.confirm) {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirm;
          return newErrors;
        });
      }
    } else if (name === 'confirm' && passwordErrors.confirm) {
      if (value === passwords.new) {
        setPasswordErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.confirm;
          return newErrors;
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(resetToken, passwords.new);

      setSuccess('Password reset successfully! Redirecting to login...');
      password_reset.clearPasswordResetFlow();

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const pwd = passwords.new;
    const checks = {
      length: pwd.length >= 8,
      letters: (pwd.match(/[A-Za-z]/g) || []).length >= 2,
      numbers: (pwd.match(/\d/g) || []).length >= 2,
    };
    return checks;
  };

  const strength = getPasswordStrength();
  const allChecksPassed = strength.length && strength.letters && strength.numbers;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p>Create a new password for your account</p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="newPassword">New Password *</label>
            <input
              id="newPassword"
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordChange}
              disabled={loading}
              required
              placeholder="••••••••"
              className={passwordErrors.new ? 'error' : ''}
              aria-label="New password"
            />
            {passwordErrors.new && (
              <span className="error-message" role="alert">{passwordErrors.new}</span>
            )}

            {/* Password requirements hint */}
            {passwords.new && (
              <div className="password-requirements" style={{ marginTop: '12px', fontSize: '0.85em' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: strength.length ? '#22c55e' : '#999' }}>
                  <span>{strength.length ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: strength.letters ? '#22c55e' : '#999' }}>
                  <span>{strength.letters ? '✓' : '○'}</span>
                  <span>At least 2 letters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: strength.numbers ? '#22c55e' : '#999' }}>
                  <span>{strength.numbers ? '✓' : '○'}</span>
                  <span>At least 2 numbers</span>
                </div>
              </div>
            )}

            {/* Default hint when not typing */}
            {!passwords.new && (
              <span className="hint" style={{ fontSize: '0.85em', color: '#666', marginTop: '8px', display: 'block' }}>
                Password must contain at least 8 characters, 2 letters, and 2 numbers.
              </span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              disabled={loading}
              required
              placeholder="••••••••"
              className={passwordErrors.confirm ? 'error' : ''}
              aria-label="Confirm password"
            />
            {passwordErrors.confirm && (
              <span className="error-message" role="alert">{passwordErrors.confirm}</span>
            )}

            {/* Show match status */}
            {passwords.confirm && passwords.new && (
              <span
                style={{
                  fontSize: '0.85em',
                  color: passwords.new === passwords.confirm ? '#22c55e' : '#ef4444',
                  marginTop: '8px',
                  display: 'block',
                }}
              >
                {passwords.new === passwords.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message-box" role="alert">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="success-message" role="status">
              {success}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={!passwords.new || !passwords.confirm || !allChecksPassed || loading}
            className="btn btn-primary"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;