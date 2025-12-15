export interface PIDParams {
  kp: number;
  ki: number;
  kd: number;
}

export interface SimulationSettings {
  sensorNoise: boolean;
  turbulence: boolean;
  robotMass: number; // kg
}

export interface SimulationState {
  angle: number; // in radians, 0 is upright
  angularVelocity: number; // radians/sec
  ballPosition: number; // meters
  ballVelocity: number; // m/s
  integralError: number;
  lastError: number;
  timestamp: number;
  controlOutput: number; // The target force requested by PID
  effectiveForce: number; // The actual force applied after motor lag
  pTerm: number;
  iTerm: number;
  dTerm: number;
  measuredAngle: number; // Noisy angle used by PID
  crashed: boolean; // New: detects if robot has fallen
}

export interface ChartDataPoint {
  time: number;
  angle: number;
  setpoint: number;
  output: number; // Target
  effective: number; // Actual
  p: number;
  i: number;
  d: number;
}
