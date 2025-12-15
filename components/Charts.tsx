import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { ChartDataPoint } from '../types';

interface ChartsProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded shadow-xl text-xs font-mono z-50">
        <p className="text-slate-300">Time: {Number(label).toFixed(2)}s</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {Number(p.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Charts: React.FC<ChartsProps> = ({ data }) => {
  // We only show the last N points to keep performance high
  const displayData = data.slice(-100);

  return (
    <div className="space-y-4 h-full flex flex-col">
      
      {/* Chart 1: System Response (Angle vs Setpoint) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1 min-h-[200px] flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          System Response (Angle)
        </h3>
        <div className="flex-1 w-full h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="time" 
                hide={true} 
                type="number" 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                domain={[-20, 20]} 
                tick={{fontSize: 10, fill: '#64748b'}} 
                axisLine={false}
                tickLine={false}
                unit="°"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="angle" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: PID & Motor Lag */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex-1 min-h-[200px] flex flex-col">
        <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
           Control & Motor Output (Newtons)
        </h3>
        <div className="flex-1 w-full h-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="time" 
                hide={true} 
                type="number" 
                domain={['dataMin', 'dataMax']}
              />
              <YAxis 
                tick={{fontSize: 10, fill: '#64748b'}} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
              <Line name="PID Target" type="monotone" dataKey="output" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              <Line name="Actual Motor" type="monotone" dataKey="effective" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line name="P" type="monotone" dataKey="p" stroke="#cbd5e1" strokeWidth={1} dot={false} isAnimationActive={false} hide={true} />
              <Line name="D" type="monotone" dataKey="d" stroke="#cbd5e1" strokeWidth={1} dot={false} isAnimationActive={false} hide={true} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;