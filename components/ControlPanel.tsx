import React from 'react';
import { PIDParams, SimulationSettings } from '../types';
import { Sliders, RefreshCw, Wind, Activity, Zap, Waves, Weight, Sparkles } from 'lucide-react';
import { PHYSICS_CONSTANTS } from '../constants';

interface ControlPanelProps {
  pidParams: PIDParams;
  setPidParams: (params: PIDParams) => void;
  settings: SimulationSettings;
  setSettings: (settings: SimulationSettings) => void;
  onAddNoise: (direction: 'left' | 'right') => void;
  onReset: () => void;
  onAutoTune: () => void;
}

const Slider: React.FC<{ 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  step: number;
  color: string;
  desc: string;
  onChange: (val: number) => void 
}> = ({ label, value, min, max, step, color, desc, onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <label className={`text-sm font-bold ${color} flex items-center gap-2`}>
        {label}
        {desc && <span className="text-[10px] font-normal text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">{desc}</span>}
      </label>
      <span className="text-sm font-mono font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 min-w-[3rem] text-center">
        {value}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600 hover:accent-slate-800 transition-all"
    />
  </div>
);

const Toggle: React.FC<{
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onToggle: () => void;
}> = ({ label, active, icon, onToggle }) => (
  <button
    onClick={onToggle}
    className={`flex items-center justify-between w-full p-2.5 rounded-lg border transition-all ${
      active 
        ? 'bg-blue-50 border-blue-200 text-blue-700' 
        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
    }`}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </div>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${active ? 'bg-blue-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${active ? 'left-4.5' : 'left-0.5'}`} style={{ left: active ? '18px' : '2px' }} />
    </div>
  </button>
);

const ControlPanel: React.FC<ControlPanelProps> = ({ pidParams, setPidParams, settings, setSettings, onAddNoise, onReset, onAutoTune }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-full flex flex-col overflow-y-auto">
      
      {/* Physical Parameters Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
           <Weight size={18} className="text-slate-500" />
           <h3 className="text-sm font-semibold text-slate-800">Physical Parameters</h3>
        </div>
        <Slider
          label="Robot Mass"
          desc="kg"
          value={settings.robotMass}
          min={PHYSICS_CONSTANTS.MIN_MASS}
          max={PHYSICS_CONSTANTS.MAX_MASS}
          step={0.5}
          color="text-slate-700"
          onChange={(v) => setSettings({ ...settings, robotMass: v })}
        />
      </div>

      {/* PID Tuning Section */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
           <div className="flex items-center gap-2">
                <Sliders size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">PID Tuning</h3>
           </div>
           <button 
             onClick={onAutoTune}
             className="text-xs flex items-center gap-1 bg-violet-100 hover:bg-violet-200 text-violet-700 px-2 py-1 rounded transition-colors"
             title="Automatically set PID values based on mass"
           >
             <Sparkles size={12} />
             Auto Tune
           </button>
        </div>

        <div className="space-y-1">
            <Slider
            label="Kp"
            desc="Prop."
            value={pidParams.kp}
            min={0}
            max={1000}
            step={5}
            color="text-amber-600"
            onChange={(v) => setPidParams({ ...pidParams, kp: v })}
            />
            
            <Slider
            label="Ki"
            desc="Integ."
            value={pidParams.ki}
            min={0}
            max={50}
            step={0.5}
            color="text-emerald-600"
            onChange={(v) => setPidParams({ ...pidParams, ki: v })}
            />
            
            <Slider
            label="Kd"
            desc="Deriv."
            value={pidParams.kd}
            min={0}
            max={500}
            step={5}
            color="text-red-600"
            onChange={(v) => setPidParams({ ...pidParams, kd: v })}
            />
        </div>
      </div>

      {/* Environment Section */}
      <div className="mt-2 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Environment</h3>
        <div className="grid grid-cols-2 gap-2">
           <Toggle 
              label="Noise"
              active={settings.sensorNoise}
              icon={<Activity size={14} />}
              onToggle={() => setSettings({...settings, sensorNoise: !settings.sensorNoise})}
           />
           <Toggle 
              label="Wind"
              active={settings.turbulence}
              icon={<Waves size={14} />}
              onToggle={() => setSettings({...settings, turbulence: !settings.turbulence})}
           />
        </div>
      </div>

      {/* Actions Section */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interactions</h3>
        
        <div className="grid grid-cols-2 gap-2">
            <button
            onClick={() => onAddNoise('left')}
            className="flex flex-col items-center justify-center gap-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors text-xs font-medium active:bg-slate-200"
            >
            <Wind size={16} className="-scale-x-100 text-slate-400" />
            Smash Left
            </button>
            <button
            onClick={() => onAddNoise('right')}
            className="flex flex-col items-center justify-center gap-1 p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors text-xs font-medium active:bg-slate-200"
            >
            <Wind size={16} className="text-slate-400" />
            Smash Right
            </button>
        </div>

        <button
          onClick={onReset}
          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-all shadow-md active:scale-95 text-sm"
        >
          <RefreshCw size={16} />
          Reset Simulation
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
