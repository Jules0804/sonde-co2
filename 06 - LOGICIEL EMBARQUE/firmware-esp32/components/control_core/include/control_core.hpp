#pragma once

#include <cstdint>

namespace ventilation {

enum class ControlState : uint8_t {
  kStartup,
  kAuto,
  kForceOpen,
  kFault,
};

enum class FaultCode : uint8_t {
  kNone,
  kSensorMissing,
  kSensorRange,
  kHighCo2,
};

struct ControlConfig {
  float target_ppm{1000.0F};
  float min_output_pct{20.0F};
  float max_output_pct{100.0F};
  float valid_min_ppm{350.0F};
  float valid_max_ppm{5000.0F};
  uint32_t startup_valid_ms{15000U};
  uint32_t sensor_timeout_ms{30000U};
  float high_alarm_ppm{1500.0F};
  uint32_t high_alarm_delay_ms{60000U};
  float filter_tau_s{60.0F};
  float kp_pct_per_ppm{0.08F};
  float ki_pct_per_ppm_s{0.00035F};
  float ramp_up_pct_per_s{0.5F};
  float ramp_down_pct_per_s{0.2F};
};

struct ControlInput {
  uint64_t timestamp_ms;
  float co2_ppm;
  bool co2_valid;
  bool force_open;
};

struct ControlSnapshot {
  ControlState state;
  FaultCode fault;
  float output_pct;
  float filtered_ppm;
  bool filtered_ppm_valid;
  float target_ppm;
};

class Controller {
 public:
  explicit Controller(ControlConfig config = {});
  ControlSnapshot update(const ControlInput& input);
  const ControlConfig& config() const { return config_; }

 private:
  FaultCode evaluate_sensor(const ControlInput& input, uint32_t dt_ms);
  void update_filter(float co2_ppm, float dt_s);
  float compute_auto_output(float dt_s);
  float apply_ramp(float desired_pct, float dt_s) const;
  ControlSnapshot snapshot() const;

  ControlConfig config_;
  ControlState state_{ControlState::kStartup};
  FaultCode fault_{FaultCode::kNone};
  float output_pct_{100.0F};
  float filtered_ppm_{0.0F};
  bool filtered_ppm_valid_{false};
  float integral_{0.0F};
  uint64_t last_timestamp_ms_{0U};
  uint64_t last_valid_timestamp_ms_{0U};
  uint32_t valid_duration_ms_{0U};
  uint32_t high_duration_ms_{0U};
  bool has_timestamp_{false};
  bool has_valid_sample_{false};
};

const char* to_string(ControlState state);
const char* to_string(FaultCode fault);

}  // namespace ventilation
