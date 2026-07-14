#include "service_mode.hpp"

#include <algorithm>
#include <limits>

namespace ventilation {
namespace {
uint64_t saturating_add(uint64_t value, uint32_t delta) {
  const uint64_t max_value = std::numeric_limits<uint64_t>::max();
  return delta > max_value - value ? max_value : value + delta;
}
}  // namespace

ServiceMode::ServiceMode(ServiceConfig config) : config_(config) {
  if (config_.hold_ms == 0U) config_.hold_ms = 3000U;
  if (config_.duration_ms == 0U) config_.duration_ms = 15U * 60U * 1000U;
  if (config_.start_timeout_ms == 0U) config_.start_timeout_ms = 10000U;
  if (config_.max_start_attempts == 0U) config_.max_start_attempts = 1U;
}

ServiceSnapshot ServiceMode::update(const ServiceInput& input) {
  const uint64_t now_ms = std::max(last_now_ms_, input.now_ms);
  last_now_ms_ = now_ms;
  uint8_t actions = kServiceActionNone;

  const bool activation_requested = update_button(input.button_pressed, now_ms);
  if (activation_requested && (state_ == ServiceState::kOff || state_ == ServiceState::kFault)) {
    fault_ = ServiceFault::kNone;
    start_attempts_ = 0U;
    request_start(now_ms, actions);
  }

  if (state_ == ServiceState::kStarting) {
    if (input.wifi_event == ServiceWifiEvent::kStarted) {
      state_ = ServiceState::kActive;
      start_deadline_ms_ = 0U;
      expires_at_ms_ = saturating_add(now_ms, config_.duration_ms);
    } else if (input.wifi_event == ServiceWifiEvent::kFailed || now_ms >= start_deadline_ms_) {
      if (start_attempts_ < config_.max_start_attempts) {
        request_start(now_ms, actions);
      } else {
        state_ = ServiceState::kFault;
        start_deadline_ms_ = 0U;
        fault_ = ServiceFault::kWifiStartFailed;
        invalidate_sessions(actions);
      }
    }
  } else if (state_ == ServiceState::kActive) {
    if (input.wifi_event == ServiceWifiEvent::kStopped) {
      fault_ = ServiceFault::kWifiUnexpectedStop;
      start_attempts_ = 0U;
      expires_at_ms_ = 0U;
      invalidate_sessions(actions);
      request_start(now_ms, actions);
    } else if (input.close_requested || now_ms >= expires_at_ms_) {
      state_ = ServiceState::kStopping;
      expires_at_ms_ = 0U;
      actions |= kServiceActionStopWifi;
    }
  } else if (state_ == ServiceState::kStopping && input.wifi_event == ServiceWifiEvent::kStopped) {
    state_ = ServiceState::kOff;
    start_attempts_ = 0U;
    invalidate_sessions(actions);
  }

  return snapshot(now_ms, actions);
}

bool ServiceMode::update_button(bool pressed, uint64_t now_ms) {
  if (!pressed) {
    button_tracking_ = false;
    button_latched_ = false;
    button_since_ms_ = 0U;
    return false;
  }
  if (!button_tracking_) {
    button_tracking_ = true;
    button_since_ms_ = now_ms;
  }
  if (now_ms < button_since_ms_) {
    button_since_ms_ = now_ms;
    return false;
  }
  if (!button_latched_ && now_ms - button_since_ms_ >= config_.hold_ms) {
    button_latched_ = true;
    return true;
  }
  return false;
}

void ServiceMode::request_start(uint64_t now_ms, uint8_t& actions) {
  state_ = ServiceState::kStarting;
  if (start_attempts_ < std::numeric_limits<uint8_t>::max()) ++start_attempts_;
  start_deadline_ms_ = saturating_add(now_ms, config_.start_timeout_ms);
  actions |= kServiceActionStartWifi;
}

void ServiceMode::invalidate_sessions(uint8_t& actions) {
  ++session_generation_;
  actions |= kServiceActionInvalidateSessions;
}

uint32_t ServiceMode::remaining_ms(uint64_t now_ms) const {
  if (state_ != ServiceState::kActive || now_ms >= expires_at_ms_) return 0U;
  return static_cast<uint32_t>(std::min<uint64_t>(expires_at_ms_ - now_ms, UINT32_MAX));
}

ServiceSnapshot ServiceMode::snapshot(uint64_t now_ms, uint8_t actions) const {
  const uint64_t effective_now = now_ms == 0U ? last_now_ms_ : now_ms;
  return {
      state_,
      state_ == ServiceState::kActive,
      remaining_ms(effective_now),
      start_attempts_,
      session_generation_,
      fault_,
      actions,
  };
}

const char* to_string(ServiceState state) {
  switch (state) {
    case ServiceState::kOff: return "OFF";
    case ServiceState::kStarting: return "STARTING";
    case ServiceState::kActive: return "ACTIVE";
    case ServiceState::kStopping: return "STOPPING";
    case ServiceState::kFault: return "FAULT";
  }
  return "UNKNOWN";
}

const char* to_string(ServiceWifiEvent event) {
  switch (event) {
    case ServiceWifiEvent::kNone: return "NONE";
    case ServiceWifiEvent::kStarted: return "STARTED";
    case ServiceWifiEvent::kStopped: return "STOPPED";
    case ServiceWifiEvent::kFailed: return "FAILED";
  }
  return "UNKNOWN";
}

const char* to_string(ServiceFault fault) {
  switch (fault) {
    case ServiceFault::kNone: return "NONE";
    case ServiceFault::kWifiStartFailed: return "WIFI_START_FAILED";
    case ServiceFault::kWifiUnexpectedStop: return "WIFI_UNEXPECTED_STOP";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
