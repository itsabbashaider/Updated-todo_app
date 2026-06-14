import { useState, useCallback } from 'react';
import { ProfileContext } from '../contexts/profile.context';

export function ProfileProvider({ children }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <ProfileContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </ProfileContext.Provider>
  );
}