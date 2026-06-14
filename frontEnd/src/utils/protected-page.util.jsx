import ProtectedRoute from '../components/authentication/auth-protected-route.component';
import AchievementProvider from '../providers/achievement.provider';

export const protectedPage = (Page) => (
  <ProtectedRoute>
    <AchievementProvider>
      <Page />
    </AchievementProvider>
  </ProtectedRoute>
);