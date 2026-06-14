export function getStatusFromCompletion(completionRate) {
  if (completionRate >= 80) return 'excellent';
  if (completionRate >= 60) return 'good';
  if (completionRate >= 40) return 'average';
  return 'low';
}

export function generateInsights(stats, streak, weeklyComparison, productivity) {
  const insights = [];
  const totalTasks = stats.totalCount;
  const highPriority = stats.highPriorityCount;
  const mediumPriority = stats.mediumPriorityCount;
  const lowPriority = stats.lowPriorityCount;

  if (weeklyComparison.improvement >= 25) {
    insights.push({
      icon: 'trending-up',
      title: 'Great Progress',
      description: `You completed ${weeklyComparison.improvement}% more tasks this week than last week.`,
    });
  } else if (weeklyComparison.improvement < 0) {
    insights.push({
      icon: 'alert-triangle',
      title: 'Slowing Down',
      description: `Task completion is down ${Math.abs(weeklyComparison.improvement)}% from last week.`,
    });
  }

  if (streak >= 7) {
    insights.push({
      icon: 'zap',
      title: 'Strong Streak',
      description: `You have a ${streak}-day streak. Keep the rhythm steady.`,
    });
  }

  if (highPriority === 0 && totalTasks > 0) {
    insights.push({
      icon: 'alert-triangle',
      title: 'No High Priority Tasks',
      description: 'Add one high-priority task so important work is easy to spot.',
    });
  } else if (highPriority > mediumPriority + lowPriority) {
    insights.push({
      icon: 'info',
      title: 'Heavy Load Ahead',
      description: `${highPriority} high-priority tasks are waiting. Break the largest one down first.`,
    });
  }

  if (productivity >= 80) {
    insights.push({
      icon: 'zap',
      title: 'Excellent Execution',
      description: `${productivity}% completion rate. Your task flow is in good shape.`,
    });
  } else if (productivity < 30 && totalTasks > 5) {
    insights.push({
      icon: 'alert-triangle',
      title: 'Low Completion Rate',
      description: 'Complete a few smaller tasks today to rebuild momentum.',
    });
  }

  if (stats.pendingCount > 20) {
    insights.push({
      icon: 'alert-triangle',
      title: 'Growing Backlog',
      description: `You have ${stats.pendingCount} pending tasks. Prioritize before adding more.`,
    });
  }

  return insights;
}

export function calculateWorkloadHealth(stats, priorityData) {
  const totalTasks = stats.totalCount || 0;
  const completedTasks = stats.completedCount || 0;
  const pendingTasks = stats.pendingCount || 0;
  const highPriority = stats.highPriorityCount || 0;

  const highCount = priorityData.find(p => p.name === 'High')?.value || 0;
  const medCount = priorityData.find(p => p.name === 'Medium')?.value || 0;
  const lowCount = priorityData.find(p => p.name === 'Low')?.value || 0;

  const baselineScore = (pendingTasks * 2) + (highPriority * 5);
  const completionRate = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const executionMultiplier = 1 - completionRate;
  let workloadScore = Math.min(Math.round(baselineScore * executionMultiplier), 100);

  let balanceMessage = 'Your task distribution across priorities is perfectly balanced.';
  let balancePenalty = 0;
  let dominantPriority = '';

  if (highCount > (medCount + lowCount) && highCount > 0) {
    dominantPriority = 'High';
    balancePenalty = (highCount - (medCount + lowCount)) * 2;
    balanceMessage = 'You are focusing heavily on High priority items. Try parsing some Medium and Low tasks to avoid burning out.';
  } else if (medCount > (highCount + lowCount) && medCount > 0) {
    dominantPriority = 'Medium';
    balancePenalty = (medCount - (highCount + lowCount)) * 2;
    balanceMessage = "Medium tasks are dominating your log. Ensure High targets aren't slipping through the cracks.";
  } else if (lowCount > (highCount + medCount) && lowCount > 0) {
    dominantPriority = 'Low';
    balancePenalty = (lowCount - (highCount + medCount)) * 2;
    balanceMessage = 'You are focusing heavily on Low priority chores. Shift attention toward higher impact objectives.';
  }

  workloadScore = Math.min(workloadScore + balancePenalty, 100);

  let workloadHealth = {
    status: 'Healthy',
    color: 'green',
    message: balancePenalty > 0 ? balanceMessage : 'Your workload is balanced and under control.',
    recommendation: 'Keep maintaining your current pace.',
  };

  if (workloadScore >= 15 && workloadScore < 35) {
    workloadHealth = {
      status: 'Moderate',
      color: 'yellow',
      message: balancePenalty > 0 ? balanceMessage : 'Your backlog is growing, but your performance is keeping it stable.',
      recommendation: 'Focus on remaining structural targets to clear the deck.',
    };
  } else if (workloadScore >= 35) {
    workloadHealth = {
      status: 'Overloaded',
      color: 'red',
      message: balancePenalty > 0 ? balanceMessage : 'Backlog volume is outstripping your completion speed.',
      recommendation:
        dominantPriority === 'Low'
          ? 'Stop clearing minor tasks. Force-stop incoming workflow and finish High priorities.'
          : 'Pause incoming tasks and clear out at least 3 alternative priority items.',
    };
  }

  return {
    workloadHealth,
    workloadScore,
    balancePenalty,
    dominantPriority,
  };
}