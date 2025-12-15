import { useState, useRef, useEffect, useCallback } from 'react';
import { SimulationState, PIDParams, ChartDataPoint, SimulationSettings } from '../types';
import { DEFAULT_PID, CHART_HISTORY_LENGTH, PHYSICS_CONSTANTS } from '../constants';

const INITIAL_STATE: SimulationState = {
  angle: 0.02,
  angularVelocity: 0,
  ballPosition: 0,
  ballVelocity: 0,
  integralError: 0,
  lastError: 0,
  timestamp: 0,
  controlOutput: 0,
  effectiveForce: 0,
  pTerm: 0,
  iTerm: 0,
  dTerm: 0,
  measuredAngle: 0.02,
  crashed: false
};

// Simple audio synthesizer for crash sound
const playCrashSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    // 1. Low frequency thud (Impact)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    gain.gain.setValueAtTime(1.0, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);

    // 2. White noise burst (Crunch/Scrape)
    const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1000, t);
    noiseFilter.frequency.linearRampToValueAtTime(100, t + 0.2);

    noiseGain.gain.setValueAtTime(0.5, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);
  const [pidParams, setPidParams] = useState<PIDParams>(DEFAULT_PID);
  const [settings, setSettings] = useState<SimulationSettings>({ 
    sensorNoise: false, 
    turbulence: false,
    robotMass: PHYSICS_CONSTANTS.DEFAULT_MASS 
  });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  
  // Refs for physics loop
  const stateRef = useRef<SimulationState>(INITIAL_STATE);
  const pidRef = useRef<PIDParams>(DEFAULT_PID);
  const settingsRef = useRef<SimulationSettings>({ 
    sensorNoise: false, 
    turbulence: false,
    robotMass: PHYSICS_CONSTANTS.DEFAULT_MASS 
  });
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const impulseRef = useRef<number>(0);
  const currentMotorForceRef = useRef<number>(0); 
  const isCrashedRef = useRef<boolean>(false);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    pidRef.current = pidParams;
  }, [pidParams]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  const reset = useCallback(() => {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    
    stateRef.current = { 
      ...INITIAL_STATE, 
      angle: (Math.random() - 0.5) * 0.15,
      measuredAngle: 0
    };
    currentMotorForceRef.current = 0;
    isCrashedRef.current = false;
    
    setState(stateRef.current);
    setChartData([]);
    lastTimeRef.current = performance.now();
  }, []);

  const autoTune = useCallback(() => {
    const m = settingsRef.current.robotMass;
    const suggestedKp = m * 80; 
    const suggestedKd = m * 15; 
    const suggestedKi = m * 2.5; 

    const newParams = {
        kp: parseFloat(suggestedKp.toFixed(1)),
        ki: parseFloat(suggestedKi.toFixed(1)),
        kd: parseFloat(suggestedKd.toFixed(1))
    };
    setPidParams(newParams);
    reset();
  }, [reset]);

  const addImpulse = useCallback((magnitude: number) => {
    if (!isCrashedRef.current) {
      impulseRef.current = magnitude;
    }
  }, []);

  const updatePhysics = useCallback((time: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = time;
    
    // If crashed, stop physics updates but allow render to show the fallen state
    if (isCrashedRef.current) {
       lastTimeRef.current = time;
       requestRef.current = requestAnimationFrame(updatePhysics);
       return;
    }

    let dt = (time - lastTimeRef.current) / 1000;
    dt = Math.min(dt, 0.05); 
    lastTimeRef.current = time;

    const s = stateRef.current;
    const p = pidRef.current;
    const setts = settingsRef.current;
    const mass = setts.robotMass;

    const subSteps = 10;
    const subDt = dt / subSteps;

    let currentAngle = s.angle;
    let currentOmega = s.angularVelocity;
    let currentPos = s.ballPosition;
    let currentVel = s.ballVelocity;
    let currentIntegral = s.integralError;
    let currentLastError = s.lastError;
    
    let actualForce = currentMotorForceRef.current;

    let targetControl = 0;
    let lastP = 0, lastI = 0, lastD = 0;
    let lastMeasuredAngle = 0;

    for (let i = 0; i < subSteps; i++) {
      // 1. Measurement
      const sensorNoise = setts.sensorNoise ? (Math.random() - 0.5) * PHYSICS_CONSTANTS.NOISE_MAGNITUDE : 0;
      const measuredAngle = currentAngle + sensorNoise;
      lastMeasuredAngle = measuredAngle;

      // 2. PID
      const error = 0 - measuredAngle;
      currentIntegral += error * subDt;
      const maxIntegral = PHYSICS_CONSTANTS.MAX_FORCE / (p.ki || 1); 
      currentIntegral = Math.max(-maxIntegral, Math.min(maxIntegral, currentIntegral));

      const derivative = -currentOmega; 

      const pTerm = p.kp * error;
      const iTerm = p.ki * currentIntegral;
      const dTerm = p.kd * derivative;

      let desiredForce = -(pTerm + iTerm + dTerm);
      desiredForce = Math.max(-PHYSICS_CONSTANTS.MAX_FORCE, Math.min(PHYSICS_CONSTANTS.MAX_FORCE, desiredForce));
      targetControl = desiredForce;

      lastP = pTerm;
      lastI = iTerm;
      lastD = dTerm;

      // 3. Motor Lag
      const lagFactor = subDt / PHYSICS_CONSTANTS.MOTOR_TIME_CONSTANT;
      actualForce += (desiredForce - actualForce) * lagFactor;

      // 4. Dynamics
      const u = actualForce / mass;
      const turbulence = setts.turbulence ? (Math.random() - 0.5) * PHYSICS_CONSTANTS.TURBULENCE_MAGNITUDE : 0;
      const impulseForce = impulseRef.current; 
      impulseRef.current = 0; 

      const g = PHYSICS_CONSTANTS.GRAVITY;
      const L = PHYSICS_CONSTANTS.LENGTH;

      const externalAccelTerm = (turbulence + impulseForce) / (mass * L);
      const angularFriction = PHYSICS_CONSTANTS.ANGULAR_DRAG * currentOmega;
      const alpha = (g * Math.sin(currentAngle) - u * Math.cos(currentAngle)) / L + externalAccelTerm - angularFriction;

      currentOmega += alpha * subDt;
      currentAngle += currentOmega * subDt;

      currentVel += u * subDt;
      currentVel *= 0.995; 
      currentPos += currentVel * subDt;
      
      // CRASH DETECTION
      // If angle > MAX_ANGLE, we consider it a crash.
      if (Math.abs(currentAngle) > PHYSICS_CONSTANTS.MAX_ANGLE) {
        isCrashedRef.current = true;
        // Clamp angle for visual "floor" hit
        currentAngle = currentAngle > 0 ? Math.PI / 2 : -Math.PI / 2;
        currentOmega = 0;
        playCrashSound();
        
        // Schedule Reset
        resetTimeoutRef.current = setTimeout(() => {
            reset();
        }, 2000);
        
        break; // Stop substepping
      }
    }

    currentMotorForceRef.current = actualForce;

    const newState: SimulationState = {
      angle: currentAngle,
      angularVelocity: currentOmega,
      ballPosition: currentPos,
      ballVelocity: currentVel,
      integralError: currentIntegral,
      lastError: currentLastError,
      timestamp: s.timestamp + dt,
      controlOutput: targetControl,
      effectiveForce: actualForce, 
      pTerm: lastP,
      iTerm: lastI,
      dTerm: lastD,
      measuredAngle: lastMeasuredAngle,
      crashed: isCrashedRef.current
    };

    stateRef.current = newState;
    setState(newState);

    if (!isCrashedRef.current && Math.floor(s.timestamp * 100) % 5 === 0) {
      setChartData(prev => {
        const newData = [...prev, {
          time: newState.timestamp,
          angle: (newState.angle * 180 / Math.PI),
          setpoint: 0,
          output: newState.controlOutput,
          effective: newState.effectiveForce,
          p: lastP,
          i: lastI,
          d: lastD
        }];
        return newData.length > CHART_HISTORY_LENGTH ? newData.slice(newData.length - CHART_HISTORY_LENGTH) : newData;
      });
    }

    requestRef.current = requestAnimationFrame(updatePhysics);
  }, [reset]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updatePhysics);
    return () => {
        cancelAnimationFrame(requestRef.current);
        if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, [updatePhysics]);

  return {
    state,
    pidParams,
    setPidParams,
    settings,
    setSettings,
    chartData,
    addImpulse,
    reset,
    autoTune
  };
};
