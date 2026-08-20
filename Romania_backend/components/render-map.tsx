'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const CityNode = ({ data }: { data: { label: string; labelPosition?: string; status?: string } }) => {
  const getLabelPositionClass = () => {
    switch (data.labelPosition) {
      case 'left': return 'right-5 top-1/2 -translate-y-1/2 text-right';
      case 'top': return 'bottom-5 left-1/2 -translate-x-1/2 text-center';
      case 'bottom': return 'top-5 left-1/2 -translate-x-1/2 text-center';
      case 'right': default: return 'left-5 top-1/2 -translate-y-1/2 text-left';
    }
  };

  // เปลี่ยนสีของโหนดตามสถานะ (Start, Path, Visited, Normal)
  let bgColors = "bg-gray-400 border-gray-800";
  if (data.status === 'path') bgColors = "bg-emerald-500 border-emerald-700 scale-125 z-10";
  else if (data.status === 'visited') bgColors = "bg-amber-400 border-amber-600";
  else if (data.status === 'start') bgColors = "bg-blue-600 border-blue-900 scale-125 z-10";
  else if (data.status === 'goal') bgColors = "bg-rose-600 border-rose-900 scale-125 z-10";

  return (
    <div className={`relative flex items-center justify-center w-4 h-4 border-2 shadow-md rounded-sm transition-all duration-300 ${bgColors}`}>
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-full !h-full !top-0 !left-0 !transform-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-full !h-full !top-0 !left-0 !transform-none" />
      <span className={`absolute whitespace-nowrap text-xs font-bold pointer-events-none ${data.status === 'path' ? 'text-emerald-700 text-sm' : 'text-gray-800'} ${getLabelPositionClass()}`}>
        {data.label}
      </span>
    </div>
  );
};

const initialNodesRaw = [
  { id: 'Arad', position: { x: 50, y: 180 }, labelPosition: 'left' },
  { id: 'Zerind', position: { x: 90, y: 100 }, labelPosition: 'right' },
  { id: 'Oradea', position: { x: 150, y: 30 }, labelPosition: 'right' },
  { id: 'Timisoara', position: { x: 50, y: 320 }, labelPosition: 'right' },
  { id: 'Sibiu', position: { x: 280, y: 220 }, labelPosition: 'top' },
  { id: 'Lugoj', position: { x: 160, y: 380 }, labelPosition: 'right' },
  { id: 'Mehadia', position: { x: 160, y: 460 }, labelPosition: 'right' },
  { id: 'Drobeta', position: { x: 150, y: 550 }, labelPosition: 'left' },
  { id: 'Craiova', position: { x: 320, y: 580 }, labelPosition: 'bottom' },
  { id: 'Rimnicu Vilcea', position: { x: 310, y: 320 }, labelPosition: 'right' },
  { id: 'Pitesti', position: { x: 450, y: 420 }, labelPosition: 'top' },
  { id: 'Fagaras', position: { x: 450, y: 220 }, labelPosition: 'top' },
  { id: 'Bucharest', position: { x: 600, y: 500 }, labelPosition: 'bottom' },
  { id: 'Giurgiu', position: { x: 550, y: 620 }, labelPosition: 'right' },
  { id: 'Urziceni', position: { x: 700, y: 450 }, labelPosition: 'bottom' },
  { id: 'Hirsova', position: { x: 820, y: 450 }, labelPosition: 'right' },
  { id: 'Eforie', position: { x: 870, y: 580 }, labelPosition: 'bottom' },
  { id: 'Vaslui', position: { x: 780, y: 310 }, labelPosition: 'right' },
  { id: 'Iasi', position: { x: 730, y: 180 }, labelPosition: 'right' },
  { id: 'Neamt', position: { x: 620, y: 100 }, labelPosition: 'top' },
];

const edgeData = [
  ['Arad', 'Zerind', '75'], ['Arad', 'Timisoara', '118'], ['Arad', 'Sibiu', '140'],
  ['Zerind', 'Oradea', '71'], ['Oradea', 'Sibiu', '151'], ['Timisoara', 'Lugoj', '111'],
  ['Lugoj', 'Mehadia', '70'], ['Mehadia', 'Drobeta', '75'], ['Drobeta', 'Craiova', '120'],
  ['Craiova', 'Rimnicu Vilcea', '146'], ['Craiova', 'Pitesti', '138'], ['Sibiu', 'Rimnicu Vilcea', '80'],
  ['Sibiu', 'Fagaras', '99'], ['Rimnicu Vilcea', 'Pitesti', '97'], ['Pitesti', 'Bucharest', '101'],
  ['Fagaras', 'Bucharest', '211'], ['Bucharest', 'Giurgiu', '90'], ['Bucharest', 'Urziceni', '85'],
  ['Urziceni', 'Hirsova', '98'], ['Hirsova', 'Eforie', '86'], ['Urziceni', 'Vaslui', '142'],
  ['Vaslui', 'Iasi', '92'], ['Iasi', 'Neamt', '87']
];

export default function RenderMap() {
  const nodeTypes = useMemo(() => ({ city: CityNode }), []);

  const [startCity, setStartCity] = useState('Arad');
  const [goalCity, setGoalCity] = useState('Bucharest');
  const [algorithm, setAlgorithm] = useState('HubAndSpoke');
  
  const [path, setPath] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [cost, setCost] = useState<number | null>(null);
  const [execTime, setExecTime] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startCity, goal: goalCity, algorithm })
      });
      const data = await res.json();
      if (!data.error) {
        setPath(data.path);
        setSteps(data.steps);
        setCost(data.cost);
        setExecTime(data.execution_time);
      }
    } catch (err) {
      console.error("Backend Error:", err);
      alert("ไม่สามารถเชื่อมต่อกับ Python Backend ได้! โปรดตรวจสอบว่ารัน main.py อยู่หรือไม่");
    } finally {
      setLoading(false);
    }
  };

  // สร้าง Nodes พร้อมเพิ่ม status
  const nodes: Node[] = initialNodesRaw.map((n) => {
    let status = 'normal';
    if (n.id === startCity) status = 'start';
    else if (n.id === goalCity) status = 'goal';
    else if (path.includes(n.id)) status = 'path';
    else if (steps.includes(n.id)) status = 'visited';

    return {
      id: n.id,
      type: 'city',
      position: n.position,
      data: { label: n.id, labelPosition: n.labelPosition, status }
    };
  });

  // สร้าง Edges และปรับสีถ้าเป็นเส้นทางผลลัพธ์
  const edges: Edge[] = edgeData.map(([src, tgt, label]) => {
    const isPathEdge = path.some((node, idx) => {
      if (idx === path.length - 1) return false;
      const nextNode = path[idx + 1];
      return (node === src && nextNode === tgt) || (node === tgt && nextNode === src);
    });

    return {
      id: `e-${src}-${tgt}`,
      source: src,
      target: tgt,
      label,
      type: 'straight',
      style: {
        stroke: isPathEdge ? '#10b981' : '#64748b',
        strokeWidth: isPathEdge ? 3.5 : 1.5
      },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
      labelBgStyle: { fill: '#ffffff', color: '#0f172a' },
    };
  });

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border rounded-lg shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Start City</label>
            <select 
              value={startCity} 
              onChange={(e) => setStartCity(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50"
            >
              {initialNodesRaw.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Goal City</label>
            <select 
              value={goalCity} 
              onChange={(e) => setGoalCity(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50"
            >
              {initialNodesRaw.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Algorithm</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50"
            >
              <option value="HubAndSpoke">Hub-and-Spoke (Custom Heuristic)</option>
              <option value="A*">A* Search</option>
              <option value="Greedy">Greedy Best-First</option>
              <option value="BFS">BFS</option>
              <option value="DFS">DFS</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition shadow"
        >
          {loading ? 'Searching...' : 'Run Pathfinding'}
        </button>
      </div>

      {/* Result Info Banner */}
      {path.length > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs md:text-sm text-emerald-800 flex flex-col gap-1">
          <div><strong>Optimal Path:</strong> {path.join(' ➔ ')}</div>
          <div className="flex gap-4 mt-1 text-emerald-700">
            <span><strong>Total Cost:</strong> {cost} km</span>
            <span><strong>Execution Time:</strong> {execTime}</span>
            <span><strong>Nodes Explored:</strong> {steps.length} nodes</span>
          </div>
        </div>
      )}

      {/* Flow Map Canvas */}
      <div className="w-full h-[500px] bg-slate-50 border rounded-xl overflow-hidden relative shadow-inner">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
}