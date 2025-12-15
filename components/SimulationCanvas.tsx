import React, { useRef, useState } from 'react';
import { SimulationState } from '../types';
import { MousePointer2, Wind, AlertTriangle } from 'lucide-react';
import { PHYSICS_CONSTANTS } from '../constants';

interface SimulationCanvasProps {
  simulationState: SimulationState;
  turbulence: boolean;
  robotMass?: number;
  onApplyForce: (force: number) => void;
}

const SimulationCanvas: React.FC<SimulationCanvasProps> = ({ 
    simulationState, 
    turbulence, 
    robotMass = PHYSICS_CONSTANTS.DEFAULT_MASS, 
    onApplyForce 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverForce, setHoverForce] = useState<number>(0);
  const [clickEffect, setClickEffect] = useState<{x: number, y: number, id: number} | null>(null);

  const { angle, crashed } = simulationState;

  // Visual Angle: If crashed, snap to 90 degrees (floor)
  const angleDeg = crashed 
    ? (angle > 0 ? 90 : -90) 
    : (angle * 180) / Math.PI;
  
  // Calculate robot color based on stability
  const stabilityColor = crashed
    ? '#ef4444' // Red
    : Math.abs(angleDeg) < 5 
      ? '#10b981' // emerald-500
      : Math.abs(angleDeg) < 20 
        ? '#f59e0b' // amber-500
        : '#ef4444'; 

  // Dynamic ball rotation simulation
  const ballRotation = -(simulationState.ballPosition * 100) % 360;

  // Mass visual scaling
  const massScale = 1 + (robotMass / 40); 

  const handleMouseMove = (e: React.MouseEvent) => {
    if (crashed) {
        setHoverForce(0);
        return;
    }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const mouseX = e.clientX - rect.left;
    const dist = (mouseX - centerX);
    
    if (Math.abs(dist) < 300) {
       setHoverForce(dist > 0 ? -1 : 1);
    } else {
        setHoverForce(0);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
      if (crashed) return;
      if (hoverForce !== 0) {
          const rect = containerRef.current!.getBoundingClientRect();
          setClickEffect({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
              id: Date.now()
          });
          setTimeout(() => setClickEffect(null), 500);
          onApplyForce(hoverForce * 300);
      }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-700 flex items-center justify-center select-none group cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverForce(0)}
      onClick={handleClick}
    >
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none transition-transform duration-100"
           style={{ transform: turbulence ? 'scale(1.02)' : 'scale(1)' }}>
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Turbulence Visuals */}
      {turbulence && !crashed && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute h-0.5 bg-white/50 blur-[1px] animate-wind"
                    style={{
                        top: `${20 + i * 15}%`,
                        left: '-100px',
                        width: '200px',
                        animationDuration: `${2 + Math.random()}s`,
                        animationDelay: `${Math.random() * 2}s`
                    }}
                />
            ))}
        </div>
      )}

      {/* Floor Line */}
      <div className="absolute bottom-1/4 w-full h-0.5 bg-slate-600 shadow-[0_0_10px_rgba(255,255,255,0.2)]" />

      {/* The BallBot Container */}
      <div 
        className="absolute bottom-1/4 transition-transform duration-75 ease-linear will-change-transform"
        style={{
          transform: `translateX(${simulationState.ballPosition * 20}px)` 
        }}
      >
        {/* The Ball */}
        <div 
            className="w-16 h-16 rounded-full bg-slate-800 shadow-xl relative z-10 flex items-center justify-center border border-slate-600 overflow-hidden"
            style={{
                transform: `rotate(${ballRotation}deg)`,
                background: 'radial-gradient(circle at 30% 30%, #475569, #0f172a)'
            }}
        >
            <div className="absolute inset-0 border-2 border-dashed border-slate-500/30 rounded-full opacity-50"></div>
            <div className="w-full h-px bg-slate-500/30 absolute"></div>
            <div className="h-full w-px bg-slate-500/30 absolute"></div>
        </div>

        {/* The Robot Body (Pivot at center of ball) */}
        {/* If crashed, we add a class for vibration/shock */}
        <div 
            className={`absolute bottom-8 left-1/2 w-0 h-0 flex flex-col items-center origin-bottom z-20 will-change-transform ${turbulence && !crashed ? 'animate-shudder' : ''} ${crashed ? 'animate-crash' : ''}`}
            style={{
                transform: `translateX(-50%) rotate(${angleDeg}deg)`,
                transition: crashed ? 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'none'
            }}
        >
            {/* The Robot Chassis */}
            <div className="absolute bottom-[30px] -left-[40px] w-[80px] h-[220px] pointer-events-none">
                
                {/* 1. Drive System (Motors) */}
                <div className="absolute bottom-0 w-full h-16">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-slate-900/50 blur-[2px]"></div>
                    <div className="absolute bottom-4 left-1 w-5 h-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-sm border border-slate-700 transform -rotate-12 shadow-lg"></div>
                    <div className="absolute bottom-4 right-1 w-5 h-12 bg-gradient-to-r from-slate-600 to-slate-500 rounded-sm border border-slate-700 transform rotate-12 shadow-lg"></div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-14 bg-gradient-to-b from-slate-600 to-slate-700 rounded border border-slate-500 shadow-xl flex flex-col items-center z-10">
                        <div className={`w-6 h-6 mt-2 rounded-full border-2 border-slate-400 bg-slate-800 flex items-center justify-center ${Math.abs(simulationState.controlOutput) > 10 ? 'animate-spin' : ''}`}>
                            <div className="w-1 h-3 bg-slate-400"></div>
                        </div>
                    </div>
                </div>

                {/* 2. Main Chassis Frame */}
                <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-16 h-40">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-400 rounded-full"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-slate-400 rounded-full"></div>
                    
                    {/* Broken Frame Effect */}
                    {crashed && (
                        <>
                           <div className="absolute top-10 -left-4 w-10 h-1 bg-yellow-400 animate-spark1" />
                           <div className="absolute top-20 -right-4 w-8 h-1 bg-yellow-400 animate-spark2" />
                        </>
                    )}

                    {/* 3. Electronics Deck */}
                    <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 w-20 h-24 bg-slate-800/90 border border-slate-600 rounded-md backdrop-blur-sm p-1 shadow-lg z-20 transition-transform duration-500 ${crashed ? 'translate-y-4 rotate-6' : ''}`}>
                         {/* ... content ... */}
                         <div className="w-full h-full bg-emerald-900/30 border border-emerald-500/30 rounded relative overflow-hidden">
                             {crashed ? (
                                 <div className="absolute inset-0 flex items-center justify-center bg-red-900/50 animate-pulse">
                                     <AlertTriangle className="text-red-500" size={32} />
                                 </div>
                             ) : (
                                <>
                                    <svg className="absolute inset-0 w-full h-full opacity-30">
                                        <path d="M 2 2 L 10 10 L 10 30" stroke="#10b981" fill="none" strokeWidth="1"/>
                                    </svg>
                                    <div className="absolute bottom-2 left-2 flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse delay-75"></div>
                                    </div>
                                </>
                             )}
                        </div>
                    </div>

                    {/* 4. Top Mass / Battery (Detaches on Crash) */}
                    <div 
                        className={`absolute top-8 left-1/2 -translate-x-1/2 w-14 h-16 bg-slate-300 rounded border-2 border-slate-400 shadow-md flex items-center justify-center transition-all duration-700 ease-out`}
                        style={{ 
                            transform: crashed 
                                ? `translate(${angleDeg > 0 ? '50px' : '-50px'}, 80px) rotate(${angleDeg > 0 ? '120deg' : '-120deg'}) scale(${massScale})` 
                                : `translateX(-50%) scale(${massScale})` 
                        }}
                    >
                        <div className="w-10 h-12 border border-slate-400/50 rounded flex flex-col items-center justify-center gap-1">
                             <span className="text-[6px] font-bold text-slate-600 tracking-widest">LIPO</span>
                             <div className={`w-6 h-2 ${crashed ? 'bg-slate-500' : 'bg-yellow-400'} rounded-sm`}></div>
                        </div>
                    </div>
                </div>

                {/* 5. Head / Sensor Array (Detaches on Crash) */}
                <div 
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-10 bg-slate-800 rounded-lg border border-slate-600 shadow-xl flex items-center justify-center overflow-hidden z-30 transition-all duration-500 ease-out`}
                    style={{
                        borderColor: stabilityColor,
                        transform: crashed
                             ? `translate(${angleDeg > 0 ? '60px' : '-60px'}, 20px) rotate(${angleDeg > 0 ? '45deg' : '-45deg'})`
                             : 'translateX(-50%)'
                    }}
                >
                     <div className="text-[8px] font-mono text-cyan-400 leading-none text-center z-10">
                        {crashed ? <span className="text-red-500 font-bold">ERR</span> : (
                            <>
                                <div>GYRO</div>
                                <div>{crashed ? '---' : angleDeg.toFixed(1)}°</div>
                            </>
                        )}
                     </div>
                </div>
            </div>
        </div>

        {/* Force Indicators */}
        {!crashed && simulationState.controlOutput !== 0 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 flex justify-center items-center pointer-events-none">
                <div 
                    className={`h-8 flex items-center ${simulationState.controlOutput > 0 ? 'justify-start flex-row-reverse' : 'justify-end flex-row'}`}
                    style={{ width: '200px' }}
                >
                     <div 
                        className="h-1 bg-yellow-400/70 shadow-[0_0_8px_rgba(250,204,21,0.6)] rounded-full transition-all duration-75"
                        style={{ width: `${Math.min(Math.abs(simulationState.controlOutput), 120)}px` }}
                     />
                </div>
            </div>
        )}
      </div>

      {/* Crash Overlay Text */}
      {crashed && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
              <div className="bg-red-600/90 text-white px-8 py-4 rounded-xl shadow-2xl transform animate-bounce flex flex-col items-center border-4 border-white/20">
                  <h2 className="text-4xl font-black italic tracking-tighter uppercase">CRASHED!</h2>
                  <p className="text-sm font-mono mt-1 opacity-90">RESETTING SYSTEM...</p>
              </div>
          </div>
      )}

      {/* Mouse Interaction Indicator */}
      {!crashed && hoverForce !== 0 && (
          <div 
            className="absolute pointer-events-none text-white/80 flex items-center gap-2 animate-bounce"
            style={{
                top: '40%',
                left: hoverForce > 0 ? '20%' : 'auto',
                right: hoverForce < 0 ? '20%' : 'auto',
            }}
          >
             {hoverForce > 0 ? <MousePointer2 className="rotate-90" /> : <MousePointer2 className="-rotate-90" />}
             <span className="text-sm font-bold shadow-black drop-shadow-md">SMASH</span>
          </div>
      )}

      {/* Click Visual Effect */}
      {clickEffect && (
          <div 
            className="absolute w-12 h-12 rounded-full border-4 border-red-500/80 animate-ping pointer-events-none"
            style={{ left: clickEffect.x - 24, top: clickEffect.y - 24 }}
          />
      )}

      {/* Overlay Info */}
      <div className="absolute top-4 left-4 text-slate-400 text-xs font-mono bg-slate-800/80 p-2 rounded backdrop-blur-md border border-slate-700 pointer-events-none">
        <div>SIM_TIME: {simulationState.timestamp.toFixed(2)}s</div>
        <div>MASS: {robotMass}kg</div>
        {crashed && <div className="text-red-500 font-bold">SYSTEM FAILURE</div>}
      </div>
      
      <style>{`
        @keyframes wind {
            0% { transform: translateX(0); opacity: 0; }
            10% { opacity: 0.5; }
            90% { opacity: 0.5; }
            100% { transform: translateX(100vw); opacity: 0; }
        }
        .animate-wind {
            animation-name: wind;
            animation-timing-function: linear;
            animation-iteration-count: infinite;
        }
        @keyframes shudder {
            0%, 100% { transform: translateX(-50%) rotate(${angleDeg}deg); }
            25% { transform: translateX(calc(-50% + 1px)) rotate(${angleDeg + 0.5}deg); }
            75% { transform: translateX(calc(-50% - 1px)) rotate(${angleDeg - 0.5}deg); }
        }
        .animate-shudder {
            animation: shudder 0.2s linear infinite;
        }
        @keyframes spark1 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(-20px, -20px) scale(0); opacity: 0; }
        }
        .animate-spark1 { animation: spark1 0.4s ease-out infinite; }
        @keyframes spark2 {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(20px, -20px) scale(0); opacity: 0; }
        }
        .animate-spark2 { animation: spark2 0.3s ease-out infinite; }
        
        /* Crash Animation: Quick vibration then settle */
        @keyframes crashShake {
             0% { transform: translateX(-50%) rotate(${angleDeg}deg); }
             10%, 30%, 50%, 70%, 90% { transform: translateX(calc(-50% - 2px)) rotate(${angleDeg}deg); }
             20%, 40%, 60%, 80% { transform: translateX(calc(-50% + 2px)) rotate(${angleDeg}deg); }
             100% { transform: translateX(-50%) rotate(${angleDeg}deg); }
        }
        .animate-crash {
            animation: crashShake 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SimulationCanvas;