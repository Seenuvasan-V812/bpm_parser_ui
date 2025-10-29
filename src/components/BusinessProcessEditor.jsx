// BusinessProcessEditor.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import processesData from '../data/processesData';
import Toolbar from './Toolbar';
import ProcessGraph from './ProcessGraph';
import NodeDetailSidebar from './NodeDetailSidebar';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

export default function BusinessProcessEditor() {
    const [processes, setProcesses] = useState(() => processesData.map(p => JSON.parse(JSON.stringify(p))));
    const [selectedProcessId, setSelectedProcessId] = useState(processes[0]?.id || null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [themeDark, setThemeDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) return savedTheme === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [layoutTrigger, setLayoutTrigger] = useState(0);

    // ---------- COMPARISON STATE ----------
    const [compareTargetId, setCompareTargetId] = useState(null);
    const [comparisonResult, setComparisonResult] = useState(null);
    const [showComparison, setShowComparison] = useState(false); // NEW

    useEffect(() => {
        if (themeDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [themeDark]);

    const selectedProcess = useMemo(() => processes.find(p => p.id === selectedProcessId), [processes, selectedProcessId]);
    const compareProcess = useMemo(() => processes.find(p => p.id === compareTargetId), [processes, compareTargetId]);

    const replaceProcess = useCallback((updatedProcess) => {
        setProcesses(prev => prev.map(p => p.id === updatedProcess.id ? updatedProcess : p));
    }, []);

    const handleAddNode = () => {
        if (!selectedProcess) return;
        const newId = `n_${Date.now().toString(36)}`;
        const newNode = {
            id: newId,
            type: 'entity',
            data: { label: 'New Node', attributes: [] },
            size: { width: 160, height: 64 },
            position: { x: (selectedProcess.nodes?.length || 0) * 80 + 200, y: 200 }
        };
        replaceProcess({ ...selectedProcess, nodes: [...(selectedProcess.nodes || []), newNode] });
    };

    const handleAddEdge = () => {
        if (!selectedProcess || selectedProcess.nodes.length < 2) return;
        const [source, target] = selectedProcess.nodes.slice(-2);
        const edgeLabel = prompt("Enter a label for the new edge (optional):");
        const newEdge = {
            id: `edge_${Date.now()}`,
            source: source.id,
            target: target.id,
            label: edgeLabel === null ? '' : edgeLabel,
        };
        replaceProcess({ ...selectedProcess, edges: [...(selectedProcess.edges || []), newEdge] });
    };

    const handleDeleteEdge = () => {
        if (!selectedProcess?.edges?.length) return;
        const remainingEdges = [...selectedProcess.edges];
        remainingEdges.pop();
        replaceProcess({ ...selectedProcess, edges: remainingEdges });
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(processes, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processes_export.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleUpdateNode = (updatedProcess) => {
        replaceProcess(updatedProcess);
    };

    const handleDeleteNode = (nodeId) => {
        if (!selectedProcess) return;
        const filteredNodes = selectedProcess.nodes.filter(n => n.id !== nodeId);
        const filteredEdges = selectedProcess.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
        replaceProcess({ ...selectedProcess, nodes: filteredNodes, edges: filteredEdges });
        setSelectedNodeId(null);
    };

    const handleLayout = () => {
        setLayoutTrigger(prev => prev + 1);
    };

    // ---------- COMPARISON LOGIC ----------
    const runComparison = useCallback(() => {
        if (!selectedProcess || !compareTargetId) {
            setComparisonResult(null);
            return;
        }
        const target = processes.find(p => p.id === compareTargetId);
        if (!target) return;

        const norm = s => s?.trim().toLowerCase();

        const srcNodeLabels = new Map(selectedProcess.nodes.map(n => [n.id, norm(n.data?.label)]));
        const tgtNodeLabels = new Map(target.nodes.map(n => [n.id, norm(n.data?.label)]));

        const sameNodeIds = new Set();
        srcNodeLabels.forEach((lbl, id) => {
            if (tgtNodeLabels.has(id) && tgtNodeLabels.get(id) === lbl) {
                sameNodeIds.add(id);
            }
        });

        const srcEdgeKey = e => `${e.source}→${e.target}→${norm(e.label)}`;
        const tgtEdgeKey = e => `${e.source}→${e.target}→${norm(e.label)}`;

        const tgtEdgeSet = new Set(target.edges.map(tgtEdgeKey));
        const sameEdgeIds = new Set(
            selectedProcess.edges
                .filter(e => tgtEdgeSet.has(srcEdgeKey(e)))
                .map(e => e.id)
        );

        setComparisonResult({ sameNodes: sameNodeIds, sameEdges: sameEdgeIds });
    }, [selectedProcess, compareTargetId, processes]);

    const handleCompare = () => {
        runComparison();
        setShowComparison(true);
    };

    useEffect(() => {
        if (compareTargetId) runComparison();
    }, [compareTargetId, runComparison]);

    return (
        <div className="w-screen h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Toolbar
                onAddNode={handleAddNode}
                onAddEdge={handleAddEdge}
                onDeleteEdge={handleDeleteEdge}
                onExport={handleExport}
                onToggleTheme={() => setThemeDark((d) => !d)}
                themeDark={themeDark}
                processes={processes}
                selectedProcessId={selectedProcessId}
                onChangeProcess={setSelectedProcessId}
                onLayout={handleLayout}
                onCompare={handleCompare}
                compareTargetId={compareTargetId}
                onChangeCompareTarget={setCompareTargetId}
                showComparison={showComparison}
                onToggleComparison={() => setShowComparison(prev => !prev)}
            />

            <div className="flex-1 flex min-h-0">
                {showComparison ? (
                    <PanelGroup direction="horizontal" className="flex-1">
                        {/* LEFT: Current Process */}
                        <Panel defaultSize={50} minSize={30}>
                            <div className="h-full flex flex-col border-r border-gray-300 dark:border-gray-700">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 text-center font-semibold text-sm">
                                    Current: {selectedProcess?.name}
                                </div>
                                <div className="flex-1">
                                    {selectedProcess ? (
                                        <ProcessGraph
                                            process={selectedProcess}
                                            onProcessChange={replaceProcess}
                                            onSelectNode={(id) => setSelectedNodeId(id)}
                                            layoutTrigger={layoutTrigger}
                                            comparison={comparisonResult}
                                        />
                                    ) : (
                                        <div className="p-6 text-center">No process selected</div>
                                    )}
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="w-2 bg-gray-300 dark:bg-gray-700 hover:bg-blue-500 transition-colors" />

                        {/* RIGHT: Compare Process */}
                        <Panel defaultSize={50} minSize={30}>
                            <div className="h-full flex flex-col">
                                <div className="p-2 bg-green-100 dark:bg-green-900 text-center font-semibold text-sm">
                                    Compare: {compareProcess?.name}
                                </div>
                                <div className="flex-1">
                                    {compareProcess ? (
                                        <ProcessGraph
                                            process={compareProcess}
                                            onProcessChange={replaceProcess}
                                            onSelectNode={() => {}}
                                            layoutTrigger={layoutTrigger}
                                            comparison={{
                                                sameNodes: new Set(comparisonResult?.sameNodes || []),
                                                sameEdges: new Set(comparisonResult?.sameEdges || []),
                                            }}
                                        />
                                    ) : (
                                        <div className="p-6 text-center">Select a process to compare</div>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                ) : (
                    <main className="flex-1 h-full min-w-0">
                        {selectedProcess ? (
                            <div className="h-full">
                                <ProcessGraph
                                    process={selectedProcess}
                                    onProcessChange={replaceProcess}
                                    onSelectNode={(id) => setSelectedNodeId(id)}
                                    layoutTrigger={layoutTrigger}
                                    comparison={comparisonResult}
                                />
                            </div>
                        ) : (
                            <div className="p-6">No process selected</div>
                        )}
                    </main>
                )}

                {selectedNodeId && selectedProcess && (
                    <NodeDetailSidebar
                        node={selectedNodeId}
                        process={selectedProcess}
                        onClose={() => setSelectedNodeId(null)}
                        onUpdateNode={handleUpdateNode}
                        onDeleteNode={handleDeleteNode}
                    />
                )}
            </div>
        </div>
    );
}