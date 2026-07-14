#include "api_payloads.hpp"

#include <cstdarg>
#include <cstdio>

#include "actuator_output.hpp"
#include "control_core.hpp"
#include "sensor_cycle.hpp"

namespace ventilation {
namespace {

constexpr uint32_t kSecondsPerDay = 86400U;

ApiJsonWriteResult checked_snprintf(char* out, size_t out_size, const char* fmt, ...) {
  if (out == nullptr || out_size == 0U) {
    return {false, 0U};
  }

  va_list args;
  va_start(args, fmt);
  const int written = std::vsnprintf(out, out_size, fmt, args);
  va_end(args);

  if (written < 0 || static_cast<size_t>(written) >= out_size) {
    out[0] = '\0';
    return {false, 0U};
  }

  return {true, static_cast<size_t>(written)};
}

bool is_leap_year(uint32_t year) {
  return ((year % 4U) == 0U && (year % 100U) != 0U) || ((year % 400U) == 0U);
}

uint8_t days_in_month(uint32_t year, uint8_t month) {
  static constexpr uint8_t kDays[] = {31U, 28U, 31U, 30U, 31U, 30U,
                                      31U, 31U, 30U, 31U, 30U, 31U};
  if (month == 2U && is_leap_year(year)) {
    return 29U;
  }
  return kDays[month - 1U];
}

const char* api_fault_from_control(FaultCode fault) {
  switch (fault) {
    case FaultCode::kNone: return nullptr;
    case FaultCode::kSensorMissing: return "SENSOR_MISSING";
    case FaultCode::kSensorRange: return "SENSOR_RANGE";
    case FaultCode::kHighCo2: return "HIGH_CO2";
  }
  return "UNKNOWN";
}

ApiJsonWriteResult format_json_nullable_string(const char* value, char* out, size_t out_size) {
  if (value == nullptr) {
    return checked_snprintf(out, out_size, "null");
  }
  return checked_snprintf(out, out_size, "\"%s\"", value);
}

ApiJsonWriteResult format_hex(const uint8_t* bytes, size_t length, char* out, size_t out_size) {
  static constexpr char kHex[] = "0123456789abcdef";
  if (bytes == nullptr || out == nullptr || out_size < (length * 2U + 1U)) {
    return {false, 0U};
  }
  for (size_t i = 0; i < length; ++i) {
    out[i * 2U] = kHex[(bytes[i] >> 4U) & 0x0fU];
    out[i * 2U + 1U] = kHex[bytes[i] & 0x0fU];
  }
  out[length * 2U] = '\0';
  return {true, length * 2U};
}

}  // namespace

const char* api_mode_from_snapshot(const FirmwareAppSnapshot& snapshot) {
  if (snapshot.service.active) {
    return "SERVICE";
  }
  switch (snapshot.control.state) {
    case ControlState::kStartup: return "STARTUP";
    case ControlState::kAuto: return "AUTO";
    case ControlState::kForceOpen: return "FORCE_OPEN";
    case ControlState::kFault: return "FAULT";
  }
  return "FAULT";
}

const char* api_fault_from_history(HistoryFault fault) {
  return fault == HistoryFault::kNone ? nullptr : to_string(fault);
}

const char* api_sensor_state_from_status(SensorSampleStatus status) {
  switch (status) {
    case SensorSampleStatus::kValid: return "VALID";
    case SensorSampleStatus::kNotReady: return "STALE";
    case SensorSampleStatus::kMissing: return "MISSING";
    case SensorSampleStatus::kCrcError: return "RANGE";
    case SensorSampleStatus::kStale: return "STALE";
    case SensorSampleStatus::kRange: return "RANGE";
  }
  return "MISSING";
}

ApiJsonWriteResult format_api_timestamp(uint64_t epoch_seconds, char* out, size_t out_size) {
  uint32_t days = static_cast<uint32_t>(epoch_seconds / kSecondsPerDay);
  uint32_t seconds = static_cast<uint32_t>(epoch_seconds % kSecondsPerDay);
  uint32_t year = 1970U;

  while (true) {
    const uint32_t year_days = is_leap_year(year) ? 366U : 365U;
    if (days < year_days) {
      break;
    }
    days -= year_days;
    ++year;
  }

  uint8_t month = 1U;
  while (true) {
    const uint8_t month_days = days_in_month(year, month);
    if (days < month_days) {
      break;
    }
    days -= month_days;
    ++month;
  }

  const uint8_t day = static_cast<uint8_t>(days + 1U);
  const uint8_t hour = static_cast<uint8_t>(seconds / 3600U);
  seconds %= 3600U;
  const uint8_t minute = static_cast<uint8_t>(seconds / 60U);
  const uint8_t second = static_cast<uint8_t>(seconds % 60U);

  return checked_snprintf(out, out_size, "%04lu-%02u-%02uT%02u:%02u:%02uZ",
                          static_cast<unsigned long>(year), month, day, hour, minute, second);
}

ApiJsonWriteResult format_status_json(const FirmwareAppSnapshot& snapshot,
                                      uint64_t epoch_seconds,
                                      char* out,
                                      size_t out_size) {
  char timestamp[kApiTimestampMaxBytes]{};
  const auto ts = format_api_timestamp(epoch_seconds, timestamp, sizeof(timestamp));
  if (!ts.ok) {
    return {false, 0U};
  }

  const uint32_t uptime_seconds = static_cast<uint32_t>(snapshot.sensor.control_input.timestamp_ms / 1000U);
  const float co2_ppm = snapshot.sensor.co2_valid ? snapshot.sensor.co2_ppm : 0.0F;
  const float output_pct = snapshot.actuator.written_pct;
  const float output_volts = output_pct / 10.0F;
  const uint32_t age_seconds = snapshot.sensor.age_ms / 1000U;
  const char* fault = api_fault_from_control(snapshot.control.fault);
  char fault_json[32]{};
  const auto fault_result = format_json_nullable_string(fault, fault_json, sizeof(fault_json));
  if (!fault_result.ok) {
    return {false, 0U};
  }

  return checked_snprintf(
      out, out_size,
      "{\"timestamp\":\"%s\",\"co2Ppm\":%lu,\"outputPct\":%.1f,\"outputVolts\":%.2f,"
      "\"mode\":\"%s\",\"fault\":%s,\"sensor\":{\"state\":\"%s\",\"ageSeconds\":%lu},"
      "\"test\":null,\"uptimeSeconds\":%lu}",
      timestamp,
      static_cast<unsigned long>(co2_ppm),
      static_cast<double>(output_pct),
      static_cast<double>(output_volts),
      api_mode_from_snapshot(snapshot),
      fault_json,
      api_sensor_state_from_status(snapshot.sensor.sample_status),
      static_cast<unsigned long>(age_seconds),
      static_cast<unsigned long>(uptime_seconds));
}

ApiJsonWriteResult format_config_json(const PersistentConfig& config,
                                      uint32_t revision,
                                      char* out,
                                      size_t out_size) {
  return checked_snprintf(
      out, out_size,
      "{\"targetPpm\":%u,\"minOutputPct\":%.1f,\"maxOutputPct\":%.1f,"
      "\"highAlarmPpm\":%u,\"revision\":%lu}",
      config.target_ppm,
      static_cast<double>(config.min_output_pct),
      static_cast<double>(config.max_output_pct),
      config.high_alarm_ppm,
      static_cast<unsigned long>(revision));
}

ApiJsonWriteResult format_session_json(const SessionRecord& session,
                                       uint64_t now_ms,
                                       char* out,
                                       size_t out_size) {
  char token[kApiHexTokenMaxBytes]{};
  char csrf[kApiHexCsrfMaxBytes]{};
  const auto token_result = format_hex(session.token.data(), session.token.size(), token, sizeof(token));
  const auto csrf_result = format_hex(session.csrf.data(), session.csrf.size(), csrf, sizeof(csrf));
  if (!token_result.ok || !csrf_result.ok || !session.active) {
    return {false, 0U};
  }
  const uint64_t expires_in_ms = session.expires_at_ms > now_ms ? session.expires_at_ms - now_ms : 0U;
  const uint32_t expires_in_seconds = static_cast<uint32_t>(expires_in_ms / 1000U);

  return checked_snprintf(
      out, out_size,
      "{\"token\":\"%s\",\"csrfToken\":\"%s\",\"role\":\"%s\","
      "\"expiresAt\":%llu,\"expiresInSeconds\":%lu}",
      token,
      csrf,
      to_string(session.role),
      static_cast<unsigned long long>(session.expires_at_ms),
      static_cast<unsigned long>(expires_in_seconds));
}

ApiJsonWriteResult format_history_sample_json(const HistorySample& sample,
                                              char* out,
                                              size_t out_size) {
  char timestamp[kApiTimestampMaxBytes]{};
  const auto ts = format_api_timestamp(sample.epoch_seconds, timestamp, sizeof(timestamp));
  if (!ts.ok) {
    return {false, 0U};
  }

  const bool has_fault = sample.fault != HistoryFault::kNone;
  char fault_json[40]{};
  const auto fault_result =
      format_json_nullable_string(has_fault ? to_string(sample.fault) : nullptr, fault_json, sizeof(fault_json));
  if (!fault_result.ok) {
    return {false, 0U};
  }
  return checked_snprintf(
      out, out_size,
      "{\"timestamp\":\"%s\",\"co2Ppm\":%u,\"outputPct\":%.1f,"
      "\"state\":\"%s\",\"fault\":%s}",
      timestamp,
      sample.co2_ppm == kHistoryNullCo2Ppm ? 0U : sample.co2_ppm,
      static_cast<double>(sample.output_pct),
      to_string(sample.state),
      fault_json);
}

ApiJsonWriteResult format_event_json(const EventEntry& event,
                                     char* out,
                                     size_t out_size) {
  return checked_snprintf(
      out, out_size,
      "{\"sequence\":%lu,\"epochSeconds\":%lu,\"uptimeSeconds\":%lu,\"bootId\":%u,"
      "\"code\":\"%s\",\"severity\":\"%s\",\"source\":\"%s\",\"count\":%u,"
      "\"detail0\":%ld,\"detail1\":%ld}",
      static_cast<unsigned long>(event.sequence),
      static_cast<unsigned long>(event.epoch_seconds),
      static_cast<unsigned long>(event.uptime_seconds),
      event.boot_id,
      to_string(event.code),
      to_string(event.severity),
      to_string(event.source),
      event.count,
      static_cast<long>(event.detail0),
      static_cast<long>(event.detail1));
}

}  // namespace ventilation
