// Base animated skeleton block — use anywhere
export function Skeleton({ width = '100%', height = '16px', borderRadius = '6px', style = {} }) {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, #21262d 25%, #30363d 50%, #21262d 75%)',
      backgroundSize: '200% 100%',
      animation: 'skeleton-shimmer 1.4s ease infinite',
      flexShrink: 0,
      ...style,
    }} />
  );
}
