function boundsFromPoints(allPoints) {
  const xs = allPoints.map((p) => p[0]);
  const ys = allPoints.map((p) => p[1]);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys)
  };
}

function pointsToSvg(points, bounds, width, height) {
  const scaleX = width / Math.max(1, bounds.maxX - bounds.minX);
  const scaleY = height / Math.max(1, bounds.maxY - bounds.minY);
  const scale = Math.min(scaleX, scaleY);

  return points
    .map(([x, y]) => {
      const sx = (x - bounds.minX) * scale;
      const sy = height - (y - bounds.minY) * scale;
      return `${sx},${sy}`;
    })
    .join(' ');
}

export default function DebugView({
  netGeometry = [],
  zones = [],
  placements = [],
  circulation = []
}) {
  const allPoints = [
    ...netGeometry,
    ...zones.flatMap((z) => z.polygon || []),
    ...placements.flatMap((p) => p.polygon || []),
    ...circulation.flatMap((c) => c || [])
  ];

  if (!allPoints.length) {
    return <div style={{ marginTop: 16 }}>No geometry available</div>;
  }

  const bounds = boundsFromPoints(allPoints);
  const width = 1000;
  const height = 500;

  return (
    <div style={{ marginTop: 24 }}>
      <strong>Debug View</strong>

      <svg
        width={width}
        height={height}
        style={{
          display: 'block',
          marginTop: 12,
          border: '1px solid #ccc',
          background: '#fff'
        }}
      >
        {netGeometry.length ? (
          <polygon
            points={pointsToSvg(netGeometry, bounds, width, height)}
            fill="none"
            stroke="#222"
            strokeWidth="2"
          />
        ) : null}

        {zones.map((zone) => {
          let fill = 'rgba(0,120,255,0.18)';
          if (zone.zoneType === 'daylight') fill = 'rgba(255,215,0,0.28)';
          if (zone.zoneType === 'core_edge') fill = 'rgba(255,140,0,0.22)';
          if (zone.zoneType === 'mid') fill = 'rgba(0,120,255,0.18)';

          return (
            <polygon
              key={zone.id}
              points={pointsToSvg(zone.polygon || [], bounds, width, height)}
              fill={fill}
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="1"
            >
              <title>{`${zone.id} (${zone.zoneType})`}</title>
            </polygon>
          );
        })}

        {circulation.map((ring, index) => (
          <polygon
            key={`circ-${index}`}
            points={pointsToSvg(ring || [], bounds, width, height)}
            fill="rgba(160,0,160,0.16)"
            stroke="rgba(120,0,120,0.35)"
            strokeWidth="1"
          >
            <title>{`circulation_${index + 1}`}</title>
          </polygon>
        ))}

        {placements.map((placement) => (
          <polygon
            key={placement.module_id}
            points={pointsToSvg(placement.polygon || [], bounds, width, height)}
            fill="rgba(0,180,120,0.28)"
            stroke="rgba(0,120,80,0.85)"
            strokeWidth="1.5"
          >
            <title>{`${placement.module_id} (${placement.category})`}</title>
          </polygon>
        ))}
      </svg>

      <div style={{ marginTop: 12, fontSize: 12, color: '#555' }}>
        <div>Black = net area</div>
        <div>Yellow = daylight zones</div>
        <div>Orange = core edge zones</div>
        <div>Blue = mid zones</div>
        <div>Purple = circulation</div>
        <div>Green = placed modules</div>
      </div>
    </div>
  );
}