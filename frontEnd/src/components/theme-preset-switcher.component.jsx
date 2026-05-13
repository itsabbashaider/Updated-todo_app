import { useEffect, useState } from 'react';

const THEME_PRESETS = [
  { id: 'mono', label: 'White and grey' },
  { id: 'charcoal', label: 'Charcoal dark' },
];

const STORAGE_KEY = 'todo-theme-preset';

function getStoredTheme() {
  if (typeof window === 'undefined') return 'mono';

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return THEME_PRESETS.some((theme) => theme.id === stored) ? stored : 'mono';
}

function ThemePresetSwitcher() {
  const [activeTheme, setActiveTheme] = useState(getStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = activeTheme;
    window.localStorage.setItem(STORAGE_KEY, activeTheme);
  }, [activeTheme]);

  return (
    <div className="theme-switcher" aria-label="Theme presets">
      {THEME_PRESETS.map((theme) => (
        <button
          key={theme.id}
          type="button"
          className={`theme-option ${activeTheme === theme.id ? 'active' : ''}`}
          aria-label={theme.label}
          aria-pressed={activeTheme === theme.id}
          title={theme.label}
          onClick={() => setActiveTheme(theme.id)}
        >
          <span className={`theme-swatch ${theme.id}`} />
        </button>
      ))}
    </div>
  );
}

export default ThemePresetSwitcher;
