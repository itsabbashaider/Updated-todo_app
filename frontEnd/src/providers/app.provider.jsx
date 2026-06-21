import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/query-client.util';
import { AuthProvider } from './auth.provider';
import { LoadingProvider } from './loading.provider';
import { ProfileProvider } from './profile.provider';
import ErrorBoundary from '../components/authentication/error-boundary.component';

export const AppProviders = ({ children }) => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoadingProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </LoadingProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);