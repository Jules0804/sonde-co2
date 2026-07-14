#pragma once

#include <cstdint>

namespace ventilation {

enum class ServiceState : uint8_t {
  kOff,
  kStarting,
  kActive,
  kStopping,
  kFault,
};

enum class ServiceWifiEvent : uint8_t {
  kNone,
  kStarted,
  kStopped,
  kFailed,
};

enum class ServiceFault : uint8_t {
  kNone,
  kWifiStartFailed,
  kWifiUnexpectedStop,
};

enum ServiceAction : uint8_t {
  kServiceActionNone = 0U,
  kServiceActionStartWifi = 1U << 0,
  kServiceActionStopWifi = 1U << 1,
  kServiceActionInvalidateSessions = 1U << 2,
};

struct ServiceConfig {
  uint32_t hold_ms{3000U};
  uint32_t duration_ms{15U * 60U * 1000U};
  uint32_t start_timeout_ms{10000U};
  uint8_t max_start_attempts{2U};
};

struct ServiceInput {
  uint64_t now_ms;
  bool button_pressed;
  ServiceWifiEvent wifi_event;
  bool close_requested;
};

struct ServiceSnapshot {
  ServiceState state;
  bool active;
  uint32_t remaining_ms;
  uint8_t start_attempts;
  uint32_t session_generation;
  ServiceFault fault;
  uint8_t actions;
};

class ServiceMode {
 public:
  explicit ServiceMode(ServiceConfig config = {});
  explicit ServiceMode(uint32_t duration_ms, uint32_t button_hold_ms = 3000U)
      : ServiceMode(ServiceConfig{button_hold_ms, duration_ms, 10000U, 2U}) {}

  ServiceSnapshot update(const ServiceInput& input);
  ServiceSnapshot snapshot(uint64_t now_ms = 0U, uint8_t actions = kServiceActionNone) const;

  ServiceState state() const { return state_; }
  ServiceFault fault() const { return fault_; }
  uint32_t session_generation() const { return session_generation_; }

 private:
  bool update_button(bool pressed, uint64_t now_ms);
  void request_start(uint64_t now_ms, uint8_t& actions);
  void invalidate_sessions(uint8_t& actions);
  uint32_t remaining_ms(uint64_t now_ms) const;

  ServiceConfig config_;
  ServiceState state_{ServiceState::kOff};
  ServiceFault fault_{ServiceFault::kNone};
  uint64_t button_since_ms_{0U};
  uint64_t start_deadline_ms_{0U};
  uint64_t expires_at_ms_{0U};
  uint64_t last_now_ms_{0U};
  uint32_t session_generation_{0U};
  uint8_t start_attempts_{0U};
  bool button_tracking_{false};
  bool button_latched_{false};
};

const char* to_string(ServiceState state);
const char* to_string(ServiceWifiEvent event);
const char* to_string(ServiceFault fault);

}  // namespace ventilation
