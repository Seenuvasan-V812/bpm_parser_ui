// src/components/Toolbar.jsx
import React from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Tooltip } from 'primereact/tooltip';
import { Plus, Minus, Layout, Download, Sun, Moon, FileSearch, X } from 'lucide-react';

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
  onCompare,
  compareTargetId,
  onChangeCompareTarget,
  showComparison,
  onToggleComparison,
}) {
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
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={onAddNode} className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Node
        </button>
        <Tooltip target=".add-node-btn" />

        <button onClick={onAddEdge} className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium">
          <Plus size={16} /> Edge
        </button>
        <Tooltip target=".add-edge-btn" />

        <button onClick={onDeleteEdge} className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2 text-sm font-medium">
          <Minus size={16} /> Edge
        </button>
        <Tooltip target=".remove-edge-btn" />

        <button onClick={onLayout} className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 text-sm font-medium">
          <Layout size={16} /> Layout
        </button>
        <Tooltip target=".layout-btn" />

        <button onClick={onExport} className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2 text-sm font-medium">
          <Download size={16} /> Export JSON
        </button>
        <Tooltip target=".export-btn" />

        <button onClick={onToggleTheme} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 text-sm font-medium">
          {themeDark ? <Sun size={16} /> : <Moon size={16} />}
          {themeDark ? 'Light' : 'Dark'}
        </button>
        <Tooltip target=".theme-btn" />
      </div>

      {/* COMPARE SECTION */}
      <div className="flex items-center gap-2 ml-4 border-l pl-4 border-gray-300 dark:border-gray-600">
        <button
          onClick={onCompare}
          className="px-3 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-2 text-sm font-medium"
        >
          <FileSearch size={16} /> Compare
        </button>
        <Tooltip target=".compare-btn" />

        <Dropdown
          value={compareTargetId}
          options={processOptions.filter(o => o.value !== selectedProcessId)}
          onChange={(e) => onChangeCompareTarget(e.value)}
          placeholder="Select to compare"
          className="w-[260px] p-dropdown bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md"
        />

        {showComparison && (
          <button
            onClick={onToggleComparison}
            className="ml-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-1 text-sm"
          >
            <X size={16} /> Close
          </button>
        )}
      </div>
    </div>
  );
}