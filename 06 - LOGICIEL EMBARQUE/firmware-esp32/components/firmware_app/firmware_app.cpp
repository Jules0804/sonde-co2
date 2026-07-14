#include "firmware_app.hpp"

namespace ventilation {

ControlConfig FirmwareApp::control_config_from_persistent(const PersistentConfig& persistent) {
  ControlConfig config;
  config.target_ppm = static_cast<float>(persistent.target_ppm);
  config.min_output_pct = persistent.min_output_pct;
  config.max_output_pct = persistent.max_output_pct;
  config.high_alarm_ppm = static_cast<float>(persistent.high_alarm_ppm);
  config.high_alarm_delay_ms = static_cast<uint32_t>(persistent.alarm_delay_s) * 1000U;
  config.sensor_timeout_ms = static_cast<uint32_t>(persistent.history_period_s) * 1000U;
  return config;
}

HistoryState FirmwareApp::history_state_from_control(ControlState state) {
  switch (state) {
    case ControlState::kStartup: return HistoryState::kStartup;
    case ControlState::kAuto: return HistoryState::kAuto;
    case ControlState::kForceOpen: return HistoryState::kForceOpen;
    case ControlState::kFault: return HistoryState::kFault;
  }
  return HistoryState::kFault;
}

HistoryFault FirmwareApp::history_fault_from_control(FaultCode fault, SensorSampleStatus sensor_status) {
  if (sensor_status == SensorSampleStatus::kStale) return HistoryFault::kSensorStale;
  if (sensor_status == SensorSampleStatus::kCrcError) return HistoryFault::kSensorRange;
  switch (fault) {
    case FaultCode::kNone: return HistoryFault::kNone;
    case FaultCode::kSensorMissing: return HistoryFault::kSensorMissing;
    case FaultCode::kSensorRange: return HistoryFault::kSensorRange;
    case FaultCode::kHighCo2: return HistoryFault::kHighCo2;
  }
  return HistoryFault::kHistoryStorageFailed;
}

uint16_t FirmwareApp::history_flags_from_sensor(const SensorCycleSnapshot& sensor) {
  uint16_t flags = 0U;
  if (sensor.co2_valid) flags |= kHistoryFlagSensorValid;
  return flags;
}

FirmwareApp::FirmwareApp(FirmwareAppConfig config)
    : config_(config.persistent.target_ppm == 0U ? FirmwareAppConfig{factory_config(), config.sensor, config.service,
                                                                     config.actuator_hardware_enable}
                                                 : config),
      controller_(control_config_from_persistent(config_.persistent)),
      sensor_(config_.sensor),
      service_(config_.service) {}

FirmwareAppSnapshot FirmwareApp::update(const FirmwareAppInput& input) {
  const auto sensor_snapshot = sensor_.update(input.sensor);
  auto control_input = sensor_snapshot.control_input;
  control_input.timestamp_ms = input.now_ms;
  control_input.force_open = input.force_open;
  const auto control_snapshot = controller_.update(control_input);
  const auto actuator_snapshot = actuator_.update(ActuatorOutputInput{
      .control = control_snapshot,
      .range_configured = input.dac_range_configured,
      .last_write_ok = input.dac_last_write_ok,
      .hardware_enable = config_.actuator_hardware_enable,
  });
  const auto service_snapshot = service_.update(input.service);

  HistoryRecord history_record;
  const bool history_encoded = encode_history_record(
      HistorySample{
          .sequence = history_sequence_++,
          .epoch_seconds = 0U,
          .uptime_seconds = static_cast<uint32_t>(input.now_ms / 1000U),
          .boot_id = boot_id_,
          .co2_ppm = sensor_snapshot.co2_valid ? static_cast<uint16_t>(sensor_snapshot.co2_ppm)
                                               : kHistoryNullCo2Ppm,
          .output_pct = actuator_snapshot.written_pct,
          .state = history_state_from_control(control_snapshot.state),
          .fault = history_fault_from_control(control_snapshot.fault, sensor_snapshot.sample_status),
          .flags = history_flags_from_sensor(sensor_snapshot),
      },
      history_record);

  EventRecord event_record;
  const bool event_encoded = encode_event_record(
      EventEntry{
          .sequence = event_sequence_++,
          .epoch_seconds = 0U,
          .uptime_seconds = static_cast<uint32_t>(input.now_ms / 1000U),
          .boot_id = boot_id_,
          .code = actuator_snapshot.safe_output_forced ? EventCode::kFaultRaised : EventCode::kFaultCleared,
          .severity = actuator_snapshot.safe_output_forced ? EventSeverity::kWarning : EventSeverity::kInfo,
          .source = EventSource::kSystem,
          .count = 1U,
          .detail0 = static_cast<int32_t>(control_snapshot.fault),
          .detail1 = static_cast<int32_t>(sensor_snapshot.sample_status),
      },
      event_record);

  return FirmwareAppSnapshot{
      .sensor = sensor_snapshot,
      .control = control_snapshot,
      .actuator = actuator_snapshot,
      .service = service_snapshot,
      .history_record = history_record,
      .event_record = event_record,
      .history_encoded = history_encoded,
      .event_encoded = event_encoded,
  };
}

}  // namespace ventilation
