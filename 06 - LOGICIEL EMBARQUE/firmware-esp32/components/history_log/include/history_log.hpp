#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

namespace ventilation {

constexpr size_t kHistoryRecordSize = 24U;
constexpr size_t kEventRecordSize = 32U;
constexpr uint16_t kHistoryNullCo2Ppm = 0xffffU;
constexpr uint16_t kHistoryDefaultSamplePeriodSeconds = 60U;
constexpr uint16_t kHistoryDefaultRetentionDays = 7U;
constexpr uint16_t kEventDefaultCapacity = 512U;

enum class HistoryState : uint8_t {
  kStartup = 0U,
  kAuto = 1U,
  kTest = 2U,
  kForceOpen = 3U,
  kFault = 4U,
  kDegradedFlow = 5U,
  kUpdate = 6U,
  kRecovery = 7U,
};

enum class HistoryFault : uint8_t {
  kNone = 0U,
  kSensorMissing = 1U,
  kSensorRange = 2U,
  kSensorStale = 3U,
  kHighCo2 = 4U,
  kOutputWriteFailed = 5U,
  kConfigCorrupt = 6U,
  kWifiStartFailed = 7U,
  kHistoryStorageFailed = 8U,
};

enum HistoryFlag : uint16_t {
  kHistoryFlagTimeSynced = 1U,
  kHistoryFlagSensorValid = 2U,
  kHistoryFlagFlowValid = 4U,
  kHistoryFlagTestActive = 8U,
};

enum class EventCode : uint16_t {
  kBoot = 1U,
  kConfigChanged = 2U,
  kConfigRecovery = 3U,
  kServiceOpened = 4U,
  kServiceClosed = 5U,
  kLoginFailed = 6U,
  kTestStarted = 7U,
  kTestStopped = 8U,
  kFaultRaised = 9U,
  kFaultCleared = 10U,
  kFirmwareUpdate = 11U,
  kHistoryStorageFailed = 12U,
  kSessionOpened = 13U,
  kSessionClosed = 14U,
  kHistoryCleared = 15U,
};

enum class EventSeverity : uint8_t {
  kInfo = 0U,
  kWarning = 1U,
  kError = 2U,
  kCritical = 3U,
};

enum class EventSource : uint8_t {
  kSystem = 0U,
  kPhysical = 1U,
  kInstaller = 2U,
  kAdmin = 3U,
  kGtb = 4U,
};

enum class LogDecodeReason : uint8_t {
  kOk,
  kLength,
  kCrc,
  kEnum,
  kReserved,
};

struct HistorySample {
  uint32_t sequence{0U};
  uint32_t epoch_seconds{0U};
  uint32_t uptime_seconds{0U};
  uint16_t boot_id{0U};
  uint16_t co2_ppm{kHistoryNullCo2Ppm};
  float output_pct{0.0F};
  HistoryState state{HistoryState::kStartup};
  HistoryFault fault{HistoryFault::kNone};
  uint16_t flags{0U};
};

struct EventEntry {
  uint32_t sequence{0U};
  uint32_t epoch_seconds{0U};
  uint32_t uptime_seconds{0U};
  uint16_t boot_id{0U};
  EventCode code{EventCode::kBoot};
  EventSeverity severity{EventSeverity::kInfo};
  EventSource source{EventSource::kSystem};
  uint16_t count{1U};
  int32_t detail0{0};
  int32_t detail1{0};
};

struct HistoryRecord {
  std::array<uint8_t, kHistoryRecordSize> bytes{};
};

struct EventRecord {
  std::array<uint8_t, kEventRecordSize> bytes{};
};

struct HistoryDecodeResult {
  bool ok;
  LogDecodeReason reason;
  HistorySample sample;
};

struct EventDecodeResult {
  bool ok;
  LogDecodeReason reason;
  EventEntry event;
};

struct LogStorageEstimate {
  uint32_t sample_count;
  uint32_t history_bytes;
  uint32_t event_bytes;
  uint32_t total_record_bytes;
};

uint16_t crc16_ccitt(const uint8_t* data, size_t length);
bool encode_history_record(const HistorySample& sample, HistoryRecord& output);
HistoryDecodeResult decode_history_record(const uint8_t* data, size_t length);
bool encode_event_record(const EventEntry& event, EventRecord& output);
EventDecodeResult decode_event_record(const uint8_t* data, size_t length);
LogStorageEstimate estimate_log_storage(uint16_t sample_period_seconds = kHistoryDefaultSamplePeriodSeconds,
                                        uint16_t retention_days = kHistoryDefaultRetentionDays,
                                        uint16_t event_capacity = kEventDefaultCapacity);

const char* to_string(HistoryState state);
const char* to_string(HistoryFault fault);
const char* to_string(EventCode code);
const char* to_string(EventSeverity severity);
const char* to_string(EventSource source);
const char* to_string(LogDecodeReason reason);

}  // namespace ventilation
