import { useState } from 'react';
import Sidebar from '../components/layouts/sidebar.component';
import { useProfile, useUpdateProfile, useChangePassword } from '../hooks/use-profile.hook';
import SecurityQuestionsForm from '../components/authentication/security-questions-form.component';

function SettingsPage() {
  const { user } = useProfile();
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
          {activeSection === 'profile' && (
            <div className="settings-section-view">
              <ProfileForm key="profile-form" user={user} />
            </div>
          )}

          {activeSection === 'password' && (
            <div className="settings-section-view">
              <PasswordForm />
            </div>
          )}

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

function ProfileForm({ user }) {
  const { updateProfile, isLoading, message } = useUpdateProfile();

  const [profile, setProfile] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    email: user.email || '',
  });

  const [profileErrors, setProfileErrors] = useState({});

  const profileHasChanges =
    profile.first_name !== (user.first_name || '') ||
    profile.last_name !== (user.last_name || '') ||
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
    const firstNameValue = profile.first_name.trim();
    const lastNameValue = profile.last_name.trim();
    const emailValue = profile.email.trim().toLowerCase();

    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s'-]{1,49}$/;

    if (!firstNameValue) {
      errors.first_name = 'First name required';
    } else if (!nameRegex.test(firstNameValue)) {
      errors.first_name = 'Invalid name format. Use 2+ letters; no numbers or special characters allowed.';
    }

    if (!lastNameValue) {
      errors.last_name = 'Last name required';
    } else if (!nameRegex.test(lastNameValue)) {
      errors.last_name = 'Invalid name format. Use 2+ letters; no numbers or special characters allowed.';
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailValue) {
      errors.email = 'Email required';
    } else if (!emailRegex.test(emailValue)) {
      errors.email = 'Invalid email address format';
    }

    return errors;
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const errors = validateProfile();

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    updateProfile({
      firstName: profile.first_name.trim(),
      lastName: profile.last_name.trim(),
      email: profile.email.trim(),
    });
  };

  const handleProfileCancel = () => {
    setProfile({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
    });
    setProfileErrors({});
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
            <label htmlFor="first_name">First Name</label>
            <input
              id="first_name"
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleProfileChange}
              disabled={isLoading}
              className={profileErrors.first_name ? 'error' : ''}
            />
            {profileErrors.first_name && (
              <span className="error-message">{profileErrors.first_name}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input
              id="last_name"
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleProfileChange}
              disabled={isLoading}
              className={profileErrors.last_name ? 'error' : ''}
            />
            {profileErrors.last_name && (
              <span className="error-message">{profileErrors.last_name}</span>
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
            disabled={isLoading}
            className={profileErrors.email ? 'error' : ''}
          />
          {profileErrors.email && (
            <span className="error-message">{profileErrors.email}</span>
          )}
        </div>

        {message && (
          <div className={`message ${message.startsWith('Error') ? 'error-message-box' : 'success-message'}`}>
            {message}
          </div>
        )}

        <div className="form-actions" style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          <button
            type="submit"
            disabled={!profileHasChanges || isLoading}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '46px' }}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
          {profileHasChanges && (
            <button
              type="button"
              onClick={handleProfileCancel}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '46px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function PasswordForm() {
  const { changePassword, isLoading, message } = useChangePassword();

  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const passwordHasValues = !!(password.currentPassword || password.newPassword || password.confirmPassword);

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
    if (!password.currentPassword) errors.currentPassword = 'Current password required';
    if (!password.newPassword) {
      errors.newPassword = 'Password is required';
    } else if (password.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    } else if ((password.newPassword.match(/[A-Za-z]/g) || []).length < 2) {
      errors.newPassword = 'Password must contain at least 2 letters';
    } else if ((password.newPassword.match(/\d/g) || []).length < 2) {
      errors.newPassword = 'Password must contain at least 2 numbers';
    }

    if (password.newPassword !== password.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    return errors;
  };

  const getPasswordStrength = () => {
    const pwd = password.newPassword;
    const checks = {
      length: pwd.length >= 8,
      letters: (pwd.match(/[A-Za-z]/g) || []).length >= 2,
      numbers: (pwd.match(/\d/g) || []).length >= 2,
    };
    return checks;
  };

  const strength = getPasswordStrength();

  const handlePasswordSave = (e) => {
    e.preventDefault();
    const errors = validatePassword();
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    changePassword({
      currentPassword: password.currentPassword,
      newPassword: password.newPassword,
    });
  };

  const handlePasswordClear = () => {
    setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  };

  return (
    <div className="settings-section">
      <div className="section-header">
        <h2>Change Password</h2>
        <p>Keep your account secure with a strong password</p>
      </div>

      <form onSubmit={handlePasswordSave} className="settings-form">
        <div className="form-group">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            id="currentPassword"
            type="password"
            name="currentPassword"
            value={password.currentPassword}
            onChange={handlePasswordChange}
            disabled={isLoading}
            className={passwordErrors.currentPassword ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.currentPassword && (
            <span className="error-message">{passwordErrors.currentPassword}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            value={password.newPassword}
            onChange={handlePasswordChange}
            disabled={isLoading}
            className={passwordErrors.newPassword ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.newPassword && (
            <span className="error-message">{passwordErrors.newPassword}</span>
          )}

          {password.newPassword && (
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

          {!password.newPassword && (
            <span className="hint" style={{ fontSize: '0.85em', color: '#666', marginTop: '8px', display: 'block' }}>
              Password must contain at least 8 characters, 2 letters, and 2 numbers.
            </span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={password.confirmPassword}
            onChange={handlePasswordChange}
            disabled={isLoading}
            className={passwordErrors.confirmPassword ? 'error' : ''}
            placeholder="••••••••"
          />
          {passwordErrors.confirmPassword && (
            <span className="error-message">{passwordErrors.confirmPassword}</span>
          )}

          {password.confirmPassword && password.newPassword && (
            <span
              style={{
                fontSize: '0.85em',
                color: password.newPassword === password.confirmPassword ? '#22c55e' : '#ef4444',
                marginTop: '8px',
                display: 'block',
              }}
            >
              {password.newPassword === password.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
            </span>
          )}
        </div>

        {message && (
          <div className={`message ${message.startsWith('Error') ? 'error-message-box' : 'success-message'}`}>
            {message}
          </div>
        )}

        <div className="form-actions" style={{ display: 'flex', alignItems: 'stretch', gap: '12px' }}>
          <button
            type="submit"
            disabled={!passwordHasValues || isLoading}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '46px' }}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
          {passwordHasValues && (
            <button
              type="button"
              onClick={handlePasswordClear}
              disabled={isLoading}
              className="btn btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: '46px' }}
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