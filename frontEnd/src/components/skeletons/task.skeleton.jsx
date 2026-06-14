import { Skeleton } from './skeleton';

export function TasksSkeleton() {
  const cards = Array.from({ length: 4 });

  return (
    <div className="tasks-layout">
      <main className="tasks-main">

        {/* Header */}
        <div className="tasks-header">
          <div className="header-content">
            <Skeleton width="120px" height="32px" borderRadius="8px" />
            <Skeleton width="220px" height="16px" borderRadius="6px" style={{ marginTop: 8 }} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <Skeleton width="240px" height="38px" borderRadius="8px" />
              <Skeleton width="110px" height="38px" borderRadius="8px" />
            </div>
          </div>
        </div>

        <div className="tasks-container">
          <div className="kanban-board">

            {/* Pending column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <Skeleton width="80px" height="20px" borderRadius="6px" />
                <Skeleton width="24px" height="24px" borderRadius="50%" />
              </div>
              <div className="kanban-tasks" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cards.map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            </div>

            {/* Completed column */}
            <div className="kanban-column">
              <div className="kanban-header">
                <Skeleton width="100px" height="20px" borderRadius="6px" />
                <Skeleton width="24px" height="24px" borderRadius="50%" />
              </div>
              <div className="kanban-tasks" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {cards.map((_, i) => <TaskCardSkeleton key={i} />)}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <div className="modern-task-card" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="60%" height="18px" borderRadius="6px" />
        <Skeleton width="50px" height="22px" borderRadius="12px" />
      </div>
      <Skeleton width="90%" height="14px" borderRadius="6px" />
      <Skeleton width="70%" height="14px" borderRadius="6px" />
      <Skeleton width="100px" height="12px" borderRadius="6px" />
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <Skeleton width="32px" height="32px" borderRadius="8px" />
        <Skeleton width="32px" height="32px" borderRadius="8px" />
        <Skeleton width="32px" height="32px" borderRadius="8px" />
      </div>
    </div>
  );
}