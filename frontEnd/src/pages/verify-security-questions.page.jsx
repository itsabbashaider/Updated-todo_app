import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getSecurityQuestionsByEmail,
  verifySecurityAnswers,
} from '../services/reset-pass.service';
import { password_reset } from '../services/storage.service';
import { getErrorMessage } from '../utils/error-handler.util';

const VerifySecurityAnswersPage = () => {
  const [email] = useState(() => password_reset.getForgotPasswordEmail() || '');
  const [userQuestions, setUserQuestions] = useState(null);
  const [answers, setAnswers] = useState({ answer1: '', answer2: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    const fetchUserQuestions = async () => {
      try {
        const response = await getSecurityQuestionsByEmail(email);
        setUserQuestions(response.data.data);
        setError('');
      } catch (err) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        setUserQuestions(null);
      }
    };

    fetchUserQuestions();
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    // Validate answers are not empty
    if (!answers.answer1.trim() || !answers.answer2.trim()) {
      setError('Please answer both security questions');
      return;
    }

    setLoading(true);

    try {
      const response = await verifySecurityAnswers(
        email,
        userQuestions[0].id,
        userQuestions[1].id,
        answers.answer1,
        answers.answer2,
      );

      const resetToken = response.data.data.resetToken;
      password_reset.saveResetToken(resetToken);
      navigate('/reset-password');
    } catch (err) {
      const errorMsg = getErrorMessage(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while fetching questions
  if (!userQuestions && !error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Identity</h2>
          <p>Loading your security questions...</p>
          <div className="loading-spinner" style={{ marginTop: '20px' }}>
            {/* You can add a spinner component here */}
          </div>
        </div>
      </div>
    );
  }

  // Error state (no questions found)
  if (error && !userQuestions) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>Verify Your Identity</h2>
          <div className="error-message-box" style={{ marginBottom: '20px' }}>
            {error}
          </div>
          <div className="auth-footer">
            <a href="/forgot-password">← Back to Forgot Password</a>
          </div>
        </div>
      </div>
    );
  }

  // Success state - show verification form
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Identity</h2>
        <p>Answer your security questions to reset your password</p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label htmlFor="answer1">Security Question 1</label>
            <p className="question-text">{userQuestions?.[0]?.text}</p>
            <input
              id="answer1"
              type="text"
              value={answers.answer1}
              onChange={(e) => setAnswers(prev => ({ ...prev, answer1: e.target.value }))}
              disabled={loading}
              required
              placeholder="Your answer"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="answer2">Security Question 2</label>
            <p className="question-text">{userQuestions?.[1]?.text}</p>
            <input
              id="answer2"
              type="text"
              value={answers.answer2}
              onChange={(e) => setAnswers(prev => ({ ...prev, answer2: e.target.value }))}
              disabled={loading}
              required
              placeholder="Your answer"
              autoComplete="off"
            />
          </div>

          {error && <div className="error-message-box">{error}</div>}

          <button
            type="submit"
            disabled={!answers.answer1.trim() || !answers.answer2.trim() || loading}
            className="btn btn-primary"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="auth-footer">
          <a href="/forgot-password">← Back to Forgot Password</a>
        </div>
      </div>
    </div>
  );
};

export default VerifySecurityAnswersPage;