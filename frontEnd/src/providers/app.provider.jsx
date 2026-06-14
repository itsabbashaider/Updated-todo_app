import { AuthProvider } from '../providers/auth.provider';
import { LoadingProvider } from './loading.provider';
import { ProfileProvider } from './profile.provider';
import ErrorBoundary from '../components/authentication/error-boundary.component';

export const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <AuthProvider>
      <LoadingProvider>
        <ProfileProvider>
          {children}
        </ProfileProvider>
      </LoadingProvider>
    </AuthProvider>
  </ErrorBoundary>
);