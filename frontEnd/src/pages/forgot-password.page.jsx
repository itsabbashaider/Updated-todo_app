import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPasswordPage() {
  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/users/security-questions');
      if (!response.ok) throw new Error('Failed to load security questions');

      // Store email and navigate to answer questions
      sessionStorage.setItem('forgotPasswordEmail', email);
      navigate('/verify-security-answers');
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to verify your identity</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              placeholder="your@email.com"
            />
          </div>

          {error && <div className="error-message-box">{error}</div>}

          <button type="submit" disabled={!email || loading} className="btn btn-primary">
            {loading ? 'Loading...' : 'Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/login">Back to login</a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;