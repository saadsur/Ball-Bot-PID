import React from 'react';
import { useSimulation } from './hooks/useSimulation';
import SimulationCanvas from './components/SimulationCanvas';
import ControlPanel from './components/ControlPanel';
import Charts from './components/Charts';
import IMUDisplay from './components/IMUDisplay';
import { Bot, Info } from 'lucide-react';

const App: React.FC = () => {
  const { 
    state, 
    pidParams, 
    setPidParams, 
    settings, 
    setSettings, 
    chartData, 
    addImpulse, 
    reset,
    autoTune
  } = useSimulation();

  const handleApplyForce = (val: number) => {
    addImpulse(val);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-500/30">
            <Bot size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">BallBot <span className="text-blue-600">Sim</span></h1>
            <p className="text-[10px] text-slate-500 font-medium hidden sm:block">PID Balance Controller Visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
           <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-full">
             <span className={`w-2 h-2 rounded-full ${Math.abs(state.angle) < 0.2 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
             <span className="font-semibold">{Math.abs(state.angle) < 0.5 ? 'STABLE' : 'CRASHED'}</span>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-6 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Simulation & IMU */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Simulation Viewport - Dynamic Height for Mobile */}
            <div className="h-[45vh] min-h-[350px] lg:h-[600px] relative">
               <SimulationCanvas 
                  simulationState={state} 
                  turbulence={settings.turbulence}
                  robotMass={settings.robotMass}
                  onApplyForce={handleApplyForce} 
               />
            </div>

            {/* Sensor Dashboard */}
            <div className="shrink-0">
               <IMUDisplay state={state} />
            </div>

             {/* Charts Area - Hidden on very small screens if needed, or scrollable */}
            <div className="h-64 shrink-0 hidden sm:block">
               <Charts data={chartData} />
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="lg:col-span-4 pb-8">
            <ControlPanel 
              pidParams={pidParams} 
              setPidParams={setPidParams}
              settings={settings}
              setSettings={setSettings}
              onAddNoise={(dir) => addImpulse(dir === 'left' ? -300 : 300)}
              onReset={reset}
              onAutoTune={autoTune}
            />
            
            {/* Educational Info Snippet */}
            <div className="mt-4 bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-blue-900 leading-relaxed">
              <h4 className="font-bold flex items-center gap-2 mb-2">
                <Info size