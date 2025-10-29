// BusinessProcessEditor.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import processesData from '../data/processesData';
import Toolbar from './Toolbar';
import ProcessGraph from './ProcessGraph';
import NodeDetailSidebar from './NodeDetailSidebar';

export default function BusinessProcessEditor() {
    const [processes, setProcesses] = useState(() => processesData.map(p => JSON.parse(JSON.stringify(p))));
    const [selectedProcessId, setSelectedProcessId] = useState(processes[0]?.id || null);
    const [selectedNodeId, setSelectedNodeId] = useState(null);
    const [themeDark, setThemeDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    // NEW STATE: A trigger to force layout in ProcessGraph
    const [layoutTrigger, setLayoutTrigger] = useState(0);

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

        // MODIFICATION START: Prompt for Edge Label
        const edgeLabel = prompt("Enter a label for the new edge (optional):");
        // If the user clicks cancel, prompt returns null. If they click OK with empty field, it's "".
        // We will accept null/empty strings.

        const newEdge = {
            id: `edge_${Date.now()}`,
            source: source.id,
            target: target.id,
            label: edgeLabel === null ? '' : edgeLabel, // Use '' if cancelled or empty string is provided
        };
        // MODIFICATION END

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

    // NEW FUNCTION: Handler for the Layout button
    const handleLayout = () => {
        // Increment state to trigger the layout logic inside ProcessGraph.jsx
        setLayoutTrigger(prev => prev + 1);
    };


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
                // PASS NEW PROP: Pass the layout handler to the Toolbar
                onLayout={handleLayout}
            />


            <div className="flex-1 flex min-h-0">
                {/* Left - Graph */}
                <main className="flex-1 h-full min-w-0">
                    {selectedProcess ? (
                        <div className="h-full">
                            <ProcessGraph
                                process={selectedProcess}
                                onProcessChange={replaceProcess}
                                onSelectNode={(id) => setSelectedNodeId(id)}
                                // PASS NEW PROP: Pass the trigger to the ProcessGraph
                                layoutTrigger={layoutTrigger}
                            />
                        </div>
                    ) : (
                        <div className="p-6">No process selected</div>
                    )}
                </main>

                {/* Right - Node sidebar */}
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