#include "actuator_output.hpp"

#include <algorithm>

namespace ventilation {

float ActuatorOutput::bounded(float percent) {
  return std::clamp(percent, 0.0F, 100.0F);
}

bool ActuatorOutput::control_requires_safe_output(const ControlSnapshot& control) {
  return control.state == ControlState::kStartup ||
         control.state == ControlState::kForceOpen ||
         control.state == ControlState::kFault ||
         control.fault != FaultCode::kNone;
}

ActuatorOutputSnapshot ActuatorOutput::update(const ActuatorOutputInput& input) {
  uint8_t actions = kActuatorActionNone;

  if (!input.hardware_enable) {
    state_ = ActuatorOutputState::kSafeOutput;
    requested_pct_ = kActuatorSafeOutputPct;
    written_pct_ = kActuatorSafeOutputPct;
    pending_write_ = dfr0971_output_write(kActuatorSafeOutputPct, kActuatorAllChannels);
    safe_output_forced_ = true;
    actions |= kActuatorActionWriteSafeOutput;
    return snapshot(actions);
  }

  if (!input.range_configured) {
    state_ = ActuatorOutputState::kConfiguringRange;
    requested_pct_ = kActuatorSafeOutputPct;
    pending_write_ = dfr0971_configure_0_10v_write();
    safe_output_forced_ = true;
    actions |= kActuatorActionConfigureRange;
    return snapshot(actions);
  }

  if (!input.last_write_ok) {
    state_ = ActuatorOutputState::kFault;
    requested_pct_ = kActuatorSafeOutputPct;
    written_pct_ = kActuatorSafeOutputPct;
    pending_write_ = dfr0971_output_write(kActuatorSafeOutputPct, kActuatorAllChannels);
    safe_output_forced_ = true;
    actions |= kActuatorActionWriteSafeOutput;
    return snapshot(actions);
  }

  if (control_requires_safe_output(input.control)) {
    state_ = ActuatorOutputState::kSafeOutput;
    requested_pct_ = kActuatorSafeOutputPct;
    written_pct_ = kActuatorSafeOutputPct;
    pending_write_ = dfr0971_output_write(kActuatorSafeOutputPct, kActuatorAllChannels);
    safe_output_forced_ = true;
    actions |= kActuatorActionWriteSafeOutput;
    return snapshot(actions);
  }

  state_ = ActuatorOutputState::kFollowingController;
  requested_pct_ = bounded(input.control.output_pct);
  written_pct_ = requested_pct_;
  pending_write_ = dfr0971_output_write(written_pct_, kActuatorAllChannels);
  safe_output_forced_ = false;
  actions |= kActuatorActionWriteControllerOutput;
  return snapshot(actions);
}

ActuatorOutputSnapshot ActuatorOutput::snapshot(uint8_t actions) const {
  return ActuatorOutputSnapshot{
      .state = state_,
      .actions = actions,
      .requested_pct = requested_pct_,
      .written_pct = written_pct_,
      .write = pending_write_,
      .safe_output_forced = safe_output_forced_,
  };
}

const char* to_string(ActuatorOutputState state) {
  switch (state) {
    case ActuatorOutputState::kUnconfigured: return "UNCONFIGURED";
    case ActuatorOutputState::kConfiguringRange: return "CONFIGURING_RANGE";
    case ActuatorOutputState::kSafeOutput: return "SAFE_OUTPUT";
    case ActuatorOutputState::kFollowingController: return "FOLLOWING_CONTROLLER";
    case ActuatorOutputState::kFault: return "FAULT";
  }
  return "UNKNOWN";
}

const char* to_string(ActuatorOutputAction action) {
  switch (action) {
    case kActuatorActionNone: return "NONE";
    case kActuatorActionConfigureRange: return "CONFIGURE_RANGE";
    case kActuatorActionWriteSafeOutput: return "WRITE_SAFE_OUTPUT";
    case kActuatorActionWriteControllerOutput: return "WRITE_CONTROLLER_OUTPUT";
  }
  return "MULTIPLE";
}

}  // namespace ventilation
