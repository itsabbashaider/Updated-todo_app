import { useState, useEffect, useRef } from 'react';
import { updateSecurityQuestions } from '../../services/auth.service';
import { getErrorMessage } from '../../utils/error-handler.util';

// Inside your SecurityQuestionsForm Component File (Top Section)

const SECURITY_QUESTIONS = [
  { id: 'mother_maiden_name', text: "What is your mother's maiden name?" },
  { id: 'first_pet_name', text: "What was your first pet's name?" },
  { id: 'birth_city', text: 'In what city were you born?' },
  { id: 'favorite_book', text: 'What is your favorite book?' },
  { id: 'high_school_name', text: 'What was the name of your high school?' }
];

function SecurityQuestionsForm() {
  const timeoutRef = useRef(null);

  const [questions, setQuestions] = useState({
    security_question_1: '',
    security_answer_1: '',
    security_question_2: '',
    security_answer_2: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestions(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateQuestions = () => {
    const newErrors = {};

    if (!questions.security_question_1) {
      newErrors.security_question_1 = 'First question is required';
    }
    if (!questions.security_answer_1?.trim()) {
      newErrors.security_answer_1 = 'First answer is required';
    }

    if (!questions.security_question_2) {
      newErrors.security_question_2 = 'Second question is required';
    }
    if (!questions.security_answer_2?.trim()) {
      newErrors.security_answer_2 = 'Second answer is required';
    }

    if (
      questions.security_question_1 &&
      questions.security_question_2 &&
      questions.security_question_1 === questions.security_question_2
    ) {
      newErrors.security_question_2 = 'Please select two different questions';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateQuestions();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setMessage('');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    try {
      // ✅ Call service with snake_case parameters
      await updateSecurityQuestions(
        questions.security_question_1,
        questions.security_answer_1.trim(),
        questions.security_question_2,
        questions.security_answer_2.trim()
      );

      setMessage('Security questions updated successfully');
      timeoutRef.current = setTimeout(() => setMessage(''), 4000);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestions({
      security_question_1: '',
      security_answer_1: '',
      security_question_2: '',
      security_answer_2: '',
    });
    setErrors({});
    setMessage('');
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Security Questions</h2>
        <p>Update your security questions for account recovery</p>
      </div>

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Question 1 */}
        <div className="form-group">
          <label htmlFor="security_question_1">First Security Question</label>
          <select
            id="security_question_1"
            name="security_question_1"
            value={questions.security_question_1}
            onChange={handleChange}
            disabled={loading}
            className={errors.security_question_1 ? 'error' : ''}
          >
            <option value="">Select a question</option>
            {SECURITY_QUESTIONS.map(q => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
          </select>
          {errors.security_question_1 && (
            <span className="error-message">{errors.security_question_1}</span>
          )}
        </div>

        {/* Answer 1 */}
        <div className="form-group">
          <label htmlFor="security_answer_1">Your Answer</label>
          <input
            id="security_answer_1"
            type="text"
            name="security_answer_1"
            value={questions.security_answer_1}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your answer"
            className={errors.security_answer_1 ? 'error' : ''}
          />
          {errors.security_answer_1 && (
            <span className="error-message">{errors.security_answer_1}</span>
          )}
        </div>

        {/* Question 2 */}
        <div className="form-group">
          <label htmlFor="security_question_2">Second Security Question</label>
          <select
            id="security_question_2"
            name="security_question_2"
            value={questions.security_question_2}
            onChange={handleChange}
            disabled={loading}
            className={errors.security_question_2 ? 'error' : ''}
          >
            <option value="">Select a question</option>
            {SECURITY_QUESTIONS.map(q => (
              <option key={q.id} value={q.id}>
                {q.text}
              </option>
            ))}
          </select>
          {errors.security_question_2 && (
            <span className="error-message">{errors.security_question_2}</span>
          )}
        </div>

        {/* Answer 2 */}
        <div className="form-group">
          <label htmlFor="security_answer_2">Your Answer</label>
          <input
            id="security_answer_2"
            type="text"
            name="security_answer_2"
            value={questions.security_answer_2}
            onChange={handleChange}
            disabled={loading}
            placeholder="Enter your answer"
            className={errors.security_answer_2 ? 'error' : ''}
          />
          {errors.security_answer_2 && (
            <span className="error-message">{errors.security_answer_2}</span>
          )}
        </div>

        {message && (
          <div className={`message ${message.startsWith('Error') ? 'error-message-box' : 'success-message'}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Updating...' : 'Update Questions'}
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

export default SecurityQuestionsForm;