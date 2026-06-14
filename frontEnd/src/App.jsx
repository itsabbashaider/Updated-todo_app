import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProviders } from './providers/app.provider';
import { protectedPage } from './utils/protected-page.util';

import Home from './pages/home.page';
import AnalyticsPage from './pages/analytics.page';
import CalendarPage from './pages/calendar.page';
import TasksPage from './pages/tasks.page';
import LoginPage from './pages/login.page';
import SignupPage from './pages/signup.page';
import SettingsPage from './pages/settings.page';
import ForgotPasswordPage from './pages/forgot-password.page';
import VerifySecurityAnswersPage from './pages/verify-security-questions.page';
import ResetPasswordPage from './pages/reset-password.page';

function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/verify-security-answers"
            element={<VerifySecurityAnswersPage />}
          />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={protectedPage(Home)} />
          <Route path="/dashboard" element={protectedPage(Home)} />
          <Route path="/analytics" element={protectedPage(AnalyticsPage)} />
          <Route path="/calendar" element={protectedPage(CalendarPage)} />
          <Route path="/tasks" element={protectedPage(TasksPage)} />
          <Route path="/settings" element={protectedPage(SettingsPage)} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;