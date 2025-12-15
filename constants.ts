export const PHYSICS_CONSTANTS = {
  GRAVITY: 9.81,
  LENGTH: 0.8, // Center of mass height (meters)
  DEFAULT_MASS: 5.0, // kg
  MIN_MASS: 1.0,
  MAX_MASS: 20.0,
  DT: 0.016, // Main loop time step
  MAX_FORCE: 250.0, // Max Motor Force (Newtons).
  MAX_ANGLE: Math.PI / 2.2, // ~80 degrees
  NOISE_MAGNITUDE: 0.05, // Radians of sensor noise
  TURBULENCE_MAGNITUDE: 25.0, // Magnitude of random force (Newtons)
  MOTOR_TIME_CONSTANT: 0.04, // 40ms lag - Critical for realism. P-only will now oscillate/fail.
  ANGULAR_DRAG: 0.1, // Air resistance/bearing friction
};

export const DEFAULT_PID = {
  kp: 400.0, // Increased Kp to handle lag
  ki: 2.5,   
  kd: 60.0,  // Increased Kd significantly to damp the lag-induced oscillations
};

export const CHART_HISTORY_LENGTH = 150;
