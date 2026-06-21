import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../services/auth.service';
import { getSecurityQuestions } from '../services/reset-pass.service';
import { getErrorMessage } from '../utils/error-handler.util';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
  });
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await getSecurityQuestions();
        setQuestions(response.data.data);
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
      }
    };

    fetchQuestions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (!formData.securityQuestion1 || !formData.securityAnswer1) {
      setError('Please answer security question 1');
      return false;
    }

    if (!formData.securityQuestion2 || !formData.securityAnswer2) {
      setError('Please answer security question 2');
      return false;
    }

    if (formData.securityQuestion1 === formData.securityQuestion2) {
      setError('Please select two different security questions');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.securityQuestion1,
        formData.securityAnswer1,
        formData.securityQuestion2,
        formData.securityAnswer2,
      );
      navigate('/');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h1>Create Account</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Row 1: Name Profile Details */}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 2: Contact Info & Password Splits */}
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-row" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #30363d', margin: '12px 0 24px 0' }} />

          {/* Row 3: Dual Column Verification Questions */}
          <div className="form-row">
            
            {/* Left Column Security Block */}
            <div className="question-block">
              <div className="form-group">
                <label style={{ color: '#58a6ff', fontWeight: '600' }}>Security Question 1</label>
                <select
                  name="securityQuestion1"
                  value={formData.securityQuestion1}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a question</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="securityAnswer1"
                  value={formData.securityAnswer1}
                  onChange={handleChange}
                  placeholder="Your answer"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Right Column Security Block */}
            <div className="question-block">
              <div className="form-group">
                <label style={{ color: '#58a6ff', fontWeight: '600' }}>Security Question 2</label>
                <select
                  name="securityQuestion2"
                  value={formData.securityQuestion2}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select a question</option>
                  {questions.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.text}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  name="securityAnswer2"
                  value={formData.securityAnswer2}
                  onChange={handleChange}
                  placeholder="Your answer"
                  required
                  disabled={loading}
                />
              </div>
            </div>

          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-links">
          <p style={{ margin: 0, color: '#8b949e' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;