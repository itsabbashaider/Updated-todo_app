import useTheme from '../../hooks/useTheme';

function Topbar({
  title,
  subtitle,
  search,
  setSearch,
}) {
  const { darkMode, toggleTheme } =
    useTheme();

  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>

        <p>{subtitle}</p>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search tasks..."
            value={search || ''}
            onChange={(e) =>
              setSearch?.(e.target.value)
            }
          />
        </div>

        <button
          className="theme-toggle"
          onClick={toggleTheme}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        <div className="profile-card">
          <div className="profile-avatar">
            A
          </div>

          <div>
            <h4>Abbas</h4>

            <span>
              Productivity Master
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Topbar;