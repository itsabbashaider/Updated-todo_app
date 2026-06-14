export function getMomentumLabel(peakHour) {
  if (peakHour === null || peakHour === undefined) {
    return 'Unknown';
  }

  if (peakHour >= 6 && peakHour < 12) {
    return 'Morning Rush';
  }

  if (peakHour >= 12 && peakHour < 17) {
    return 'Afternoon Peak';
  }

  if (peakHour >= 17 && peakHour < 21) {
    return 'Evening Grind';
  }

  return 'Night Owl';
}

export function getSmartRecommendation({
  totalTasks,
  completedTasks,
  pendingTasks,
  highPriority,
  mediumPriority,
  lowPriority,
  completionRate,
}) {
  if (totalTasks === 0) {
    return 'Start by creating your first task.';
  }

  if (highPriority === 0 && (mediumPriority > 0 || lowPriority > 0)) {
    return 'Consider adding one high-priority item so your biggest goal stays visible.';
  }

  if (highPriority > mediumPriority + lowPriority) {
    return 'You have many high-priority tasks. Break the next one into smaller steps.';
  }

  if (completionRate >= 80) {
    return 'Excellent progress. Keep the momentum going.';
  }

  if (completionRate >= 50) {
    return 'You are on track. Finish one more task to keep the day moving.';
  }

  if (pendingTasks > 0 && completedTasks === 0) {
    return 'Start with one small task to build momentum.';
  }

  if (pendingTasks > 10) {
    return 'Your backlog is growing. Pick three tasks to clear today.';
  }

  return 'Keep maintaining your current pace.';
}
