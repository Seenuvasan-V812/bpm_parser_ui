// NodeDetailSidebar.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NodeDetailSidebar({ node, process, onClose, onUpdateNode, onDeleteNode }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('entity');
  const [attributes, setAttributes] = useState('');

  useEffect(() => {
    if (!node) return;
    const n = process.nodes.find(x => x.id === node);
    setLabel(n?.data?.label || '');
    setType(n?.type || 'entity');
    setAttributes((n?.data?.attributes || []).join('\n'));
  }, [node, process]);

  if (!node) return null;

  const handleSave = () => {
    const updatedNodes = process.nodes.map(n => n.id === node ? {
      ...n,
      type,
      data: { ...n.data, label, attributes: attributes.split('\n').map(s => s.trim()).filter(Boolean) }
    } : n);
    onUpdateNode({ ...process, nodes: updatedNodes });
  };

  const handleDelete = () => {
    if (!confirm('Delete this node?')) return;
    onDeleteNode(node);
    onClose();
  };

  return (
    <motion.aside initial={{ x: 300 }} animate={{ x: 0 }} exit={{ x: 300 }} className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-2xl p-4 z-40">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Node details</h3>
        <button onClick={onClose} className="text-gray-500">Close</button>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <label className="block text-xs">Label</label>
          <input className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700" value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>

        <div>
          <label className="block text-xs">Type</label>
          <select className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="entity">Entity / Task</option>
            <option value="decision">Decision</option>
            <option value="startEvent">Start</option>
            <option value="endEvent">End</option>
          </select>
        </div>

        <div>
          <label className="block text-xs">Attributes (one per line)</label>
          <textarea rows={6} className="w-full p-2 rounded bg-gray-100 dark:bg-gray-700" value={attributes} onChange={(e) => setAttributes(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 px-3 py-2 rounded bg-emerald-500 text-white">Save</button>
          <button onClick={handleDelete} className="px-3 py-2 rounded bg-red-500 text-white">Delete</button>
        </div>
      </div>
    </motion.aside>
  );
}
