import React from 'react';
import { SimulationState } from '../types';
import { Activity, Compass, Zap } from 'lucide-react';

interface IMUDisplayProps {
  state: SimulationState;
}

const SensorCard: React.FC<{ title: string; value: string; unit: string; icon: React.ReactNode; color: string }> = ({ title, value, unit, icon, color }) => (
  <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-md bg-slate-700/50 ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">{title}</div>
        <div className="text-xl font-mono text-white font-medium">
          {value}<span className="text-sm text-slate-500 ml-1">{unit}</span>
        </div>
      </div>
    </div>
  </div>
);

const IMUDisplay: React.FC<IMUDisplayProps> = ({ state }) => {
  const angleDeg = (state.angle * 180 / Math.PI).toFixed(1);
  const angularVelDeg = (state.angularVelocity * 180 / Math.PI).toFixed(1);
  const motorOut = state.controlOutput.toFixed(1);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SensorCard 
            title="Tilt Angle" 
            value={angleDeg} 
            unit="°" 
            icon={<Compass size={18} />}
            color="text-cyan-400"
        />
        <SensorCard 
            title="Angular Vel" 
            value={angularVelDeg} 
            unit="°/s" 
            icon={<Activity size={18} />}
            color="text-violet-400"
        />
        <SensorCard 
            title="Motor Torque" 
            value={motorOut} 
            unit="Nm" 
            icon={<Zap size={18} />}
            color="text-yellow-400"
        />
    </div>
  );
};

export default IMUDisplay;
