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
    <div className="w-full h-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        {/* Chart Container */}
        {/* flex-1 min-h-0 is crucial for nested flex charts to work properly */}
        <div className="flex-1 w-full min-h-0 p-2 relative">
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
                width={30}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
              <Line name="PID Target" type="monotone" dataKey="output" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
              <Line name="Actual Motor" type="monotone" dataKey="effective" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
    </div>
  );
};

export default Charts;