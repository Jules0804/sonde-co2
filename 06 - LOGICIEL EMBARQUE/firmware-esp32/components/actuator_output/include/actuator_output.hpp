#pragma once

#include <cstdint>

#include "control_core.hpp"
#include "lot1_drivers.hpp"

namespace ventilation {

constexpr float kActuatorSafeOutputPct = 100.0F;
constexpr uint8_t kActuatorAllChannels = 2U;

enum class ActuatorOutputState : uint8_t {
  kUnconfigured,
  kConfiguringRange,
  kSafeOutput,
  kFollowingController,
  kFault,
};

enum ActuatorOutputAction : uint8_t {
  kActuatorActionNone = 0U,
  kActuatorActionConfigureRange = 1U << 0,
  kActuatorActionWriteSafeOutput = 1U << 1,
  kActuatorActionWriteControllerOutput = 1U << 2,
};

struct ActuatorOutputInput {
  ControlSnapshot control;
  bool range_configured;
  bool last_write_ok;
  bool hardware_enable;
};

struct ActuatorOutputSnapshot {
  ActuatorOutputState state;
  uint8_t actions;
  float requested_pct;
  float written_pct;
  I2cWrite write;
  bool safe_output_forced;
};

class ActuatorOutput {
 public:
  ActuatorOutputSnapshot update(const ActuatorOutputInput& input);
  ActuatorOutputSnapshot snapshot(uint8_t actions = kActuatorActionNone) const;

  ActuatorOutputState state() const { return state_; }
  float written_pct() const { return written_pct_; }

 private:
  static float bounded(float percent);
  static bool control_requires_safe_output(const ControlSnapshot& control);

  ActuatorOutputState state_{ActuatorOutputState::kUnconfigured};
  float requested_pct_{kActuatorSafeOutputPct};
  float written_pct_{kActuatorSafeOutputPct};
  I2cWrite pending_write_{};
  bool safe_output_forced_{true};
};

const char* to_string(ActuatorOutputState state);
const char* to_string(ActuatorOutputAction action);

}  // namespace ventilation
