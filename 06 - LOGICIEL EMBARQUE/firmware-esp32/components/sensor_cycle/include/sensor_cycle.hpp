#pragma once

#include <cstdint>

#include "control_core.hpp"
#include "hardware_contracts.hpp"
#include "lot1_drivers.hpp"

namespace ventilation {

enum class SensorCycleState : uint8_t {
  kStopped,
  kStarting,
  kWaitingDataReady,
  kReadingMeasurement,
  kFault,
};

enum SensorCycleAction : uint8_t {
  kSensorActionNone = 0U,
  kSensorActionStartPeriodic = 1U << 0,
  kSensorActionPollDataReady = 1U << 1,
  kSensorActionReadMeasurement = 1U << 2,
};

struct SensorCycleConfig {
  float min_ppm{350.0F};
  float max_ppm{5000.0F};
  uint32_t stale_after_ms{30000U};
  uint32_t read_interval_ms{kScd41ReadIntervalMs};
  uint32_t startup_delay_ms{kScd41StartUpDelayMs};
};

struct SensorCycleInput {
  uint64_t now_ms;
  bool communication_ok;
  bool data_ready_checked;
  bool data_ready;
  bool measurement_received;
  Scd41RawMeasurement measurement;
};

struct SensorCycleSnapshot {
  SensorCycleState state;
  SensorSampleStatus sample_status;
  uint8_t actions;
  float co2_ppm;
  bool co2_valid;
  uint32_t age_ms;
  uint64_t next_due_ms;
  ControlInput control_input;
};

class SensorCycle {
 public:
  explicit SensorCycle(SensorCycleConfig config = {});

  SensorCycleSnapshot update(const SensorCycleInput& input);
  SensorCycleSnapshot snapshot(uint64_t now_ms, uint8_t actions = kSensorActionNone) const;

  SensorCycleState state() const { return state_; }
  SensorSampleStatus sample_status() const { return sample_status_; }

 private:
  SensorSampleStatus classify(uint64_t now_ms) const;

  SensorCycleConfig config_;
  SensorCycleState state_{SensorCycleState::kStopped};
  SensorSampleStatus sample_status_{SensorSampleStatus::kMissing};
  float last_co2_ppm_{0.0F};
  uint64_t last_sample_ms_{0U};
  uint64_t next_due_ms_{0U};
  bool has_sample_{false};
};

Scd41CommandFrame sensor_cycle_command_for_action(uint8_t action);
const char* to_string(SensorCycleState state);
const char* to_string(SensorCycleAction action);

}  // namespace ventilation
