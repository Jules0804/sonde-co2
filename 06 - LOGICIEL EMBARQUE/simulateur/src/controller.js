export const State = Object.freeze({
  STARTUP: "STARTUP",
  AUTO: "AUTO",
  FORCE_OPEN: "FORCE_OPEN",
  FAULT: "FAULT",
});

export const Fault = Object.freeze({
  NONE: "NONE",
  SENSOR_MISSING: "SENSOR_MISSING",
  SENSOR_RANGE: "SENSOR_RANGE",
  SENSOR_STALE: "SENSOR_STALE",
  HIGH_CO2: "HIGH_CO2",
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export class VentilationController {
  constructor(config = {}) {
    this.config = {
      targetPpm: 1000,
      minOutputPct: 20,
      maxOutputPct: 100,
      validMinPpm: 350,
      validMaxPpm: 5000,
      startupValidSeconds: 15,
      sensorTimeoutSeconds: 30,
      highAlarmPpm: 1500,
      highAlarmDelaySeconds: 60,
      filterTauSeconds: 60,
      kpPctPerPpm: 0.08,
      kiPctPerPpmSecond: 0.00035,
      rampUpPctPerSecond: 0.5,
      rampDownPctPerSecond: 0.2,
      ...config,
    };

    this.state = State.STARTUP;
    this.fault = Fault.NONE;
    this.outputPct = 100;
    this.filteredPpm = null;
    this.integral = 0;
    this.lastTimestampSeconds = null;
    this.lastValidTimestampSeconds = null;
    this.validDurationSeconds = 0;
    this.highDurationSeconds = 0;
  }

  update(input) {
    const now = input.timestampSeconds;
    const dt = this.lastTimestampSeconds === null
      ? 0
      : clamp(now - this.lastTimestampSeconds, 0, 60);
    this.lastTimestampSeconds = now;

    if (input.forceOpen === true) {
      this.state = State.FORCE_OPEN;
      this.fault = Fault.NONE;
      this.outputPct = 100;
      return this.snapshot();
    }

    const sensorFault = this.evaluateSensor(input.co2Ppm, now, dt);
    if (sensorFault !== Fault.NONE) {
      this.state = State.FAULT;
      this.fault = sensorFault;
      this.outputPct = 100;
      return this.snapshot();
    }

    this.updateFilter(input.co2Ppm, dt);

    if (this.filteredPpm >= this.config.highAlarmPpm) {
      this.highDurationSeconds += dt;
    } else {
      this.highDurationSeconds = 0;
    }

    if (this.highDurationSeconds >= this.config.highAlarmDelaySeconds) {
      this.state = State.FAULT;
      this.fault = Fault.HIGH_CO2;
      this.outputPct = 100;
      return this.snapshot();
    }

    if (this.validDurationSeconds < this.config.startupValidSeconds) {
      this.state = State.STARTUP;
      this.fault = Fault.NONE;
      this.outputPct = 100;
      return this.snapshot();
    }

    this.state = State.AUTO;
    this.fault = Fault.NONE;
    const desired = this.computeAutoOutput(dt);
    this.outputPct = this.applyRamp(desired, dt);
    return this.snapshot();
  }

  evaluateSensor(co2Ppm, now, dt) {
    if (co2Ppm === null || co2Ppm === undefined || Number.isNaN(co2Ppm)) {
      this.validDurationSeconds = 0;
      if (this.lastValidTimestampSeconds === null ||
          now - this.lastValidTimestampSeconds >= this.config.sensorTimeoutSeconds) {
        return Fault.SENSOR_MISSING;
      }
      return Fault.NONE;
    }

    if (co2Ppm < this.config.validMinPpm || co2Ppm > this.config.validMaxPpm) {
      this.validDurationSeconds = 0;
      return Fault.SENSOR_RANGE;
    }

    this.lastValidTimestampSeconds = now;
    this.validDurationSeconds += dt;
    return Fault.NONE;
  }

  updateFilter(co2Ppm, dt) {
    if (this.filteredPpm === null || dt === 0) {
      this.filteredPpm = co2Ppm;
      return;
    }
    const alpha = 1 - Math.exp(-dt / this.config.filterTauSeconds);
    this.filteredPpm += alpha * (co2Ppm - this.filteredPpm);
  }

  computeAutoOutput(dt) {
    const error = this.filteredPpm - this.config.targetPpm;
    const proposedIntegral = this.integral + error * dt;
    const rawWithProposedIntegral = this.config.minOutputPct +
      this.config.kpPctPerPpm * error +
      this.config.kiPctPerPpmSecond * proposedIntegral;

    const saturatingHigh = rawWithProposedIntegral > this.config.maxOutputPct && error > 0;
    const saturatingLow = rawWithProposedIntegral < this.config.minOutputPct && error < 0;
    if (!saturatingHigh && !saturatingLow) {
      this.integral = proposedIntegral;
    }

    const raw = this.config.minOutputPct +
      this.config.kpPctPerPpm * error +
      this.config.kiPctPerPpmSecond * this.integral;
    return clamp(raw, this.config.minOutputPct, this.config.maxOutputPct);
  }

  applyRamp(desiredPct, dt) {
    if (dt <= 0) return this.outputPct;
    const delta = desiredPct - this.outputPct;
    const limit = delta >= 0
      ? this.config.rampUpPctPerSecond * dt
      : this.config.rampDownPctPerSecond * dt;
    return clamp(
      this.outputPct + clamp(delta, -Math.abs(limit), Math.abs(limit)),
      this.config.minOutputPct,
      this.config.maxOutputPct,
    );
  }

  snapshot() {
    return {
      state: this.state,
      fault: this.fault,
      outputPct: Number(this.outputPct.toFixed(3)),
      filteredPpm: this.filteredPpm === null ? null : Number(this.filteredPpm.toFixed(1)),
      targetPpm: this.config.targetPpm,
    };
  }
}
