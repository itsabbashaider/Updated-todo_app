import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import {
  Home,
  CheckSquare,
  Calendar,
  BarChart2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    return savedState === 'true';
  });

  // ─── Sync body class on mount and every collapse change ──────────────────
  useEffect(() => {
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const menuItems = [
    { label: 'Home',      icon: <Home />,       path: '/'          },
    { label: 'Tasks',     icon: <CheckSquare />, path: '/tasks'     },
    { label: 'Calendar',  icon: <Calendar />,    path: '/calendar'  },
    { label: 'Analytics', icon: <BarChart2 />,   path: '/analytics' },
  ];

  const handleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState);
  };

  return (
    <aside className={`modern-sidebar ${collapsed ? 'collapsed' : ''}`}>

      {/* TOP */}
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
          <button className="collapse-btn" onClick={handleCollapse}>
            {collapsed
              ? <ArrowRight size={16} strokeWidth={3} />
              : <ArrowLeft  size={16} strokeWidth={3} />
            }
          </button>
        </div>
      </div>

      {/* NAV */}
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

              {/* Always rendered — CSS hides it when collapsed */}
              {!collapsed && (
                <span className="sidebar-label">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* BOTTOM */}
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