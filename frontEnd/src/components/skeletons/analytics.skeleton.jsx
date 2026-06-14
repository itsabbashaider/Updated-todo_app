import { Skeleton } from './skeleton';

export function AnalyticsSkeleton() {
  return (
    <div className="analytics-layout">
      <main className="analytics-main">

        {/* Header */}
        <div className="analytics-header">
          <div>
            <Skeleton width="130px" height="32px" borderRadius="8px" />
            <Skeleton width="280px" height="16px" borderRadius="6px" style={{ marginTop: 8 }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton width="70px" height="34px" borderRadius="8px" />
            <Skeleton width="80px" height="34px" borderRadius="8px" />
            <Skeleton width="80px" height="34px" borderRadius="8px" />
          </div>
        </div>

        <div className="analytics-container">

          {/* Stats — 6 cards */}
          <div className="analytics-stats">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="analytics-card" key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Skeleton width="100px" height="16px" borderRadius="6px" />
                <Skeleton width="60px" height="32px" borderRadius="6px" />
                <Skeleton width="80px" height="13px" borderRadius="6px" />
              </div>
            ))}
          </div>

          {/* Trends chart */}
          <div className="trends-card">
            <Skeleton width="180px" height="20px" borderRadius="6px" />
            <Skeleton width="240px" height="14px" borderRadius="6px" style={{ marginTop: 6 }} />
            <Skeleton width="100%" height="350px" borderRadius="10px" style={{ marginTop: 20 }} />
          </div>

          {/* Two column */}
          <div className="charts-grid">
            <Skeleton width="100%" height="320px" borderRadius="12px" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Skeleton width="100%" height="180px" borderRadius="12px" />
              <Skeleton width="100%" height="120px" borderRadius="12px" />
            </div>
          </div>

          {/* Bottom charts */}
          <div className="charts-grid">
            <Skeleton width="100%" height="280px" borderRadius="12px" />
            <Skeleton width="100%" height="280px" borderRadius="12px" />
          </div>

        </div>
      </main>
    </div>
  );
}