import { createContext, useContext } from 'react';

export const ProfileContext = createContext();

export function useProfileRefresh() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileRefresh must be used within ProfileProvider');
  }
  return context;
}