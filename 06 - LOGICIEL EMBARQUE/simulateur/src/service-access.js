export const SERVICE_STATE = Object.freeze({
  OFF: "OFF",
  STARTING: "STARTING",
  ACTIVE: "ACTIVE",
  STOPPING: "STOPPING",
  FAULT: "FAULT",
});

export const SERVICE_ACTION = Object.freeze({
  NONE: "NONE",
  START_WIFI: "START_WIFI",
  STOP_WIFI: "STOP_WIFI",
  INVALIDATE_SESSIONS: "INVALIDATE_SESSIONS",
});

export class ServiceAccess {
  constructor({ holdMs = 3000, durationMs = 15 * 60_000, startTimeoutMs = 10_000, maxStartAttempts = 2 } = {}) {
    if (![holdMs, durationMs, startTimeoutMs, maxStartAttempts].every(Number.isFinite)
      || holdMs <= 0 || durationMs <= 0 || startTimeoutMs <= 0 || !Number.isInteger(maxStartAttempts) || maxStartAttempts < 1) {
      throw new TypeError("Paramètres du mode service invalides.");
    }
    this.holdMs = holdMs;
    this.durationMs = durationMs;
    this.startTimeoutMs = startTimeoutMs;
    this.maxStartAttempts = maxStartAttempts;
    this.state = SERVICE_STATE.OFF;
    this.buttonSinceMs = null;
    this.buttonLatched = false;
    this.startDeadlineMs = null;
    this.expiresAtMs = null;
    this.startAttempts = 0;
    this.sessionGeneration = 0;
    this.lastNowMs = 0;
    this.fault = null;
  }

  update(input) {
    const nowMs = Math.max(this.lastNowMs, Number(input.nowMs) || 0);
    this.lastNowMs = nowMs;
    const actions = [];

    const activationRequested = this.#updateButton(Boolean(input.buttonPressed), nowMs);
    if (activationRequested && (this.state === SERVICE_STATE.OFF || this.state === SERVICE_STATE.FAULT)) {
      this.fault = null;
      this.startAttempts = 0;
      this.#requestStart(nowMs, actions);
    }

    if (this.state === SERVICE_STATE.STARTING) {
      if (input.wifiEvent === "STARTED") {
        this.state = SERVICE_STATE.ACTIVE;
        this.startDeadlineMs = null;
        this.expiresAtMs = nowMs + this.durationMs;
      } else if (input.wifiEvent === "FAILED" || nowMs >= this.startDeadlineMs) {
        if (this.startAttempts < this.maxStartAttempts) this.#requestStart(nowMs, actions);
        else {
          this.state = SERVICE_STATE.FAULT;
          this.startDeadlineMs = null;
          this.fault = "WIFI_START_FAILED";
          this.#invalidateSessions(actions);
        }
      }
    } else if (this.state === SERVICE_STATE.ACTIVE) {
      if (input.wifiEvent === "STOPPED") {
        this.fault = "WIFI_UNEXPECTED_STOP";
        this.startAttempts = 0;
        this.expiresAtMs = null;
        this.#invalidateSessions(actions);
        this.#requestStart(nowMs, actions);
      } else if (input.closeRequested || nowMs >= this.expiresAtMs) {
        this.state = SERVICE_STATE.STOPPING;
        this.expiresAtMs = null;
        actions.push(SERVICE_ACTION.STOP_WIFI);
      }
    } else if (this.state === SERVICE_STATE.STOPPING && input.wifiEvent === "STOPPED") {
      this.state = SERVICE_STATE.OFF;
      this.startAttempts = 0;
      this.#invalidateSessions(actions);
    }

    return this.snapshot(nowMs, actions);
  }

  snapshot(nowMs = this.lastNowMs, actions = []) {
    return {
      state: this.state,
      active: this.state === SERVICE_STATE.ACTIVE,
      remainingMs: this.state === SERVICE_STATE.ACTIVE ? Math.max(0, this.expiresAtMs - nowMs) : 0,
      startAttempts: this.startAttempts,
      sessionGeneration: this.sessionGeneration,
      fault: this.fault,
      actions,
    };
  }

  #updateButton(pressed, nowMs) {
    if (!pressed) {
      this.buttonSinceMs = null;
      this.buttonLatched = false;
      return false;
    }
    if (this.buttonSinceMs === null) this.buttonSinceMs = nowMs;
    if (!this.buttonLatched && nowMs - this.buttonSinceMs >= this.holdMs) {
      this.buttonLatched = true;
      return true;
    }
    return false;
  }

  #requestStart(nowMs, actions) {
    this.state = SERVICE_STATE.STARTING;
    this.startAttempts += 1;
    this.startDeadlineMs = nowMs + this.startTimeoutMs;
    actions.push(SERVICE_ACTION.START_WIFI);
  }

  #invalidateSessions(actions) {
    this.sessionGeneration += 1;
    actions.push(SERVICE_ACTION.INVALIDATE_SESSIONS);
  }
}
