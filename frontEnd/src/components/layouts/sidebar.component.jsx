import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';


function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    {
      label: 'Home',
      icon: '🏠',
      path: '/',
    },
    {
      label: 'Tasks',
      icon: '✓',
      path: '/tasks',
    },
    {
      label: 'Calendar',
      icon: '📅',
      path: '/calendar',
    },
    {
      label: 'Analytics',
      icon: '📈',
      path: '/analytics',
    },
  ];

  return (
    <aside className={`modern-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="logo-wrapper">
          
          {!collapsed && (
            <div>
              <h2>TaskFlow</h2>
              <p>Productivity Hub</p>
            </div>
          )}
        </div>

        <button
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;

          return (
            <button
              key={item.label}
              className={`sidebar-item ${active ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-icon">{item.icon}</span>

              {!collapsed && (
                <span className="sidebar-label">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        {!collapsed && (
          <div className="upgrade-card">
            <h4>Stay Organized</h4>
            <p>Track your productivity daily.</p>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;