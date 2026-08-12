'use client';

import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, Handle, Position, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// 1. สร้าง Custom Node สำหรับแสดงผลเป็นจุดสี่เหลี่ยมเล็กๆ เหมือนในสไลด์
const CityNode = ({ data }: { data: { label: string; labelPosition?: 'top' | 'bottom' | 'left' | 'right' } }) => {
  // กำหนดตำแหน่งข้อความชื่อเมืองเทียบกับจุดสี่เหลี่ยม
  const getLabelPositionClass = () => {
    switch (data.labelPosition) {
      case 'left':
        return 'right-5 top-1/2 -translate-y-1/2 text-right';
      case 'top':
        return 'bottom-5 left-1/2 -translate-x-1/2 text-center';
      case 'bottom':
        return 'top-5 left-1/2 -translate-x-1/2 text-center';
      case 'right':
      default:
        return 'left-5 top-1/2 -translate-y-1/2 text-left';
    }
  };

  return (
    <div className="relative flex items-center justify-center w-3.5 h-3.5 bg-gray-400 border-2 border-gray-800 shadow-sm rounded-sm">
      {/* Target & Source Handles ซ่อนไว้ตรงกลางจุดเพื่อให้เส้นลากเข้าหาจุดพอดี */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-full !h-full !top-0 !left-0 !transform-none" />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-full !h-full !top-0 !left-0 !transform-none" />

      {/* ข้อความชื่อเมืองแยกอยู่นอกสี่เหลี่ยม */}
      <span className={`absolute whitespace-nowrap text-xs font-semibold text-gray-800 pointer-events-none ${getLabelPositionClass()}`}>
        {data.label}
      </span>
    </div>
  );
};

// 2. กำหนดพิกัดโหนด (ตั้งชนิด type: 'city' และระบุตำแหน่ง labelPosition)
const initialNodes: Node[] = [
  { id: 'Arad', type: 'city', position: { x: 50, y: 180 }, data: { label: 'Arad', labelPosition: 'left' } },
  { id: 'Zerind', type: 'city', position: { x: 90, y: 100 }, data: { label: 'Zerind', labelPosition: 'right' } },
  { id: 'Oradea', type: 'city', position: { x: 150, y: 30 }, data: { label: 'Oradea', labelPosition: 'right' } },
  { id: 'Timisoara', type: 'city', position: { x: 50, y: 320 }, data: { label: 'Timisoara', labelPosition: 'right' } },
  { id: 'Sibiu', type: 'city', position: { x: 280, y: 220 }, data: { label: 'Sibiu', labelPosition: 'top' } },
  { id: 'Lugoj', type: 'city', position: { x: 160, y: 380 }, data: { label: 'Lugoj', labelPosition: 'right' } },
  { id: 'Mehadia', type: 'city', position: { x: 160, y: 460 }, data: { label: 'Mehadia', labelPosition: 'right' } },
  { id: 'Drobeta', type: 'city', position: { x: 150, y: 550 }, data: { label: 'Drobeta', labelPosition: 'left' } },
  { id: 'Craiova', type: 'city', position: { x: 320, y: 580 }, data: { label: 'Craiova', labelPosition: 'bottom' } },
  { id: 'Rimnicu Vilcea', type: 'city', position: { x: 310, y: 320 }, data: { label: 'Rimnicu Vilcea', labelPosition: 'right' } },
  { id: 'Pitesti', type: 'city', position: { x: 450, y: 420 }, data: { label: 'Pitesti', labelPosition: 'top' } },
  { id: 'Fagaras', type: 'city', position: { x: 450, y: 220 }, data: { label: 'Fagaras', labelPosition: 'top' } },
  { id: 'Bucharest', type: 'city', position: { x: 600, y: 500 }, data: { label: 'Bucharest', labelPosition: 'bottom' } },
  { id: 'Giurgiu', type: 'city', position: { x: 550, y: 620 }, data: { label: 'Giurgiu', labelPosition: 'right' } },
  { id: 'Urziceni', type: 'city', position: { x: 700, y: 450 }, data: { label: 'Urziceni', labelPosition: 'bottom' } },
  { id: 'Hirsova', type: 'city', position: { x: 820, y: 450 }, data: { label: 'Hirsova', labelPosition: 'right' } },
  { id: 'Eforie', type: 'city', position: { x: 870, y: 580 }, data: { label: 'Eforie', labelPosition: 'bottom' } },
  { id: 'Vaslui', type: 'city', position: { x: 780, y: 310 }, data: { label: 'Vaslui', labelPosition: 'right' } },
  { id: 'Iasi', type: 'city', position: { x: 730, y: 180 }, data: { label: 'Iasi', labelPosition: 'right' } },
  { id: 'Neamt', type: 'city', position: { x: 620, y: 100 }, data: { label: 'Neamt', labelPosition: 'top' } },
];

// Style สำหรับเส้นเชื่อมและกล่องตัวเลขระยะทาง
const edgeOptions = {
  type: 'straight',
  style: { stroke: '#334155', strokeWidth: 1.5 },
  labelBgPadding: [4, 2] as [number, number],
  labelBgBorderRadius: 4,
  labelBgStyle: { fill: '#ffffff', color: '#0f172a' },
};

const initialEdges: Edge[] = [
  { id: 'e-arad-zerind', source: 'Arad', target: 'Zerind', label: '75', ...edgeOptions },
  { id: 'e-arad-timisoara', source: 'Arad', target: 'Timisoara', label: '118', ...edgeOptions },
  { id: 'e-arad-sibiu', source: 'Arad', target: 'Sibiu', label: '140', ...edgeOptions },
  { id: 'e-zerind-oradea', source: 'Zerind', target: 'Oradea', label: '71', ...edgeOptions },
  { id: 'e-oradea-sibiu', source: 'Oradea', target: 'Sibiu', label: '151', ...edgeOptions },
  { id: 'e-timisoara-lugoj', source: 'Timisoara', target: 'Lugoj', label: '111', ...edgeOptions },
  { id: 'e-lugoj-mehadia', source: 'Lugoj', target: 'Mehadia', label: '70', ...edgeOptions },
  { id: 'e-mehadia-drobeta', source: 'Mehadia', target: 'Drobeta', label: '75', ...edgeOptions },
  { id: 'e-drobeta-craiova', source: 'Drobeta', target: 'Craiova', label: '120', ...edgeOptions },
  { id: 'e-craiova-rimnicu', source: 'Craiova', target: 'Rimnicu Vilcea', label: '146', ...edgeOptions },
  { id: 'e-craiova-pitesti', source: 'Craiova', target: 'Pitesti', label: '138', ...edgeOptions },
  { id: 'e-sibiu-rimnicu', source: 'Sibiu', target: 'Rimnicu Vilcea', label: '80', ...edgeOptions },
  { id: 'e-sibiu-fagaras', source: 'Sibiu', target: 'Fagaras', label: '99', ...edgeOptions },
  { id: 'e-rimnicu-pitesti', source: 'Rimnicu Vilcea', target: 'Pitesti', label: '97', ...edgeOptions },
  { id: 'e-pitesti-bucharest', source: 'Pitesti', target: 'Bucharest', label: '101', ...edgeOptions },
  { id: 'e-fagaras-bucharest', source: 'Fagaras', target: 'Bucharest', label: '211', ...edgeOptions },
  { id: 'e-bucharest-giurgiu', source: 'Bucharest', target: 'Giurgiu', label: '90', ...edgeOptions },
  { id: 'e-bucharest-urziceni', source: 'Bucharest', target: 'Urziceni', label: '85', ...edgeOptions },
  { id: 'e-urziceni-hirsova', source: 'Urziceni', target: 'Hirsova', label: '98', ...edgeOptions },
  { id: 'e-hirsova-eforie', source: 'Hirsova', target: 'Eforie', label: '86', ...edgeOptions },
  { id: 'e-urziceni-vaslui', source: 'Urziceni', target: 'Vaslui', label: '142', ...edgeOptions },
  { id: 'e-vaslui-iasi', source: 'Vaslui', target: 'Iasi', label: '92', ...edgeOptions },
  { id: 'e-iasi-neamt', source: 'Iasi', target: 'Neamt', label: '87', ...edgeOptions },
];

export default function RenderMap() {
  // ลงทะเบียน Custom Node
  const nodeTypes = useMemo(() => ({ city: CityNode }), []);

  return (
    <div className="w-full h-[600px] bg-slate-50 border rounded-xl overflow-hidden relative shadow-inner">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background gap={16} size={1} />
        <Controls />
        <MiniMap zoomable pannable />
      </ReactFlow>
    </div>
  );
}