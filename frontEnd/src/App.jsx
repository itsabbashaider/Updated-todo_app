import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import Home from './pages/home.page';
import AnalyticsPage from './pages/analytics.page';
import CalendarPage from './pages/calendar.page';
import TasksPage from './pages/tasks.page';

import AchievementProvider from './providers/achievement.provider';

function App() {
  return (
    <AchievementProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/analytics"
            element={
              <AnalyticsPage />
            }
          />

          <Route
            path="/calendar"
            element={
              <CalendarPage />
            }
          />

          <Route
            path="/tasks"
            element={<TasksPage />}
          />
        </Routes>
      </BrowserRouter>
    </AchievementProvider>
  );
}

export default App;