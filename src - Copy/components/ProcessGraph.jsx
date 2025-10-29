// src/components/ProcessGraph.jsx

import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  Position,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 192;
const nodeHeight = 80;

const wrapLabel = (label, maxLength = 15) => {
  if (!label) return null;
  if (label.length <= maxLength) return label;

  const words = label.split(' ');
  let lines = [];
  let currentLine = '';
  for (const word of words) {
    if ((currentLine + ' ' + word).length > maxLength) {
      lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += (currentLine.length > 0 ? ' ' : '') + word;
    }
  }
  lines.push(currentLine.trim());
  return lines.join('\n');
};

function getLayoutedElements(nodes, edges, direction = "LR") {
  const hasDecisionNode = nodes.some(node => node.type === 'decision');
  const ranksep = hasDecisionNode ? 250 : 200;

  dagreGraph.setGraph({ 
    rankdir: direction, 
    ranksep: direction === 'TB' ? ranksep * 1.5 : ranksep,
    nodesep: 60,
    edgesep: 30,
    marginx: 50,
    marginy: 50,
    ranker: 'network-simplex',
    orderRestarts: 5,
  });

  nodes.forEach((node) => {
    const width = node.type === 'decision' ? 240 : nodeWidth;
    const height = node.type === 'decision' ? 240 : nodeHeight;
    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target, {
      weight: edge.meta?.exception ? 4 : edge.source === edge.target ? 3 : 1,
      minlen: edge.source === edge.target ? 2 : 1,
    });
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const width = node.type === 'decision' ? 240 : nodeWidth;
    const height = node.type === 'decision' ? 240 : nodeHeight;
    const nodeWithPosition = dagreGraph.node(node.id);

    let sourcePos, targetPos;
    if (direction === 'LR') {
      sourcePos = 'right';
      targetPos = 'left';
    } else {
      sourcePos = 'bottom';
      targetPos = 'top';
    }

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
      sourcePosition: sourcePos,
      targetPosition: targetPos,
    };
  });
}

// Custom LoopEdge for self-loops
const LoopEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  style = {},
  markerEnd,
  data,
}) => {
  const { sourceNode } = data;
  const nodeWidth = sourceNode?.width || 192;
  const nodeHeight = sourceNode?.height || 80;

  // Custom SVG path: Start from right, curve up and around, connect to top
  const edgePath = `
    M ${sourceX} ${sourceY}
    C ${sourceX + 150} ${sourceY} ${sourceX + 150} ${sourceY - 100} ${targetX} ${targetY}
  `;

  const labelX = sourceX + 75; // Position label midway along the curve
  const labelY = sourceY - 50;

  return (
    <>
      <BaseEdge path={edgePath.trim()} markerEnd={markerEnd} style={{ ...style, strokeWidth: 3, stroke: '#ff5555' }} />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

// Custom BezierEdge for flexible path rendering with variable curvature
const CustomBezierEdge = ({
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
  data,
}) => {
  const curvature = data?.curvature || 0.25;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        {label && (
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              zIndex: 1000,
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { loop: LoopEdge, custombezier: CustomBezierEdge };

export default function ProcessGraph({ process, onProcessChange, onSelectNode, layoutTrigger }) {
  const [rfInstance, setRfInstance] = useState(null);

  const onLayout = useCallback(() => {
    if (!process.nodes || process.nodes.length === 0) return;

    const directions = ['TB', 'LR'];
    const currentDirection = directions[layoutTrigger % directions.length];

    const tempNodes = (process.nodes || []).map(n => ({ ...n }));
    const tempEdges = process.edges || [];

    const layoutedNodes = getLayoutedElements(tempNodes, tempEdges, currentDirection);

    const updatedProcess = {
      ...process,
      nodes: layoutedNodes.map(n => ({
        ...process.nodes.find(orig => orig.id === n.id),
        position: n.position,
        sourcePosition: n.sourcePosition,
        targetPosition: n.targetPosition,
      })),
    };
    onProcessChange(updatedProcess);
  }, [process, onProcessChange, layoutTrigger]);

  useEffect(() => {
    onLayout();
  }, [process.id, layoutTrigger]);

  const nodes = useMemo(() => {
    return (process.nodes || []).map((node) => {
      const width = node.type === 'decision' ? 240 : nodeWidth;
      const height = node.type === 'decision' ? 240 : nodeHeight;
      return {
        id: node.id,
        type: "custom",
        position: node.position || { x: 0, y: 0 },
        sourcePosition: node.sourcePosition || 'bottom',
        targetPosition: node.targetPosition || 'top',
        data: {
          id: node.id,
          label: node.data?.label || "",
          type: node.type,
          attributes: node.data?.attributes || [],
          onChange: (updated) => {
            const updatedProcess = {
              ...process,
              nodes: process.nodes.map((nd) =>
                nd.id === node.id
                  ? { ...nd, data: { ...nd.data, label: updated.label } }
                  : nd
              ),
            };
            onProcessChange(updatedProcess);
          },
        },
        width,
        height,
      };
    });
  }, [process, onProcessChange]);

  const edges = useMemo(() => {
    return (process.edges || []).map((e) => {
      const wrappedLabel = wrapLabel(e.label, 15);
      const sourceNode = process.nodes.find(n => n.id === e.source);
      const targetNode = process.nodes.find(n => n.id === e.target);

      let sourceHandle = e.sourceHandle || `source-${sourceNode?.sourcePosition || 'bottom'}`;
      let targetHandle = e.targetHandle || `target-${targetNode?.targetPosition || 'top'}`;
      let edgeType = e.meta?.exception ? 'bezier' : 'straight';

      const sourcePosition = sourceHandle.replace('source-', '');
      const targetPosition = targetHandle.replace('target-', '');

      const sourcePosEnum = Position[sourcePosition.charAt(0).toUpperCase() + sourcePosition.slice(1)];
      const targetPosEnum = Position[targetPosition.charAt(0).toUpperCase() + targetPosition.slice(1)];

      const sourcePosY = sourceNode?.position?.y || 0;
      const targetPosY = targetNode?.position?.y || 0;
      const sourcePosX = sourceNode?.position?.x || 0;
      const targetPosX = targetNode?.position?.x || 0;

      const isVertical = (sourcePosEnum === Position.Bottom && targetPosEnum === Position.Top) || (sourcePosEnum === Position.Top && targetPosEnum === Position.Bottom);
      const isHorizontal = (sourcePosEnum === Position.Right && targetPosEnum === Position.Left) || (sourcePosEnum === Position.Left && targetPosEnum === Position.Right);

      const isReverseVertical = isVertical && ((sourcePosY > targetPosY && sourcePosEnum === Position.Bottom) || (sourcePosY < targetPosY && sourcePosEnum === Position.Top));
      const isReverseHorizontal = isHorizontal && ((sourcePosX > targetPosX && sourcePosEnum === Position.Right) || (sourcePosX < targetPosX && sourcePosEnum === Position.Left));
      const isReverse = isReverseVertical || isReverseHorizontal;

      let curvature = 0;
      if (isReverse) curvature = 0.5;
      else if (isVertical || isHorizontal) curvature = 0;
      else curvature = 0.25;
      if (e.meta?.exception) curvature = 0.5;

      const isTB = sourceNode?.sourcePosition === 'bottom';
      const isLR = sourceNode?.sourcePosition === 'right';

      const isReverseTB = isTB && (sourcePosY > targetPosY);
      const isReverseLR = isLR && (sourcePosX > targetPosX);

      let edgeStyle = { 
        strokeWidth: 2, 
        zIndex: 100,
        stroke: e.meta?.exception ? '#ff5555' : '#555',
      };

      if (sourceNode?.type === 'decision' && isTB && !isReverseTB) {
        sourceHandle = 'source-bottom';
        curvature = 0.25;
      } else if (sourceNode?.type === 'decision') {
        const labelLower = e.label ? e.label.toLowerCase() : '';
        if (e.meta?.exception) {
          sourceHandle = 'source-bottom';
          curvature = 0.25;
        } else if (labelLower.includes('yes') || labelLower.includes('ok') || labelLower.includes('confirmed')) {
          sourceHandle = 'source-right';
        } else if (labelLower.includes('no') || labelLower.includes('retry')) {
          sourceHandle = 'source-top';
        } else {
          sourceHandle = 'source-right'; // Default to right for LR
        }
      }

      if (e.source === e.target) {
        edgeType = 'loop';
        sourceHandle = 'source-right';
        targetHandle = 'target-top';
        edgeStyle = { ...edgeStyle, strokeWidth: 3, stroke: '#ff5555' };
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: edgeType,
          animated: true,
          label: wrappedLabel,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: 'rgba(255, 255, 255, 0.9)', fillOpacity: 0.9 },
          style: edgeStyle,
          labelStyle: { zIndex: 110 },
          markerEnd: { type: 'arrowclosed' },
          sourceHandle,
          targetHandle,
          data: { sourceNode }, // Pass sourceNode for dynamic sizing
        };
      } else if (isReverseTB) {
        sourceHandle = 'source-left';
        targetHandle = 'target-left';
        edgeType = 'bezier';
        edgeStyle = { ...edgeStyle, stroke: '#ff0000' };
        const offsetX = 50;
        const offsetY = -50;
        const [edgePath] = getBezierPath({
          sourceX: sourceNode.position.x + (sourceNode.width || 0) / 2 - offsetX,
          sourceY: sourceNode.position.y + (sourceNode.height || 0) + offsetY,
          sourcePosition: Position.Left,
          targetX: targetNode.position.x + (targetNode.width || 0) / 2 - offsetX,
          targetY: targetNode.position.y + (targetNode.height || 0) + offsetY,
          targetPosition: Position.Left,
          curvature: 0.3,
        });
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: edgeType,
          animated: true,
          label: wrappedLabel,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: 'rgba(255, 255, 255, 0.9)', fillOpacity: 0.9 },
          style: edgeStyle,
          labelStyle: { zIndex: 110 },
          markerEnd: { type: 'arrowclosed' },
          sourceHandle,
          targetHandle,
          path: edgePath,
        };
      } else if (isReverseLR) {
        sourceHandle = 'source-bottom';
        targetHandle = targetPosY > sourcePosY ? 'target-bottom' : 'target-right';
        edgeType = 'bezier';
        edgeStyle = { ...edgeStyle, stroke: '#ff0000' };
        const offsetX = -50;
        const offsetY = 50;
        const [edgePath] = getBezierPath({
          sourceX: sourceNode.position.x + (sourceNode.width || 0) + offsetX,
          sourceY: sourceNode.position.y + (sourceNode.height || 0) / 2 - offsetY,
          sourcePosition: Position.Bottom,
          targetX: targetNode.position.x + (targetNode.width || 0) + offsetX,
          targetY: targetNode.position.y + (targetNode.height || 0) / 2 - offsetY,
          targetPosition: targetPosY > sourcePosY ? Position.Bottom : Position.Right,
          curvature: 0.3,
        });
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: edgeType,
          animated: true,
          label: wrappedLabel,
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: 'rgba(255, 255, 255, 0.9)', fillOpacity: 0.9 },
          style: edgeStyle,
          labelStyle: { zIndex: 110 },
          markerEnd: { type: 'arrowclosed' },
          sourceHandle,
          targetHandle,
          path: edgePath,
        };
      }

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'custombezier',
        animated: true,
        label: wrappedLabel,
        labelBgPadding: [8, 4],
        labelBgBorderRadius: 4,
        labelBgStyle: { fill: 'rgba(255, 255, 255, 0.9)', fillOpacity: 0.9 },
        style: edgeStyle,
        labelStyle: { zIndex: 110 },
        markerEnd: { type: 'arrowclosed' },
        sourceHandle,
        targetHandle,
        data: { curvature },
      };
    });
  }, [process]);

  const onConnect = useCallback(
    (params) => {
      const edgeLabel = prompt("Enter a label for the new edge (optional):");
      if (edgeLabel === null) return;

      const sourceNode = process.nodes.find(n => n.id === params.source);
      const targetNode = process.nodes.find(n => n.id === params.target);

      const sourceHandle = params.sourceHandle || `source-${sourceNode?.sourcePosition || 'bottom'}`;
      const targetHandle = params.targetHandle || `target-${targetNode?.targetPosition || 'top'}`;

      const newEdge = {
        id: `edge_${Date.now()}`,
        source: params.source,
        target: params.target,
        label: edgeLabel,
        sourceHandle,
        targetHandle,
        meta: { 
          flow_type: sourceNode?.type === 'decision' ? 'conditional' : 'sequence',
          conditional: sourceNode?.type === 'decision',
          exception: edgeLabel?.toLowerCase().includes('exception') || edgeLabel?.toLowerCase().includes('incomplete'),
        },
      };
      onProcessChange({
        ...process,
        edges: [...(process.edges || []), newEdge],
      });
    },
    [process, onProcessChange]
  );

  const onNodesDelete = useCallback(
    (deletedNodes) => {
      const deletedIds = deletedNodes.map((n) => n.id);
      const remainingNodes = process.nodes.filter(
        (n) => !deletedIds.includes(n.id)
      );
      const remainingEdges = process.edges.filter(
        (e) => !deletedIds.includes(e.source) && !deletedIds.includes(e.target)
      );
      onProcessChange({
        ...process,
        nodes: remainingNodes,
        edges: remainingEdges,
      });
    },
    [process, onProcessChange]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges) => {
      const deletedIds = deletedEdges.map((e) => e.id);
      const remainingEdges = process.edges.filter(
        (e) => !deletedIds.includes(e.id)
      );
      onProcessChange({ ...process, edges: remainingEdges });
    },
    [process, onProcessChange]
  );

  const handleNodeDragStop = useCallback(
    (evt, node) => {
      const updated = {
        ...process,
        nodes: process.nodes.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        ),
      };
      onProcessChange(updated);
    },
    [process, onProcessChange]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && rfInstance) {
        const selectedNodes = rfInstance.getNodes().filter((n) => n.selected);
        const selectedEdges = rfInstance.getEdges().filter((e) => e.selected);
        if (selectedNodes.length) onNodesDelete(selectedNodes);
        if (selectedEdges.length) onEdgesDelete(selectedEdges);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rfInstance, onNodesDelete, onEdgesDelete]);

  return (
    <ReactFlowProvider>
      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onInit={setRfInstance}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={(e, node) => onSelectNode(node.id)}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          defaultEdgeOptions={{
            type: 'custombezier',
            style: { strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed' },
          }}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}