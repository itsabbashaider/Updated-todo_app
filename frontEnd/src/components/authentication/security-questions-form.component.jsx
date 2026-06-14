import { useEffect, useState, useRef } from 'react';

function SecurityQuestionsForm() {
  const securityTimeoutRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState('');
  
  const [securityData, setSecurityData] = useState({
    securityQuestion1: '',
    securityAnswer1: '',
    securityQuestion2: '',
    securityAnswer2: '',
  });

  const [securityErrors, setSecurityErrors] = useState({});
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState('');

  // ✅ Load all available questions for the dropdown
  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      try {
        const response = await fetch('/api/users/security-questions');
        if (!response.ok) throw new Error('Failed to load questions');
        const data = await response.json();
        setQuestions(data.data || []);
        setQuestionsError('');
      } catch (err) {
        setQuestionsError(`Error loading questions: ${err.message}`);
        setQuestions([]);
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();

    return () => {
      if (securityTimeoutRef.current) clearTimeout(securityTimeoutRef.current);
    };
  }, []);

  const handleSecurityChange = (e) => {
    const { name, value } = e.target;
    setSecurityData(prev => ({ ...prev, [name]: value }));
    
    // ✅ Clear field-specific errors when user starts typing
    if (securityErrors[name]) {
      setSecurityErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // ✅ Clear cross-field error when user changes a question
    if (name.startsWith('securityQuestion')) {
      if (securityErrors.securityQuestion2) {
        setSecurityErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.securityQuestion2;
          return newErrors;
        });
      }
    }
  };

  const validateSecurity = () => {
    const errors = {};

    // Question 1 validation
    if (!securityData.securityQuestion1) {
      errors.securityQuestion1 = 'Please select security question 1';
    }

    // Answer 1 validation
    if (!securityData.securityAnswer1.trim()) {
      errors.securityAnswer1 = 'Answer required';
    } else if (securityData.securityAnswer1.trim().length < 2) {
      errors.securityAnswer1 = 'Answer must be at least 2 characters';
    }

    // Question 2 validation
    if (!securityData.securityQuestion2) {
      errors.securityQuestion2 = 'Please select security question 2';
    }

    // Answer 2 validation
    if (!securityData.securityAnswer2.trim()) {
      errors.securityAnswer2 = 'Answer required';
    } else if (securityData.securityAnswer2.trim().length < 2) {
      errors.securityAnswer2 = 'Answer must be at least 2 characters';
    }

    // ✅ Ensure two different questions are selected
    if (securityData.securityQuestion1 && securityData.securityQuestion2 && 
        securityData.securityQuestion1 === securityData.securityQuestion2) {
      errors.securityQuestion2 = 'Please select a different question than question 1';
    }

    return errors;
  };

  const handleSecuritySave = async (e) => {
    e.preventDefault();
    const errors = validateSecurity();

    if (Object.keys(errors).length > 0) {
      setSecurityErrors(errors);
      return;
    }

    setSecurityLoading(true);
    setSecurityMessage('');
    if (securityTimeoutRef.current) clearTimeout(securityTimeoutRef.current);

    try {
      const response = await fetch('/api/users/security-questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          securityQuestion1: securityData.securityQuestion1,
          // ✅ Send trimmed answer (backend will normalize: trim + lowercase)
          securityAnswer1: securityData.securityAnswer1.trim(),
          securityQuestion2: securityData.securityQuestion2,
          // ✅ Send trimmed answer (backend will normalize: trim + lowercase)
          securityAnswer2: securityData.securityAnswer2.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || 'Failed to update security questions');
      }

      setSecurityMessage('Security questions saved successfully');
      
      // ✅ Clear form after successful save
      setSecurityData({
        securityQuestion1: '',
        securityAnswer1: '',
        securityQuestion2: '',
        securityAnswer2: '',
      });
      setSecurityErrors({});

      securityTimeoutRef.current = setTimeout(() => setSecurityMessage(''), 4000);
    } catch (error) {
      setSecurityMessage(`Error: ${error.message}`);
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleSecurityClear = () => {
    // ✅ Ask for confirmation before clearing
    if (securityData.securityQuestion1 || securityData.securityAnswer1 || 
        securityData.securityQuestion2 || securityData.securityAnswer2) {
      if (!window.confirm('Are you sure you want to clear all fields?')) {
        return;
      }
    }

    setSecurityData({
      securityQuestion1: '',
      securityAnswer1: '',
      securityQuestion2: '',
      securityAnswer2: '',
    });
    setSecurityErrors({});
    setSecurityMessage('');
    if (securityTimeoutRef.current) clearTimeout(securityTimeoutRef.current);
  };

  // ✅ Check if form has any data entered
  const hasFormData = !!(
    securityData.securityQuestion1 || securityData.securityAnswer1 || 
    securityData.securityQuestion2 || securityData.securityAnswer2
  );

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Security Backup</h2>
        <p>Add security questions to recover your account if you forget your password</p>
      </div>

      {/* ✅ Show loading state while fetching questions */}
      {questionsLoading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading security questions...
        </div>
      )}

      {/* ✅ Show error if questions fail to load */}
      {questionsError && (
        <div className="error-message-box" style={{ marginBottom: '20px' }}>
          {questionsError}
        </div>
      )}

      {/* Show form only if questions loaded successfully */}
      {!questionsLoading && questions.length > 0 && (
        <form onSubmit={handleSecuritySave} className="settings-form">
          
          <div className="security-grid">

            <div className="form-group">
              <label htmlFor="securityQuestion1">Security Question 1 *</label>
              <select
                id="securityQuestion1"
                name="securityQuestion1"
                value={securityData.securityQuestion1}
                onChange={handleSecurityChange}
                disabled={securityLoading}
                className={securityErrors.securityQuestion1 ? 'error' : ''}
              >
                <option value="">Select a question</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.text}
                  </option>
                ))}
              </select>

              {securityErrors.securityQuestion1 && (
                <span className="error-message">
                  {securityErrors.securityQuestion1}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="securityAnswer1">Your Answer *</label>
              <input
                id="securityAnswer1"
                type="text"
                name="securityAnswer1"
                value={securityData.securityAnswer1}
                onChange={handleSecurityChange}
                disabled={securityLoading}
                className={securityErrors.securityAnswer1 ? 'error' : ''}
                placeholder="Your answer"
                autoComplete="off"
              />

              {securityErrors.securityAnswer1 && (
                <span className="error-message">
                  {securityErrors.securityAnswer1}
                </span>
              )}

              <span className="hint">
                Keep your answer simple and memorable
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="securityQuestion2">Security Question 2 *</label>
              <select
                id="securityQuestion2"
                name="securityQuestion2"
                value={securityData.securityQuestion2}
                onChange={handleSecurityChange}
                disabled={securityLoading}
                className={securityErrors.securityQuestion2 ? 'error' : ''}
              >
                <option value="">Select a question</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.text}
                  </option>
                ))}
              </select>

              {securityErrors.securityQuestion2 && (
                <span className="error-message">
                  {securityErrors.securityQuestion2}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="securityAnswer2">Your Answer *</label>
              <input
                id="securityAnswer2"
                type="text"
                name="securityAnswer2"
                value={securityData.securityAnswer2}
                onChange={handleSecurityChange}
                disabled={securityLoading}
                className={securityErrors.securityAnswer2 ? 'error' : ''}
                placeholder="Your answer"
                autoComplete="off"
              />

              {securityErrors.securityAnswer2 && (
                <span className="error-message">
                  {securityErrors.securityAnswer2}
                </span>
              )}

              <span className="hint">
                Keep your answer simple and memorable
              </span>
            </div>

          </div>

          {securityMessage && (
            <div
              className={`message ${
                securityMessage.startsWith('Error')
                  ? 'error-message-box'
                  : 'success-message'
              }`}
            >
              {securityMessage}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={securityLoading || !hasFormData}
              className="btn btn-primary"
            >
              {securityLoading
                ? 'Saving...'
                : 'Save Security Questions'}
            </button>

            {hasFormData && (
              <button
                type="button"
                onClick={handleSecurityClear}
                disabled={securityLoading}
                className="btn btn-secondary"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      )}

      {/* Show message if no questions available */}
      {!questionsLoading && questions.length === 0 && !questionsError && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          No security questions available at this time.
        </div>
      )}
    </div>
  );
}

export default SecurityQuestionsForm;