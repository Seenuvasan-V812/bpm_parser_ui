// src/components/LoopEdge.jsx
import React from 'react';

export default function LoopEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle = {},
  labelBgStyle = {},
  labelBgPadding = [0, 0],
  labelBgBorderRadius = 0,
  data,
}) {
  // Simple loop path: curve from right to top
  const loopRadius = 50;
  const centerX = sourceX + loopRadius;
  const centerY = sourceY - loopRadius;
  const path = `M ${sourceX} ${sourceY} A ${loopRadius} ${loopRadius} 0 1 0 ${centerX} ${centerY} A ${loopRadius} ${loopRadius} 0 1 0 ${sourceX} ${sourceY}`;

  const edgePathStyles = {
    ...style,
    fill: 'none',
    ...(data?.isDifferent && { stroke: '#ff0000' }),  // Red for different in comparison
    ...(data?.isSame && { stroke: '#10b981' }),  // Green for same
  };

  const labelBgStyles = {
    ...labelBgStyle,
    fill: 'rgba(255, 255, 255, 0.9)',
    rx: labelBgBorderRadius,
    ry: labelBgBorderRadius,
    padding: `${labelBgPadding[0]}px ${labelBgPadding[1]}px`,
  };

  const labelX = sourceX + loopRadius / 2;
  const labelY = sourceY - loopRadius / 2;

  return (
    <g>
      <path
        id={id}
        style={edgePathStyles}
        d={path}
        markerEnd={markerEnd}
      />
      {label && (
        <foreignObject
          width={label?.length * 8 + 20}
          height={30}
          x={labelX - (label.length * 4 + 10)}
          y={labelY - 15}
          style={{ overflow: 'visible' }}
        >
          <div
            style={{
              ...labelStyle,
              background: labelBgStyles.fill,
              borderRadius: labelBgBorderRadius,
              padding: labelBgPadding.join('px '),
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#000',
              textAlign: 'center',
              ...(data?.isDifferent && { background: 'rgba(239, 68, 68, 0.9)', color: '#fff' }),
              ...(data?.isSame && { background: 'rgba(16, 185, 129, 0.9)', color: '#fff' }),
            }}
          >
            {label}
          </div>
        </foreignObject>
      )}
    </g>
  );
}