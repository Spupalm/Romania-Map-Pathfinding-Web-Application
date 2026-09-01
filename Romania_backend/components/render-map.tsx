'use client';

import React, { useMemo, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface AdaptiveMetrics {
  g: number;
  h: number;
  f: number;
  cd: number;
  md: number;
  alpha_pct?: number;
  beta_pct?: number;
  alpha?: number;
  beta?: number;
}

interface Neighbor {
  city: string;
  edge_cost?: number;
  g?: number;
  h?: number;
  f?: number;
  metrics?: AdaptiveMetrics;
  cd?: number;
  md?: number;
  alpha?: number;
  beta?: number;
}

interface StepLog {
  step: number;
  expanded_node: string;
  g?: number;
  h?: number;
  f?: number;
  cd?: number;
  md?: number;
  alpha?: number;
  beta?: number;
  metrics?: AdaptiveMetrics;
  neighbors?: Neighbor[];
  current_path?: string[];
}

const CityNode = ({ data }: { data: { label: string; labelPosition?: string; status?: string } }) => {
  const getLabelPositionClass = () => {
    switch (data.labelPosition) {
      case 'left': return 'right-5 top-1/2 -translate-y-1/2 text-right';
      case 'top': return 'bottom-5 left-1/2 -translate-x-1/2 text-center';
      case 'bottom': return 'top-5 left-1/2 -translate-x-1/2 text-center';
      case 'right': default: return 'left-5 top-1/2 -translate-y-1/2 text-left';
    }
  };

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
  const [algorithm, setAlgorithm] = useState('Cheby_A_Star');
  
  const [path, setPath] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [stepsLog, setStepsLog] = useState<StepLog[]>([]);
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
        setPath(data.path || []);
        setSteps(data.steps || []);
        setStepsLog(data.steps_log || []);
        setCost(data.cost);
        setExecTime(data.execution_time);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error("Backend Error:", err);
      alert("ไม่สามารถเชื่อมต่อกับ Python Backend ได้!");
    } finally {
      setLoading(false);
    }
  };

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

  // Helper ดึงค่า Metrics ปรับรองรับข้อมูลทั้ง 2 ฟอร์แมต
  const getMetrics = (item: StepLog | Neighbor): AdaptiveMetrics | null => {
    if (item.metrics) return item.metrics;
    if (item.f !== undefined && item.cd !== undefined) {
      return {
        g: item.g ?? 0,
        h: item.h ?? 0,
        f: item.f ?? 0,
        cd: item.cd ?? 0,
        md: item.md ?? 0,
        alpha_pct: item.alpha !== undefined ? Math.round(item.alpha  * 10) / 10 : 0,
        beta_pct: item.beta !== undefined ? Math.round(item.beta  * 10) / 10 : 0,
      };
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Control Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex gap-4 items-center flex-wrap">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Start City</label>
            <select 
              value={startCity} 
              onChange={(e) => setStartCity(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {initialNodesRaw.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Goal City</label>
            <select 
              value={goalCity} 
              onChange={(e) => setGoalCity(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {initialNodesRaw.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Algorithm</label>
            <select 
              value={algorithm} 
              onChange={(e) => setAlgorithm(e.target.value)}
              className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Cheby_A_Star">Chebyshev Adaptive A* (Dynamic CD+MD)</option>
              <option value="A*">A* Search (Standard)</option>
              <option value="HubAndSpoke">Hub-and-Spoke (Degree Boost)</option>
              <option value="Greedy">Greedy Best-First</option>
              <option value="BFS">BFS</option>
              <option value="DFS">DFS</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleSearch}
          disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-md transition shadow disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Run Pathfinding'}
        </button>
      </div>

      {/* Result Summary & Visualizer Log */}
      {path.length > 0 && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs md:text-sm text-emerald-950 flex flex-col gap-3 shadow-sm">
          {/* สรุปเส้นทาง */}
          <div className="flex flex-col gap-1">
            <div>
              <strong className="font-bold text-emerald-950">Optimal Path:</strong>{' '}
              <span className="font-semibold text-emerald-800">{path.join(' ➔ ')}</span>
            </div>
            <div className="flex flex-wrap gap-4 mt-1 text-emerald-900 font-medium text-xs">
              <span><strong>Total Cost:</strong> {cost} km</span>
              <span><strong>Execution Time:</strong> {execTime}</span>
              <span><strong>Nodes Explored:</strong> {steps.length} nodes</span>
            </div>
          </div>

          {/* Search Steps Log */}
          {stepsLog && stepsLog.length > 0 && (
            <div className="mt-2 border-t border-emerald-200/80 pt-3 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <strong className="font-bold text-emerald-950 text-xs">Search Process Steps:</strong>
                <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 font-medium">
                  {stepsLog.length} Iterations
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {stepsLog.map((log, idx) => {
                  const m = getMetrics(log);
                  const isAdaptive = algorithm === 'Cheby_A_Star' && m;

                  return (
                    <div key={log.step || idx} className="p-3 border border-slate-200 rounded-lg bg-white shadow-2xs flex flex-col gap-2.5">
                      {/* Card Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <span className="font-bold text-blue-600 text-xs flex items-center gap-1.5">
                          <span>Iteration {log.step || idx + 1}:</span>
                          <span className="text-gray-900 font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            {log.expanded_node}
                          </span>
                        </span>

                        {/* Standard f, g, h for non-adaptive search */}
                        {!isAdaptive && log.f !== undefined && log.f !== null && (
                          <div className="flex gap-1.5 text-[11px] font-mono">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">g: {log.g}</span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">h: {log.h}</span>
                            <span className="bg-blue-600 px-1.5 py-0.5 rounded text-white font-bold">f: {log.f}</span>
                          </div>
                        )}
                      </div>

                      {/* Special Adaptive UI Container */}
                      {isAdaptive && m && (
                        <div className="p-2.5 bg-slate-50 border border-indigo-100 rounded-md flex flex-col gap-2 text-xs">
                          {/* Formulas Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Heuristic Formula: h = alpha*CD + beta*MD */}
                            <div className="p-2 bg-white border border-indigo-100 rounded font-mono text-[11px] flex flex-col justify-between">
                              <span className="text-indigo-600 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">
                                Adaptive Heuristic ($h$)
                              </span>
                              <div className="text-slate-700">
                                <strong>h</strong> = ({m.alpha_pct}% × {m.cd}) + ({m.beta_pct}% × {m.md})
                              </div>
                              <div className="text-indigo-900 font-bold mt-1 text-right border-t border-slate-100 pt-0.5">
                                h = {m.h}
                              </div>
                            </div>

                            {/* Total Cost Formula: f = g + h */}
                            <div className="p-2 bg-white border border-indigo-100 rounded font-mono text-[11px] flex flex-col justify-between">
                              <span className="text-emerald-600 font-semibold text-[10px] uppercase tracking-wider block mb-0.5">
                                Total Priority Cost ($f$)
                              </span>
                              <div className="text-slate-700">
                                <strong>f</strong> = g ({m.g}) + h ({m.h})
                              </div>
                              <div className="text-emerald-900 font-bold mt-1 text-right border-t border-slate-100 pt-0.5">
                                f = {m.f}
                              </div>
                            </div>
                          </div>

                          {/* Alpha vs Beta Ratio Visualizer */}
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-medium text-slate-500">
                              <span>α (Chebyshev): {m.alpha_pct}%</span>
                              <span>β (Manhattan): {m.beta_pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                              <div className="bg-indigo-500 h-full" style={{ width: `${m.alpha_pct}%` }} />
                              <div className="bg-amber-400 h-full" style={{ width: `${m.beta_pct}%` }} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Neighbors List */}
                      {log.neighbors && log.neighbors.length > 0 && (
                        <div className="flex flex-col gap-1.5 mt-0.5">
                          <span className="text-gray-400 text-[11px] font-medium">Possible Next Neighbors:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {log.neighbors.map((n, nIdx) => {
                              const nm = getMetrics(n);
                              return (
                                <div key={nIdx} className="p-2 bg-gray-50 border border-gray-200 rounded text-[11px] flex flex-col justify-between">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-slate-800">{n.city}</span>
                                    {n.edge_cost && (
                                      <span className="text-[10px] text-slate-400 font-mono">+cost: {n.edge_cost}</span>
                                    )}
                                  </div>

                                  {/* Neighbor Adaptive Details */}
                                  {algorithm === 'Cheby_A_Star' && nm ? (
                                    <div className="font-mono text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-100 flex flex-col gap-0.5">
                                      <div>h = ({nm.alpha_pct}% × {nm.cd}) + ({nm.beta_pct}% × {nm.md}) = <strong>{nm.h}</strong></div>
                                      <div className="text-indigo-900 font-semibold border-t border-slate-100 pt-0.5">
                                        f = {nm.g} (g) + {nm.h} (h) ➔ <span className="text-blue-600 font-bold">{nm.f}</span>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Standard Neighbor Metrics */
                                    n.f !== undefined && (
                                      <div className="text-gray-500 font-mono text-[10px]">
                                        (g: {n.g}, h: {n.h} ➔ <strong className="text-blue-600">f: {n.f}</strong>)
                                      </div>
                                    )
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Flow Map Canvas */}
      <div className="w-full h-[500px] bg-slate-50 border border-gray-200 rounded-xl overflow-hidden relative shadow-inner">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </div>
  );
}