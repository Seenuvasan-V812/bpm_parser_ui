// src/components/CustomNode.jsx

import React, { useState } from "react";
import { Handle, Position } from "reactflow";

export default function CustomNode({ id, data }) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label || "");
  const [expanded, setExpanded] = useState(true);

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
    setIsEditing(false);
    if (label !== data.label && data.onChange) {
      data.onChange({ label });
    }
  };
  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };
  const bgColors = {
    startEvent: "bg-green-300 dark:bg-green-700 rounded-full p-5 border-[2px] border-solid border-gray-300 dark:border-gray-100",
    endEvent: "bg-red-300 dark:bg-red-700 rounded-full p-5 border-[5px] border-solid border-gray-300 dark:border-gray-100",
    decision: "fill-yellow-200 dark:fill-yellow-700",
    entity: "bg-blue-200 dark:bg-blue-700",
    default: "bg-gray-200 dark:bg-gray-600",
  };
  const type = data.type || "default";
  const baseColor = bgColors[type] || bgColors.default;
  const renderAttributes = () => {
    const attributes = data.attributes || [];
    if (!attributes.length || !expanded) return null;

    return (
      <ul className="mt-1 text-[11px] text-gray-700 dark:text-gray-300 list-disc list-inside px-2 w-full text-left">
        {attributes.map((attr, i) => (
          <li key={i} className="whitespace-normal break-words">• {attr}</li>
        ))}
      </ul>
    );
  };

  const renderContent = () => (
    <>
      {isEditing ? (
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          className="w-full text-center border border-gray-400 rounded bg-white dark:bg-gray-800 text-black dark:text-white whitespace-normal h-full"
          style={{ minHeight: '32px', fontSize: '11px' }}
        />
      ) : (
        <>
          <div 
            className="font-semibold whitespace-normal break-words w-full text-center"
            style={{ 
              wordBreak: 'break-word', 
              hyphens: 'auto', 
              fontSize: '11px',
              lineHeight: '1.2',
            }}
          >
            {label}
          </div>
          {renderAttributes()}
          {data.attributes?.length > 0 && (
            <button
              onClick={toggleExpand}
              className="mt-1 text-[10px] bg-gray-300 dark:bg-gray-600 px-1 rounded flex-shrink-0"
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          )}
        </>
      )}
    </>
  );

  if (type === "decision") {
    const size = expanded ? 240 : 160;
    const halfSize = size / 2;

    return (
      <div 
        className="relative flex items-center justify-center nodrag" 
        style={{ width: size, height: size, transition: "all 0.25s ease" }}
      >
        <svg style={{ position: 'absolute', top: 0, left: 0, width: size, height: size }} >
          <polygon
            points={`${halfSize},0 ${size},${halfSize} ${halfSize},${size} 0,${halfSize}`}
            className={baseColor + " border border-gray-500 dark:border-gray-400 shadow-md"}
            style={{ strokeWidth: 1, stroke: 'gray' }}
          />
        </svg>
        {/* Handles at the diamond corners */}
        <Handle 
          type="target" 
          position={Position.Top} 
          id="target-top" 
          style={{ top: 0, left: halfSize, transform: 'translate(-50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="target" 
          position={Position.Right} 
          id="target-right" 
          style={{ top: halfSize, right: 0, transform: 'translate(50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="target" 
          position={Position.Bottom} 
          id="target-bottom" 
          style={{ top: size, left: halfSize, transform: 'translate(-50%, 50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="target" 
          position={Position.Left} 
          id="target-left" 
          style={{ top: halfSize, left: 0, transform: 'translate(-50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="source" 
          position={Position.Top} 
          id="source-top" 
          style={{ top: 0, left: halfSize, transform: 'translate(-50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="source" 
          position={Position.Right} 
          id="source-right" 
          style={{ top: halfSize, right: 0, transform: 'translate(50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="source-bottom" 
          style={{ top: size, left: halfSize, transform: 'translate(-50%, 50%)', background: '#fff', border: '1px solid #000' }} 
        />
        <Handle 
          type="source" 
          position={Position.Left} 
          id="source-left" 
          style={{ top: halfSize, left: 0, transform: 'translate(-50%, -50%)', background: '#fff', border: '1px solid #000' }} 
        />

        <div
          className="absolute flex flex-col items-center justify-center text-center text-gray-900 dark:text-gray-100 p-4 break-words"
          style={{
            width: "65%",
            maxHeight: size - 50,
            overflow: 'hidden',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '11px', 
            lineHeight: '1.2',
          }}
          onDoubleClick={handleDoubleClick}
        >
          {renderContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Handle type="target" position={Position.Left} id="target-left" />
      <Handle type="target" position={Position.Top} id="target-top" />
      <Handle type="target" position={Position.Right} id="target-right" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" />
      <Handle type="source" position={Position.Left} id="source-left" />
      <Handle type="source" position={Position.Top} id="source-top" />
      <Handle type="source" position={Position.Right} id="source-right" />
      <Handle type="source" position={Position.Bottom} id="source-bottom" />

      <div
        onDoubleClick={handleDoubleClick}
        className={`shadow-md border border-gray-400 dark:border-gray-600 ${baseColor} transition-all duration-200 cursor-pointer flex flex-col items-center p-2 text-gray-900 dark:text-gray-100 whitespace-normal break-words`}
        style={{ width: expanded ? 192 : 160, minHeight: expanded ? '80px' : '60px', justifyContent: 'center' }}
      >
        {renderContent()}
      </div>
    </div>
  );
}