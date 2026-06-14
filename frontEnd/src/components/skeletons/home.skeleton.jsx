import { Skeleton } from './skeleton';

export function HomeSkeleton() {
  return (
    <div className="dashboard-layout">
      <main className="dashboard-main">

        {/* Header */}
        <div className="dashboard-header">
          <Skeleton width="200px" height="32px" borderRadius="8px" />
          <Skeleton width="260px" height="16px" borderRadius="6px" style={{ marginTop: 8 }} />
        </div>

        <div className="dashboard-container">

          {/* Stats grid — 4 cards */}
          <section className="stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="stat-card" key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton width="36px" height="36px" borderRadius="10px" />
                <Skeleton width="80px" height="28px" borderRadius="6px" />
                <Skeleton width="120px" height="14px" borderRadius="6px" />
              </div>
            ))}
          </section>

          {/* Content — recent tasks + insights */}
          <section className="dashboard-content">

            {/* Recent tasks */}
            <div className="tasks-section">
              <div className="section-header">
                <Skeleton width="120px" height="20px" borderRadius="6px" />
              </div>
              <div className="tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div className="task-card" key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                      <Skeleton width="55%" height="16px" borderRadius="6px" />
                      <Skeleton width="80%" height="13px" borderRadius="6px" />
                    </div>
                    <Skeleton width="55px" height="22px" borderRadius="12px" />
                  </div>
                ))}
              </div>
            </div>

            {/* Insights */}
            <div className="calendar-preview">
              <div className="section-header">
                <Skeleton width="130px" height="20px" borderRadius="6px" />
              </div>
              <div className="calendar-card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Skeleton width="180px" height="22px" borderRadius="6px" />
                <div className="summary-box" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div className="summary-item" key={i}>
                      <Skeleton width="120px" height="14px" borderRadius="6px" />
                      <Skeleton width="30px" height="14px" borderRadius="6px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}