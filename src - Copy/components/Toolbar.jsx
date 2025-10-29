// src/components/Toolbar.jsx
import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { Plus, Minus, Layout, Download, Sun, Moon } from 'lucide-react';

export default function Toolbar({
  onAddNode,
  onAddEdge,
  onDeleteEdge,
  onExport,
  onToggleTheme,
  themeDark,
  processes,
  selectedProcessId,
  onChangeProcess,
  onLayout,
}) {
  // Map processes to Dropdown options
  const processOptions = processes.map((p) => ({
    label: p.name,
    value: p.id,
  }));

  return (
    <div className="flex flex-wrap items-center justify-between p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">Business Process Editor</h2>

        <Dropdown
          value={selectedProcessId}
          options={processOptions}
          onChange={(e) => onChangeProcess(e.value)}
          placeholder="Select a process"
          className="w-[330px] p-dropdown bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md"
          panelClassName="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          itemTemplate={(option) => (
            <div className="p-0 hover:bg-gray-100 dark:hover:bg-gray-600">{option.label}</div>
          )}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={onAddNode}
          data-pr-tooltip="Add a new node to the process"
          data-pr-position="top"
          className="add-node-btn px-3 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Node
        </button>
        <Tooltip target=".add-node-btn" />

        <button
          onClick={onAddEdge}
          data-pr-tooltip="Add a new edge between nodes"
          data-pr-position="top"
          className="add-edge-btn px-3 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Plus size={16} /> Edge
        </button>
        <Tooltip target=".add-edge-btn" />

        <button
          onClick={onDeleteEdge}
          data-pr-tooltip="Remove the last added edge"
          data-pr-position="top"
          className="remove-edge-btn px-3 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Minus size={16} /> Edge
        </button>
        <Tooltip target=".remove-edge-btn" />

        <button
          onClick={onLayout}
          data-pr-tooltip="Reorganize the process layout"
          data-pr-position="top"
          className="layout-btn px-3 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-md hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Layout size={16} /> Layout
        </button>
        <Tooltip target=".layout-btn" />

        <button
          onClick={onExport}
          data-pr-tooltip="Export process data as JSON"
          data-pr-position="top"
          className="export-btn px-3 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Download size={16} /> Export JSON
        </button>
        <Tooltip target=".export-btn" />

        <button
          onClick={onToggleTheme}
          data-pr-tooltip={`Toggle ${themeDark ? 'light' : 'dark'} theme`}
          data-pr-position="top"
          className="theme-btn px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          {themeDark ? <Sun size={16} /> : <Moon size={16} />}
          {themeDark ? 'Light' : 'Dark'}
        </button>
        <Tooltip target=".theme-btn" />
      </div>
    </div>
  );
}