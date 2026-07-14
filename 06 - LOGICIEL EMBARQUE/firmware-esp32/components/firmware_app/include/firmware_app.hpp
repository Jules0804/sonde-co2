#pragma once

#include <cstdint>

#include "actuator_output.hpp"
#include "config_store.hpp"
#include "control_core.hpp"
#include "history_log.hpp"
#include "sensor_cycle.hpp"
#include "service_mode.hpp"

namespace ventilation {

struct FirmwareAppConfig {
  PersistentConfig persistent;
  SensorCycleConfig sensor;
  ServiceConfig service;
  bool actuator_hardware_enable{false};
};

struct FirmwareAppInput {
  uint64_t now_ms;
  SensorCycleInput sensor;
  ServiceInput service;
  bool dac_range_configured;
  bool dac_last_write_ok;
  bool force_open;
};

struct FirmwareAppSnapshot {
  SensorCycleSnapshot sensor;
  ControlSnapshot control;
  ActuatorOutputSnapshot actuator;
  ServiceSnapshot service;
  HistoryRecord history_record;
  EventRecord event_record;
  bool history_encoded;
  bool event_encoded;
};

class FirmwareApp {
 public:
  explicit FirmwareApp(FirmwareAppConfig config = {});

  FirmwareAppSnapshot update(const FirmwareAppInput& input);
  const ControlConfig& control_config() const { return controller_.config(); }

 private:
  static ControlConfig control_config_from_persistent(const PersistentConfig& persistent);
  static HistoryState history_state_from_control(ControlState state);
  static HistoryFault history_fault_from_control(FaultCode fault, SensorSampleStatus sensor_status);
  static uint16_t history_flags_from_sensor(const SensorCycleSnapshot& sensor);

  FirmwareAppConfig config_;
  Controller controller_;
  SensorCycle sensor_;
  ActuatorOutput actuator_;
  ServiceMode service_;
  uint32_t history_sequence_{0U};
  uint32_t event_sequence_{0U};
  uint16_t boot_id_{0U};
};

}  // namespace ventilation
