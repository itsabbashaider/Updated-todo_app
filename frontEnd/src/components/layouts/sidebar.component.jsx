import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { logout } from '../../services/auth.service';
import { useProfile } from '../../hooks/use-profile.hook';
import { useProfileRefresh } from '../../contexts/profile.context';

import ConfirmModal from '../modals/confirmation-modal.component';

import {
  Home,
  CheckSquare,
  Calendar,
  BarChart2,
  ArrowLeft,
  ArrowRight,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef(null);

  const { user, loading, error, refetch } = useProfile();
  const { refreshTrigger } = useProfileRefresh(); // Listen for refresh signals

  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState === 'true';
  });

  const [profileExpanded, setProfileExpanded] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Refetch when refreshTrigger changes (i.e., when profile is saved)
  useEffect(() => {
    if (refetch) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileExpanded(false);
      }
    };
    if (profileExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileExpanded]);

  const menuItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Tasks', icon: <CheckSquare />, path: '/tasks' },
    { label: 'Calendar', icon: <Calendar />, path: '/calendar' },
    { label: 'Analytics', icon: <BarChart2 />, path: '/analytics' },
  ];

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
    if (newState) setProfileExpanded(false);
  };

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
    setProfileExpanded(false);
  };

  const getAccountName = () => {
    if (loading) return 'Loading...';
    if (!user) return 'Account';
    const full = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    if (full) return full;
    if (user.username) return user.username;
    if (user.email) return user.email.split('@')[0];
    return 'Account';
  };

  const getAccountEmail = () => {
    if (!user) return '';
    return user.email || '';
  };

  const getAvatarLetter = () => {
    if (loading || !user) return '?';
    const name = getAccountName();
    return name.charAt(0).toUpperCase();
  };

  return (
    <>
      <aside className={`modern-sidebar ${collapsed ? 'collapsed' : ''}`}>

        {/* TOP SECTION */}
        <div className="sidebar-top">
          <div className="logo-wrapper">
            {!collapsed && (
              <div>
                <h2>TaskFlow</h2>
                <p>Productivity Hub</p>
              </div>
            )}
          </div>
          <div className="sidebar-collapse">
            <button
              className="collapse-btn"
              onClick={handleCollapse}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed
                ? <ArrowRight size={16} strokeWidth={3} />
                : <ArrowLeft size={16} strokeWidth={3} />}
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.label}
                className={`sidebar-item ${active ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
              >
                <span className="sidebar-icon">{item.icon}</span>
                {!collapsed && (
                  <span className="sidebar-label">{item.label}</span>
                )}
                {collapsed && (
                  <span className="tooltip-text">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM PROMO CARD */}
        <div className="sidebar-bottom">
          {!collapsed && (
            <div className="upgrade-card">
              <h4>Stay Organized</h4>
              <p>Track your productivity daily.</p>
            </div>
          )}
        </div>

        {/* PROFILE FOOTER */}
        <div className="sidebar-footer" ref={profileRef}>

          {/* PROFILE DROPDOWN — Settings + Account + Logout */}
          {profileExpanded && (
            <div className={`profile-dropdown animate-slide-up ${collapsed ? 'is-floating' : ''}`}>
              {loading ? (
                <div className="profile-loading">
                  <div className="spinner" />
                  <p>Loading profile…</p>
                </div>
              ) : error ? (
                <div className="profile-error">
                  <p>Could not load profile</p>
                </div>
              ) : user ? (
                <div className="profile-dropdown-content">
                  {/* Account Header - Updates when refreshTrigger fires */}
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">
                      {getAvatarLetter()}
                    </div>
                    <div className="profile-dropdown-info">
                      <p className="profile-dropdown-name">{getAccountName()}</p>
                      <p className="profile-dropdown-email">{getAccountEmail()}</p>
                    </div>
                  </div>

                  <div className="profile-dropdown-divider" />

                  {/* Settings Button */}
                  <button 
                    className="profile-settings-btn" 
                    onClick={() => {
                      navigate('/settings');
                      setProfileExpanded(false);
                    }}
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>

                  {/* Logout Button */}
                  <button className="profile-logout-btn" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}

          {/* PROFILE TRIGGER BUTTON - Updates when refreshTrigger fires */}
          <button
            className={`sidebar-item profile-btn ${profileExpanded ? 'active' : ''}`}
            onClick={() => setProfileExpanded((prev) => !prev)}
            title={collapsed ? "Profile Settings" : undefined}
          >
            <div className="sidebar-mini-avatar">
              {loading ? '…' : getAvatarLetter()}
            </div>

            {!collapsed && (
              <>
                <div className="profile-btn-details">
                  <span className="profile-btn-username">
                    {loading ? 'Loading…' : getAccountName()}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`chevron-icon ${profileExpanded ? 'expanded' : ''}`}
                />
              </>
            )}
          </button>

        </div>

      </aside>

      {/* CONFIRMATION OVERLAY */}
      <ConfirmModal
        isOpen={showLogoutModal}
        message="Are you sure you want to logout?"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          confirmLogout();
        }}
      />
    </>
  );
}

export default Sidebar;