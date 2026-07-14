#include "control_core.hpp"

#include <algorithm>
#include <cmath>

namespace ventilation {
namespace {
template <typename T>
T clamp(T value, T minimum, T maximum) {
  return std::min(maximum, std::max(minimum, value));
}
}  // namespace

Controller::Controller(ControlConfig config) : config_(config) {}

ControlSnapshot Controller::update(const ControlInput& input) {
  uint32_t dt_ms = 0U;
  if (has_timestamp_ && input.timestamp_ms >= last_timestamp_ms_) {
    dt_ms = static_cast<uint32_t>(std::min<uint64_t>(input.timestamp_ms - last_timestamp_ms_, 60000U));
  }
  last_timestamp_ms_ = input.timestamp_ms;
  has_timestamp_ = true;

  if (input.force_open) {
    state_ = ControlState::kForceOpen;
    fault_ = FaultCode::kNone;
    output_pct_ = 100.0F;
    return snapshot();
  }

  const FaultCode sensor_fault = evaluate_sensor(input, dt_ms);
  if (sensor_fault != FaultCode::kNone) {
    state_ = ControlState::kFault;
    fault_ = sensor_fault;
    output_pct_ = 100.0F;
    return snapshot();
  }

  if (!input.co2_valid) return snapshot();

  const float dt_s = static_cast<float>(dt_ms) / 1000.0F;
  update_filter(input.co2_ppm, dt_s);

  if (filtered_ppm_ >= config_.high_alarm_ppm) high_duration_ms_ += dt_ms;
  else high_duration_ms_ = 0U;

  if (high_duration_ms_ >= config_.high_alarm_delay_ms) {
    state_ = ControlState::kFault;
    fault_ = FaultCode::kHighCo2;
    output_pct_ = 100.0F;
    return snapshot();
  }

  if (valid_duration_ms_ < config_.startup_valid_ms) {
    state_ = ControlState::kStartup;
    fault_ = FaultCode::kNone;
    output_pct_ = 100.0F;
    return snapshot();
  }

  state_ = ControlState::kAuto;
  fault_ = FaultCode::kNone;
  output_pct_ = apply_ramp(compute_auto_output(dt_s), dt_s);
  return snapshot();
}

FaultCode Controller::evaluate_sensor(const ControlInput& input, uint32_t dt_ms) {
  if (!input.co2_valid || !std::isfinite(input.co2_ppm)) {
    valid_duration_ms_ = 0U;
    if (!has_valid_sample_ || input.timestamp_ms - last_valid_timestamp_ms_ >= config_.sensor_timeout_ms) {
      return FaultCode::kSensorMissing;
    }
    return FaultCode::kNone;
  }
  if (input.co2_ppm < config_.valid_min_ppm || input.co2_ppm > config_.valid_max_ppm) {
    valid_duration_ms_ = 0U;
    return FaultCode::kSensorRange;
  }
  has_valid_sample_ = true;
  last_valid_timestamp_ms_ = input.timestamp_ms;
  valid_duration_ms_ += dt_ms;
  return FaultCode::kNone;
}

void Controller::update_filter(float co2_ppm, float dt_s) {
  if (!filtered_ppm_valid_ || dt_s <= 0.0F) {
    filtered_ppm_ = co2_ppm;
    filtered_ppm_valid_ = true;
    return;
  }
  const float alpha = 1.0F - std::exp(-dt_s / config_.filter_tau_s);
  filtered_ppm_ += alpha * (co2_ppm - filtered_ppm_);
}

float Controller::compute_auto_output(float dt_s) {
  const float error = filtered_ppm_ - config_.target_ppm;
  const float proposed_integral = integral_ + error * dt_s;
  const float proposed = config_.min_output_pct + config_.kp_pct_per_ppm * error +
                         config_.ki_pct_per_ppm_s * proposed_integral;
  const bool saturating_high = proposed > config_.max_output_pct && error > 0.0F;
  const bool saturating_low = proposed < config_.min_output_pct && error < 0.0F;
  if (!saturating_high && !saturating_low) integral_ = proposed_integral;
  return clamp(config_.min_output_pct + config_.kp_pct_per_ppm * error +
                   config_.ki_pct_per_ppm_s * integral_,
               config_.min_output_pct, config_.max_output_pct);
}

float Controller::apply_ramp(float desired_pct, float dt_s) const {
  if (dt_s <= 0.0F) return output_pct_;
  const float delta = desired_pct - output_pct_;
  const float limit = (delta >= 0.0F ? config_.ramp_up_pct_per_s : config_.ramp_down_pct_per_s) * dt_s;
  return clamp(output_pct_ + clamp(delta, -std::abs(limit), std::abs(limit)),
               config_.min_output_pct, config_.max_output_pct);
}

ControlSnapshot Controller::snapshot() const {
  return {state_, fault_, output_pct_, filtered_ppm_, filtered_ppm_valid_, config_.target_ppm};
}

const char* to_string(ControlState state) {
  switch (state) {
    case ControlState::kStartup: return "STARTUP";
    case ControlState::kAuto: return "AUTO";
    case ControlState::kForceOpen: return "FORCE_OPEN";
    case ControlState::kFault: return "FAULT";
  }
  return "UNKNOWN";
}

const char* to_string(FaultCode fault) {
  switch (fault) {
    case FaultCode::kNone: return "NONE";
    case FaultCode::kSensorMissing: return "SENSOR_MISSING";
    case FaultCode::kSensorRange: return "SENSOR_RANGE";
    case FaultCode::kHighCo2: return "HIGH_CO2";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
