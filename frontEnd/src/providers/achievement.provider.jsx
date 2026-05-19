import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import AchievementContext from '../contexts/achievement.context';

import AchievementPopup from '../components/popups/achievement-popup.component';

import { useTasks } from '../hooks/use-task.hook';

function AchievementProvider({
  children,
}) {
  const { tasks } = useTasks();

  const [
    activeAchievement,
    setActiveAchievement,
  ] = useState(null);

  const queueRef = useRef([]);

  const timeoutRef = useRef(null);

  const processingRef =
    useRef(false);

  /* ==========================================
     BASIC STATS
  ========================================== */

  const completedTasks = useMemo(
    () =>
      tasks.filter((task) => task.completed)
        .length,
    [tasks]
  );

  const pendingTasks = useMemo(
    () =>
      tasks.filter((task) => !task.completed)
        .length,
    [tasks]
  );

  const productivity = useMemo(() => {
    if (tasks.length === 0) {
      return 0;
    }

    return Math.round(
      (completedTasks / tasks.length) * 100
    );
  }, [tasks, completedTasks]);

  const highPriorityTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.priority?.toLowerCase() ===
          'high'
      ).length,
    [tasks]
  );

  /* ==========================================
     ACHIEVEMENTS
  ========================================== */

  const achievements = useMemo(() => {
    const unlocked = [];

    /* TASK COMPLETION */

    if (completedTasks >= 1) {
      unlocked.push({
        id: 'first-task',
        title: 'First Win',
        description:
          'You completed your first task.',
        icon: '🌱',
      });
    }

    if (completedTasks >= 5) {
      unlocked.push({
        id: 'small-momentum',
        title: 'Small Momentum',
        description:
          '5 completed tasks achieved.',
        icon: '✨',
      });
    }

    if (completedTasks >= 10) {
      unlocked.push({
        id: 'focused-start',
        title: 'Focused Start',
        description:
          '10 completed tasks completed.',
        icon: '⭐',
      });
    }

    if (completedTasks >= 15) {
      unlocked.push({
        id: 'daily-grinder',
        title: 'Daily Grinder',
        description:
          '15 tasks completed with consistency.',
        icon: '☕',
      });
    }

    if (completedTasks >= 25) {
      unlocked.push({
        id: 'goal-chaser',
        title: 'Goal Chaser',
        description:
          '25 completed tasks achieved.',
        icon: '🚀',
      });
    }

    if (completedTasks >= 40) {
      unlocked.push({
        id: 'workflow-builder',
        title: 'Workflow Builder',
        description:
          '40 completed tasks. Your system is improving.',
        icon: '🛠️',
      });
    }

    if (completedTasks >= 50) {
      unlocked.push({
        id: 'consistency-builder',
        title:
          'Consistency Builder',
        description:
          '50 tasks completed.',
        icon: '💎',
      });
    }

    if (completedTasks >= 75) {
      unlocked.push({
        id: 'discipline-mode',
        title: 'Discipline Mode',
        description:
          '75 completed tasks achieved.',
        icon: '🧠',
      });
    }

    if (completedTasks >= 100) {
      unlocked.push({
        id: 'focused-achiever',
        title:
          'Focused Achiever',
        description:
          '100 completed tasks.',
        icon: '🥇',
      });
    }

    if (completedTasks >= 150) {
      unlocked.push({
        id: 'deep-focus',
        title: 'Deep Focus',
        description:
          '150 completed tasks with strong consistency.',
        icon: '🎯',
      });
    }

    if (completedTasks >= 200) {
      unlocked.push({
        id: 'execution-machine',
        title:
          'Execution Machine',
        description:
          '200 completed tasks achieved.',
        icon: '🤖',
      });
    }

    if (completedTasks >= 250) {
      unlocked.push({
        id: 'peak-performer',
        title:
          'Peak Performer',
        description:
          '250 completed tasks achieved.',
        icon: '⚡',
      });
    }

    if (completedTasks >= 500) {
      unlocked.push({
        id: 'master-execution',
        title:
          'Master of Execution',
        description:
          '500 completed tasks achieved.',
        icon: '🏆',
      });
    }

    if (completedTasks >= 750) {
      unlocked.push({
        id: 'productivity-monster',
        title:
          'Productivity Monster',
        description:
          '750 completed tasks achieved.',
        icon: '🐉',
      });
    }

    if (completedTasks >= 1000) {
      unlocked.push({
        id: 'legendary-focus',
        title:
          'Legendary Focus',
        description:
          '1000 completed tasks achieved.',
        icon: '👑',
      });
    }

    /* PRODUCTIVITY */

    if (productivity >= 50) {
      unlocked.push({
        id: 'steady-progress',
        title: 'Steady Progress',
        description:
          'Reached 50% productivity.',
        icon: '📈',
      });
    }

    if (productivity >= 75) {
      unlocked.push({
        id: 'momentum-mode',
        title: 'Momentum Mode',
        description:
          '75% productivity achieved.',
        icon: '🔥',
      });
    }

    if (productivity >= 90) {
      unlocked.push({
        id: 'locked-in',
        title: 'Locked In',
        description:
          '90% productivity achieved.',
        icon: '🎯',
      });
    }

    if (productivity >= 100) {
      unlocked.push({
        id: 'perfect-day',
        title: 'Perfect Day',
        description:
          'Every task completed.',
        icon: '🌟',
      });
    }

    /* PRIORITY TASKS */

    if (highPriorityTasks >= 10) {
      unlocked.push({
        id: 'pressure-handler',
        title:
          'Pressure Handler',
        description:
          'Managed 10 high priority tasks.',
        icon: '🛡️',
      });
    }

    if (highPriorityTasks >= 20) {
      unlocked.push({
        id: 'high-impact',
        title: 'High Impact',
        description:
          'Handled 20 high priority tasks.',
        icon: '💥',
      });
    }

    /* TASK MANAGEMENT */

    if (
      pendingTasks === 0 &&
      tasks.length > 0
    ) {
      unlocked.push({
        id: 'inbox-zero',
        title: 'Inbox Zero',
        description:
          'No pending tasks remaining.',
        icon: '📭',
      });
    }

    /* MOTIVATION */

    if (
      completedTasks >= 3 &&
      productivity >= 80
    ) {
      unlocked.push({
        id: 'good-rhythm',
        title: 'Good Rhythm',
        description:
          'You are building healthy momentum.',
        icon: '🎵',
      });
    }

    if (
      completedTasks >= 30 &&
      productivity >= 85
    ) {
      unlocked.push({
        id: 'unstoppable-energy',
        title:
          'Unstoppable Energy',
        description:
          'Your consistency is becoming powerful.',
        icon: '⚔️',
      });
    }

    if (
      completedTasks >= 200 &&
      productivity >= 90
    ) {
      unlocked.push({
        id: 'elite-discipline',
        title:
          'Elite Discipline',
        description:
          'Exceptional focus and consistency achieved.',
        icon: '🧬',
      });
    }

    return unlocked;
  }, [
    completedTasks,
    productivity,
    pendingTasks,
    highPriorityTasks,
    tasks,
  ]);

  /* ==========================================
    POPUP QUEUE SYSTEM
  ========================================== */

  const processQueueRef = useRef(null);

  const processNextAchievement =
    useCallback(() => {
      if (
        processingRef.current ||
        queueRef.current.length === 0
      ) {
        return;
      }

      processingRef.current = true;

      const nextAchievement =
        queueRef.current.shift();

      requestAnimationFrame(() => {
        setActiveAchievement(
          nextAchievement
        );

        timeoutRef.current =
          setTimeout(() => {
            requestAnimationFrame(() => {
              setActiveAchievement(null);

              processingRef.current =
                false;

              if (
                queueRef.current.length > 0
              ) {
                setTimeout(() => {
                  processQueueRef.current?.();
                }, 350);
              }
            });
          }, 4000);
      });
    }, []);

  useEffect(() => {
    processQueueRef.current =
      processNextAchievement;
  }, [processNextAchievement]);

  /* ==========================================
     DETECT NEW ACHIEVEMENTS
  ========================================== */

  useEffect(() => {
    const shownAchievements =
      JSON.parse(
        localStorage.getItem(
          'shownAchievements'
        ) || '[]'
      );

    const newAchievements =
      achievements.filter(
        (achievement) =>
          !shownAchievements.includes(
            achievement.id
          )
      );

    if (
      newAchievements.length === 0
    ) {
      return;
    }

    localStorage.setItem(
      'shownAchievements',
      JSON.stringify([
        ...shownAchievements,
        ...newAchievements.map(
          (achievement) =>
            achievement.id
        ),
      ])
    );

    queueRef.current.push(
      ...newAchievements
    );

    const timer = setTimeout(() => {
      processQueueRef.current?.();
    }, 100);

    return () => {
      clearTimeout(timer);

      if (timeoutRef.current) {
        clearTimeout(
          timeoutRef.current
        );
      }
    };
  }, [achievements]);

  return (
    <AchievementContext.Provider
      value={{ achievements }}
    >
      {children}

      <AchievementPopup
        achievement={
          activeAchievement
        }
      />
    </AchievementContext.Provider>
  );
}

export default AchievementProvider;