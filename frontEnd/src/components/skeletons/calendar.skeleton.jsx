import { Skeleton } from './skeleton';

export function CalendarSkeleton() {
  return (
    <div className="calendar-layout">
      <main className="calendar-main">

        {/* Header */}
        <div className="calendar-header">
          <Skeleton width="120px" height="32px" borderRadius="8px" />
          <Skeleton width="180px" height="16px" borderRadius="6px" style={{ marginTop: 8 }} />
        </div>

        <div className="calendar-container">

          {/* Month nav */}
          <div className="calendar-controls" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Skeleton width="36px" height="36px" borderRadius="8px" />
            <Skeleton width="160px" height="24px" borderRadius="6px" />
            <Skeleton width="36px" height="36px" borderRadius="8px" />
          </div>

          {/* Weekday labels */}
          <div className="calendar-weekdays">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <Skeleton key={d} width="100%" height="16px" borderRadius="4px" />
            ))}
          </div>

          {/* Calendar grid — 35 cells */}
          <div className="calendar-grid">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} width="100%" height="80px" borderRadius="8px" />
            ))}
          </div>

          {/* Task sections */}
          <div className="tasks-sections-grid">
            <div className="selected-date-section">
              <Skeleton width="160px" height="20px" borderRadius="6px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height="90px" borderRadius="10px" />
                ))}
              </div>
            </div>
            <div className="upcoming-section">
              <Skeleton width="130px" height="20px" borderRadius="6px" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width="100%" height="90px" borderRadius="10px" />
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}