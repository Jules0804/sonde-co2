#include "sensor_cycle.hpp"

namespace ventilation {

SensorCycle::SensorCycle(SensorCycleConfig config) : config_(config) {}

SensorSampleStatus SensorCycle::classify(uint64_t now_ms) const {
  const uint32_t age_ms = has_sample_ && now_ms >= last_sample_ms_
                              ? static_cast<uint32_t>(now_ms - last_sample_ms_)
                              : config_.stale_after_ms;
  return classify_scd41_sample(
      Scd41Sample{
          .communication_ok = state_ != SensorCycleState::kFault,
          .data_ready = has_sample_,
          .crc_valid = has_sample_,
          .co2_ppm = last_co2_ppm_,
          .age_ms = age_ms,
      },
      config_.min_ppm,
      config_.max_ppm,
      config_.stale_after_ms);
}

SensorCycleSnapshot SensorCycle::update(const SensorCycleInput& input) {
  uint8_t actions = kSensorActionNone;

  if (!input.communication_ok) {
    state_ = SensorCycleState::kFault;
    sample_status_ = SensorSampleStatus::kMissing;
    return snapshot(input.now_ms, actions);
  }

  if (state_ == SensorCycleState::kStopped || state_ == SensorCycleState::kFault) {
    state_ = SensorCycleState::kStarting;
    next_due_ms_ = input.now_ms + config_.startup_delay_ms;
    actions |= kSensorActionStartPeriodic;
    return snapshot(input.now_ms, actions);
  }

  if (input.measurement_received) {
    state_ = SensorCycleState::kWaitingDataReady;
    if (input.measurement.crc_valid) {
      last_co2_ppm_ = static_cast<float>(input.measurement.co2_raw);
      last_sample_ms_ = input.now_ms;
      has_sample_ = true;
    }
    next_due_ms_ = input.now_ms + config_.read_interval_ms;
    sample_status_ = classify(input.now_ms);
    return snapshot(input.now_ms, actions);
  }

  if (input.data_ready_checked && input.data_ready) {
    state_ = SensorCycleState::kReadingMeasurement;
    actions |= kSensorActionReadMeasurement;
    return snapshot(input.now_ms, actions);
  }

  if (input.now_ms >= next_due_ms_) {
    state_ = SensorCycleState::kWaitingDataReady;
    actions |= kSensorActionPollDataReady;
    next_due_ms_ = input.now_ms + config_.read_interval_ms;
  }

  sample_status_ = classify(input.now_ms);
  return snapshot(input.now_ms, actions);
}

SensorCycleSnapshot SensorCycle::snapshot(uint64_t now_ms, uint8_t actions) const {
  const uint32_t age_ms = has_sample_ && now_ms >= last_sample_ms_
                              ? static_cast<uint32_t>(now_ms - last_sample_ms_)
                              : config_.stale_after_ms;
  const bool valid = sample_status_ == SensorSampleStatus::kValid;
  return SensorCycleSnapshot{
      .state = state_,
      .sample_status = sample_status_,
      .actions = actions,
      .co2_ppm = last_co2_ppm_,
      .co2_valid = valid,
      .age_ms = age_ms,
      .next_due_ms = next_due_ms_,
      .control_input =
          ControlInput{
              .timestamp_ms = now_ms,
              .co2_ppm = last_co2_ppm_,
              .co2_valid = valid,
              .force_open = false,
          },
  };
}

Scd41CommandFrame sensor_cycle_command_for_action(uint8_t action) {
  if ((action & kSensorActionStartPeriodic) != 0U) {
    return scd41_command(kScd41CmdStartPeriodicMeasurement);
  }
  if ((action & kSensorActionPollDataReady) != 0U) {
    return scd41_command(kScd41CmdGetDataReadyStatus);
  }
  if ((action & kSensorActionReadMeasurement) != 0U) {
    return scd41_command(kScd41CmdReadMeasurement);
  }
  return Scd41CommandFrame{kScd41Address, {0U, 0U}};
}

const char* to_string(SensorCycleState state) {
  switch (state) {
    case SensorCycleState::kStopped: return "STOPPED";
    case SensorCycleState::kStarting: return "STARTING";
    case SensorCycleState::kWaitingDataReady: return "WAITING_DATA_READY";
    case SensorCycleState::kReadingMeasurement: return "READING_MEASUREMENT";
    case SensorCycleState::kFault: return "FAULT";
  }
  return "UNKNOWN";
}

const char* to_string(SensorCycleAction action) {
  switch (action) {
    case kSensorActionNone: return "NONE";
    case kSensorActionStartPeriodic: return "START_PERIODIC";
    case kSensorActionPollDataReady: return "POLL_DATA_READY";
    case kSensorActionReadMeasurement: return "READ_MEASUREMENT";
  }
  return "MULTIPLE";
}

}  // namespace ventilation
