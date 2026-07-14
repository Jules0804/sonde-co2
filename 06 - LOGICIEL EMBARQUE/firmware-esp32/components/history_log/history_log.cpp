#include "history_log.hpp"

#include <cmath>

namespace ventilation {
namespace {

void write_u16_le(uint8_t* data, size_t offset, uint16_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
}

void write_u32_le(uint8_t* data, size_t offset, uint32_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
  data[offset + 2U] = static_cast<uint8_t>((value >> 16U) & 0xffU);
  data[offset + 3U] = static_cast<uint8_t>((value >> 24U) & 0xffU);
}

void write_i32_le(uint8_t* data, size_t offset, int32_t value) {
  write_u32_le(data, offset, static_cast<uint32_t>(value));
}

uint16_t read_u16_le(const uint8_t* data, size_t offset) {
  return static_cast<uint16_t>(data[offset]) |
         static_cast<uint16_t>(static_cast<uint16_t>(data[offset + 1U]) << 8U);
}

uint32_t read_u32_le(const uint8_t* data, size_t offset) {
  return static_cast<uint32_t>(data[offset]) |
         (static_cast<uint32_t>(data[offset + 1U]) << 8U) |
         (static_cast<uint32_t>(data[offset + 2U]) << 16U) |
         (static_cast<uint32_t>(data[offset + 3U]) << 24U);
}

int32_t read_i32_le(const uint8_t* data, size_t offset) {
  return static_cast<int32_t>(read_u32_le(data, offset));
}

bool valid_state(uint8_t value) {
  return value <= static_cast<uint8_t>(HistoryState::kRecovery);
}

bool valid_fault(uint8_t value) {
  return value <= static_cast<uint8_t>(HistoryFault::kHistoryStorageFailed);
}

bool valid_event_code(uint16_t value) {
  return value >= static_cast<uint16_t>(EventCode::kBoot) &&
         value <= static_cast<uint16_t>(EventCode::kHistoryCleared);
}

bool valid_event_severity(uint8_t value) {
  return value <= static_cast<uint8_t>(EventSeverity::kCritical);
}

bool valid_event_source(uint8_t value) {
  return value <= static_cast<uint8_t>(EventSource::kGtb);
}

}  // namespace

uint16_t crc16_ccitt(const uint8_t* data, size_t length) {
  uint16_t crc = 0xffffU;
  for (size_t index = 0U; index < length; ++index) {
    crc ^= static_cast<uint16_t>(data[index]) << 8U;
    for (uint8_t bit = 0U; bit < 8U; ++bit) {
      crc = (crc & 0x8000U) != 0U ? static_cast<uint16_t>((crc << 1U) ^ 0x1021U)
                                  : static_cast<uint16_t>(crc << 1U);
    }
  }
  return crc;
}

bool encode_history_record(const HistorySample& sample, HistoryRecord& output) {
  if (sample.output_pct < 0.0F || sample.output_pct > 100.0F) return false;
  const auto output_tenths = static_cast<uint16_t>(std::lround(sample.output_pct * 10.0F));
  if (output_tenths > 1000U) return false;

  output.bytes.fill(0U);
  uint8_t* data = output.bytes.data();
  write_u32_le(data, 0U, sample.sequence);
  write_u32_le(data, 4U, sample.epoch_seconds);
  write_u32_le(data, 8U, sample.uptime_seconds);
  write_u16_le(data, 12U, sample.boot_id);
  write_u16_le(data, 14U, sample.co2_ppm);
  write_u16_le(data, 16U, output_tenths);
  data[18U] = static_cast<uint8_t>(sample.state);
  data[19U] = static_cast<uint8_t>(sample.fault);
  write_u16_le(data, 20U, sample.flags);
  write_u16_le(data, 22U, crc16_ccitt(data, 22U));
  return valid_state(data[18U]) && valid_fault(data[19U]);
}

HistoryDecodeResult decode_history_record(const uint8_t* data, size_t length) {
  HistoryDecodeResult result{false, LogDecodeReason::kLength, {}};
  if (data == nullptr || length != kHistoryRecordSize) return result;

  const uint16_t expected_crc = read_u16_le(data, 22U);
  if (expected_crc != crc16_ccitt(data, 22U)) {
    result.reason = LogDecodeReason::kCrc;
    return result;
  }
  if (!valid_state(data[18U]) || !valid_fault(data[19U])) {
    result.reason = LogDecodeReason::kEnum;
    return result;
  }

  result.ok = true;
  result.reason = LogDecodeReason::kOk;
  result.sample.sequence = read_u32_le(data, 0U);
  result.sample.epoch_seconds = read_u32_le(data, 4U);
  result.sample.uptime_seconds = read_u32_le(data, 8U);
  result.sample.boot_id = read_u16_le(data, 12U);
  result.sample.co2_ppm = read_u16_le(data, 14U);
  result.sample.output_pct = static_cast<float>(read_u16_le(data, 16U)) / 10.0F;
  result.sample.state = static_cast<HistoryState>(data[18U]);
  result.sample.fault = static_cast<HistoryFault>(data[19U]);
  result.sample.flags = read_u16_le(data, 20U);
  return result;
}

bool encode_event_record(const EventEntry& event, EventRecord& output) {
  output.bytes.fill(0U);
  uint8_t* data = output.bytes.data();
  write_u32_le(data, 0U, event.sequence);
  write_u32_le(data, 4U, event.epoch_seconds);
  write_u32_le(data, 8U, event.uptime_seconds);
  write_u16_le(data, 12U, event.boot_id);
  write_u16_le(data, 14U, static_cast<uint16_t>(event.code));
  data[16U] = static_cast<uint8_t>(event.severity);
  data[17U] = static_cast<uint8_t>(event.source);
  write_u16_le(data, 18U, event.count);
  write_i32_le(data, 20U, event.detail0);
  write_i32_le(data, 24U, event.detail1);
  write_u16_le(data, 28U, 0U);
  write_u16_le(data, 30U, crc16_ccitt(data, 30U));
  return valid_event_code(read_u16_le(data, 14U)) &&
         valid_event_severity(data[16U]) &&
         valid_event_source(data[17U]);
}

EventDecodeResult decode_event_record(const uint8_t* data, size_t length) {
  EventDecodeResult result{false, LogDecodeReason::kLength, {}};
  if (data == nullptr || length != kEventRecordSize) return result;

  if (read_u16_le(data, 28U) != 0U) {
    result.reason = LogDecodeReason::kReserved;
    return result;
  }
  const uint16_t expected_crc = read_u16_le(data, 30U);
  if (expected_crc != crc16_ccitt(data, 30U)) {
    result.reason = LogDecodeReason::kCrc;
    return result;
  }
  if (!valid_event_code(read_u16_le(data, 14U)) ||
      !valid_event_severity(data[16U]) ||
      !valid_event_source(data[17U])) {
    result.reason = LogDecodeReason::kEnum;
    return result;
  }

  result.ok = true;
  result.reason = LogDecodeReason::kOk;
  result.event.sequence = read_u32_le(data, 0U);
  result.event.epoch_seconds = read_u32_le(data, 4U);
  result.event.uptime_seconds = read_u32_le(data, 8U);
  result.event.boot_id = read_u16_le(data, 12U);
  result.event.code = static_cast<EventCode>(read_u16_le(data, 14U));
  result.event.severity = static_cast<EventSeverity>(data[16U]);
  result.event.source = static_cast<EventSource>(data[17U]);
  result.event.count = read_u16_le(data, 18U);
  result.event.detail0 = read_i32_le(data, 20U);
  result.event.detail1 = read_i32_le(data, 24U);
  return result;
}

LogStorageEstimate estimate_log_storage(uint16_t sample_period_seconds,
                                        uint16_t retention_days,
                                        uint16_t event_capacity) {
  if (sample_period_seconds == 0U) sample_period_seconds = kHistoryDefaultSamplePeriodSeconds;
  const uint32_t sample_count =
      (static_cast<uint32_t>(retention_days) * 86400UL + sample_period_seconds - 1UL) /
      sample_period_seconds;
  const uint32_t history_bytes = sample_count * kHistoryRecordSize;
  const uint32_t event_bytes = static_cast<uint32_t>(event_capacity) * kEventRecordSize;
  return LogStorageEstimate{sample_count, history_bytes, event_bytes, history_bytes + event_bytes};
}

const char* to_string(HistoryState state) {
  switch (state) {
    case HistoryState::kStartup: return "STARTUP";
    case HistoryState::kAuto: return "AUTO";
    case HistoryState::kTest: return "TEST";
    case HistoryState::kForceOpen: return "FORCE_OPEN";
    case HistoryState::kFault: return "FAULT";
    case HistoryState::kDegradedFlow: return "DEGRADED_FLOW";
    case HistoryState::kUpdate: return "UPDATE";
    case HistoryState::kRecovery: return "RECOVERY";
  }
  return "UNKNOWN";
}

const char* to_string(HistoryFault fault) {
  switch (fault) {
    case HistoryFault::kNone: return "NONE";
    case HistoryFault::kSensorMissing: return "SENSOR_MISSING";
    case HistoryFault::kSensorRange: return "SENSOR_RANGE";
    case HistoryFault::kSensorStale: return "SENSOR_STALE";
    case HistoryFault::kHighCo2: return "HIGH_CO2";
    case HistoryFault::kOutputWriteFailed: return "OUTPUT_WRITE_FAILED";
    case HistoryFault::kConfigCorrupt: return "CONFIG_CORRUPT";
    case HistoryFault::kWifiStartFailed: return "WIFI_START_FAILED";
    case HistoryFault::kHistoryStorageFailed: return "HISTORY_STORAGE_FAILED";
  }
  return "UNKNOWN";
}

const char* to_string(EventCode code) {
  switch (code) {
    case EventCode::kBoot: return "BOOT";
    case EventCode::kConfigChanged: return "CONFIG_CHANGED";
    case EventCode::kConfigRecovery: return "CONFIG_RECOVERY";
    case EventCode::kServiceOpened: return "SERVICE_OPENED";
    case EventCode::kServiceClosed: return "SERVICE_CLOSED";
    case EventCode::kLoginFailed: return "LOGIN_FAILED";
    case EventCode::kTestStarted: return "TEST_STARTED";
    case EventCode::kTestStopped: return "TEST_STOPPED";
    case EventCode::kFaultRaised: return "FAULT_RAISED";
    case EventCode::kFaultCleared: return "FAULT_CLEARED";
    case EventCode::kFirmwareUpdate: return "FIRMWARE_UPDATE";
    case EventCode::kHistoryStorageFailed: return "HISTORY_STORAGE_FAILED";
    case EventCode::kSessionOpened: return "SESSION_OPENED";
    case EventCode::kSessionClosed: return "SESSION_CLOSED";
    case EventCode::kHistoryCleared: return "HISTORY_CLEARED";
  }
  return "UNKNOWN";
}

const char* to_string(EventSeverity severity) {
  switch (severity) {
    case EventSeverity::kInfo: return "INFO";
    case EventSeverity::kWarning: return "WARNING";
    case EventSeverity::kError: return "ERROR";
    case EventSeverity::kCritical: return "CRITICAL";
  }
  return "UNKNOWN";
}

const char* to_string(EventSource source) {
  switch (source) {
    case EventSource::kSystem: return "SYSTEM";
    case EventSource::kPhysical: return "PHYSICAL";
    case EventSource::kInstaller: return "INSTALLER";
    case EventSource::kAdmin: return "ADMIN";
    case EventSource::kGtb: return "GTB";
  }
  return "UNKNOWN";
}

const char* to_string(LogDecodeReason reason) {
  switch (reason) {
    case LogDecodeReason::kOk: return "OK";
    case LogDecodeReason::kLength: return "LENGTH";
    case LogDecodeReason::kCrc: return "CRC";
    case LogDecodeReason::kEnum: return "ENUM";
    case LogDecodeReason::kReserved: return "RESERVED";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
