// src/components/CustomBezierEdge.jsx
import React from 'react';
import { getBezierPath } from 'reactflow';

export default function CustomBezierEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  path,
  label,
  labelStyle = {},
  labelBgStyle = {},
  labelBgPadding = [0, 0],
  labelBgBorderRadius = 0,
  data,
}) {
  const {
    edgePath,
    labelX,
    labelY,
  } = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: data?.curvature || 0.25,
  });

  const edgePathStyles = {
    ...style,
    ...(data?.isDifferent && { stroke: '#ff0000', strokeWidth: 3 }),  // Red highlight for different in comparison
    ...(data?.isSame && { stroke: '#10b981', strokeWidth: 3 }),  // Green for same
  };

  const labelBgStyles = {
    ...labelBgStyle,
    fill: 'rgba(255, 255, 255, 0.9)',
    rx: labelBgBorderRadius,
    ry: labelBgBorderRadius,
    padding: `${labelBgPadding[0]}px ${labelBgPadding[1]}px`,
  };

  if (path) {
    // Use custom path for reverse/override cases
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

  return (
    <g>
      <path
        id={id}
        style={edgePathStyles}
        d={edgePath}
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