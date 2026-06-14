import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import { useProfile } from '../hooks/use-profile.hook';
import { useProfileRefresh } from '../contexts/profile.context';
import SecurityQuestionsForm from '../components/authentication/security-questions-form.component';
import {
  updateProfile,
  changePassword,
} from '../services/auth.service';
import { getErrorMessage } from '../utils/error-handler.util';

// ==========================================
// 1. MAIN PARENT PAGE COMPONENT
// ==========================================
function SettingsPage() {
  const { user, mutate } = useProfile();
  const { triggerRefresh } = useProfileRefresh();
  const [activeSection, setActiveSection] = useState('profile');

  if (!user) {
    return (
      <div className="settings-layout">
        <Sidebar />
        <main className="settings-main">
          <div className="settings-header">
            <h1>Settings</h1>
            <p>Loading your account configurations...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="settings-layout">
      <Sidebar />
      <main className="settings-main">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Manage your account and preferences</p>
        </div>

        {/* Navigation Section */}
        <div className="settings-nav">
          <div className="nav-container">
            <button
              className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
              <span className="nav-desc">Name & Email</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'password' ? 'active' : ''}`}
              onClick={() => setActiveSection('password')}
            >
              <span className="nav-icon">🔑</span>
              <span className="nav-label">Password</span>
              <span className="nav-desc">Change or reset</span>
            </button>

            <button
              className={`nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={() => setActiveSection('security')}
            >
              <span className="nav-icon">🛡️</span>
              <span className="nav-label">Security</span>
              <span className="nav-desc">Questions & verification</span>
            </button>
          </div>
        </div>

        <div className="settings-wrapper">
          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="settings-section-view">
              <ProfileForm
                key={user.email || 'profile-form'}
                user={user}
                onRefreshProfile={() => {
                  mutate();
                  triggerRefresh();
                }}
              />
            </div>
          )}

          {/* Password Section */}
          {activeSection === 'password' && (
            <div className="settings-section-view">
              <PasswordForm />
            </div>
          )}

          {/* Security Questions Section */}
          {activeSection === 'security' && (
            <div className="settings-section-view">
              <SecurityQuestionsForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 2. CHILD PROFILE FORM COMPONENT
// ==========================================
function ProfileForm({ user, onRefreshProfile }) {
  const profileTimeoutRef = useRef(null);

  const [profile, setProfile] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  useEffect(() => {
    return () => {
      if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
    };
  }, []);

  const profileHasChanges =
    profile.firstName !== (user.firstName || '') ||
    profile.lastName !== (user.lastName || '') ||
    profile.email !== (user.email || '');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateProfile = () => {
    const errors = {};
    const firstNameValue = profile.firstName.trim();
    const lastNameValue = profile.lastName.trim();
    const emailValue = profile.email.trim().toLowerCase();

    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'-]{1,49}$/;

    if (!firstNameValue) {
      errors.firstName = 'First name required';
    } else if (!nameRegex.test(firstNameValue)) {
      errors.firstName = 'Invalid name format. Use 2+ letters; no numbers or special characters allowed.';
    }

    if (!lastNameValue) {
      errors.lastName = 'Last name required';
    } else if (!nameRegex.test(lastNameValue)) {
      errors.lastName = 'Invalid name format. Use 2+ letters; no numbers or special characters allowed.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailValue) {
      errors.email = 'Email required';
    } else if (!emailRegex.test(emailValue)) {
      errors.email = 'Invalid email address format';
    }

    return errors;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const errors = validateProfile();

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileLoading(true);
    setProfileMessage('');
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);

    try {
      // ✅ USE SERVICE INSTEAD OF FETCH
      await updateProfile({
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        email: profile.email.trim(),
      });

      setProfileMessage('Changes saved successfully');

      if (typeof onRefreshProfile === 'function') {
        await onRefreshProfile();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      profileTimeoutRef.current = setTimeout(() => setProfileMessage(''), 4000);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setProfileMessage(`Error: ${errorMsg}`);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileCancel = () => {
    setProfile({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    });
    setProfileErrors({});
    setProfileMessage('');
    if (profileTimeoutRef.current) clearTimeout(profileTimeoutRef.current);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Profile Information</h2>
        <p>Update your personal details</p>
      </div>

      <form onSubmit={handleProfileSave} className="settings-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={profile.firstName}
              onChange={handleProfileChange}
              disabled={profileLoading}
              className={profileErrors.firstName ? 'error' : ''}
            />
            {profileErrors.firstName && (
              <span className="error-message">{profileErrors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={profile.lastName}
              onChange={handleProfileChange}
              disabled={profileLoading}
              className={profileErrors.lastName ? 'error' : ''}
            />
            {profileErrors.lastName && (
              <span className="error-message">{profileErrors.lastName}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={profile.email}
            onChange={handleProfileChange}
            disabled={profileLoading}
            className={profileErrors.email ? 'error' : ''}
          />
          {profileErrors.email && (
            <span className="error-message">{profileErrors.email}</span>
          )}
        </div>

        {profileMessage && (
          <div className={`message ${profileMessage.startsWith('Error') ? 'error-message-box' : 'success-message'}`}>
            {profileMessage}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={!profileHasChanges || profileLoading}
            className="btn btn-primary"
          >
            {profileLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {profileHasChanges && (
            <button
              type="button"
              onClick={handleProfileCancel}
              disabled={profileLoading}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 3. CHILD PASSWORD FORM COMPONENT
// ==========================================
function PasswordForm() {
  const passwordTimeoutRef = useRef(null);

  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    return () => {
      if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
    };
  }, []);

  const passwordHasValues = !!(password.current || password.new || password.confirm);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) {
      setPasswordErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!password.current) errors.current = 'Current password required';
    if (!password.new) {
      errors.new = 'Password is required';
    } else if (password.new.length < 8) {
      errors.new = 'Password must be at least 8 characters';
    } else if ((password.new.match(/[A-Za-z]/g) || []).length < 2) {
      errors.new = 'Password must contain at least 2 letters';
    } else if ((password.new.match(/\d/g) || []).length < 2) {
      errors.new = 'Password must contain at least 2 numbers';
    }

    if (password.new !== password.confirm) {
      errors.confirm = 'Passwords do not match';
    }
    return errors;
  };

  const getPasswordStrength = () => {
    const pwd = password.new;
    const checks = {
      length: pwd.length >= 8,
      letters: (pwd.match(/[A-Za-z]/g) || []).length >= 2,
      numbers: (pwd.match(/\d/g) || []).length >= 2,
    };
    return checks;
  };

  const strength = getPasswordStrength();

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage('');
    if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);

    try {
      // ✅ USE SERVICE INSTEAD OF FETCH
      await changePassword(password.current, password.new);

      setPassword({ current: '', new: '', confirm: '' });
      setPasswordMessage('Password changed successfully');
      passwordTimeoutRef.current = setTimeout(() => setPasswordMessage(''), 4000);
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      setPasswordMessage(`Error: ${errorMsg}`);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordClear = () => {
    setPassword({ current: '', new: '', confirm: '' });
    setPasswordErrors({});
    setPasswordMessage('');
    if (passwordTimeoutRef.current) clearTimeout(passwordTimeoutRef.current);
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Change Password</h2>
        <p>Keep your account secure with a strong password</p>
      </div>

      <form onSubmit={handlePasswordSave} className="settings-form">
        <div className="form-group">
          <label htmlFor="current">Current Password</label>
          <input
            id="current"
            type="password"
            name="current"
            value={password.current}
            onChange={handlePasswordChange}
            disabled={passwordLoading}
            className={passwordErrors.current ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.current && (
            <span className="error-message">{passwordErrors.current}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="new">New Password</label>
          <input
            id="new"
            type="password"
            name="new"
            value={password.new}
            onChange={handlePasswordChange}
            disabled={passwordLoading}
            className={passwordErrors.new ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.new && (
            <span className="error-message">{passwordErrors.new}</span>
          )}

          {password.new && (
            <div className="password-requirements" style={{ marginTop: '16px', fontSize: '0.85em' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: strength.length ? '#22c55e' : '#999' }}>
                <span>{strength.length ? '✓' : '○'}</span>
                <span>At least 8 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: strength.letters ? '#22c55e' : '#999' }}>
                <span>{strength.letters ? '✓' : '○'}</span>
                <span>At least 2 letters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: strength.numbers ? '#22c55e' : '#999' }}>
                <span>{strength.numbers ? '✓' : '○'}</span>
                <span>At least 2 numbers</span>
              </div>
            </div>
          )}

          {!password.new && (
            <span className="hint" style={{ fontSize: '0.85em', color: '#666', marginTop: '8px', display: 'block' }}>
              Password must contain at least 8 characters, 2 letters, and 2 numbers.
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirm">Confirm Password</label>
          <input
            id="confirm"
            type="password"
            name="confirm"
            value={password.confirm}
            onChange={handlePasswordChange}
            disabled={passwordLoading}
            className={passwordErrors.confirm ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.confirm && (
            <span className="error-message">{passwordErrors.confirm}</span>
          )}

          {password.confirm && password.new && (
            <span
              style={{
                fontSize: '0.85em',
                color: password.new === password.confirm ? '#22c55e' : '#ef4444',
                marginTop: '8px',
                display: 'block',
              }}
            >
              {password.new === password.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
            </span>
          )}
        </div>

        {passwordMessage && (
          <div className={`message ${passwordMessage.startsWith('Error') ? 'error-message-box' : 'success-message'}`}>
            {passwordMessage}
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            disabled={!passwordHasValues || passwordLoading}
            className="btn btn-primary"
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
          {passwordHasValues && (
            <button
              type="button"
              onClick={handlePasswordClear}
              disabled={passwordLoading}
              className="btn btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default SettingsPage;