import { useContext } from 'react';

import AchievementContext from '../context/achievement.context';

function useAchievement() {
  return useContext(
    AchievementContext
  );
}

export default useAchievement;