#pragma once

#include <cstddef>
#include <cstdint>

#include "config_store.hpp"
#include "firmware_app.hpp"
#include "history_log.hpp"
#include "local_auth.hpp"

namespace ventilation {

constexpr size_t kApiTimestampMaxBytes = 24U;
constexpr size_t kApiStatusJsonMaxBytes = 384U;
constexpr size_t kApiConfigJsonMaxBytes = 160U;
constexpr size_t kApiSessionJsonMaxBytes = 256U;
constexpr size_t kApiHistorySampleJsonMaxBytes = 192U;
constexpr size_t kApiEventJsonMaxBytes = 224U;
constexpr size_t kApiHexTokenMaxBytes = (kSessionTokenBytes * 2U) + 1U;
constexpr size_t kApiHexCsrfMaxBytes = (kCsrfTokenBytes * 2U) + 1U;

struct ApiJsonWriteResult {
  bool ok;
  size_t length;
};

const char* api_mode_from_snapshot(const FirmwareAppSnapshot& snapshot);
const char* api_fault_from_history(HistoryFault fault);
const char* api_sensor_state_from_status(SensorSampleStatus status);

ApiJsonWriteResult format_api_timestamp(uint64_t epoch_seconds, char* out, size_t out_size);
ApiJsonWriteResult format_status_json(const FirmwareAppSnapshot& snapshot,
                                      uint64_t epoch_seconds,
                                      char* out,
                                      size_t out_size);
ApiJsonWriteResult format_config_json(const PersistentConfig& config,
                                      uint32_t revision,
                                      char* out,
                                      size_t out_size);
ApiJsonWriteResult format_session_json(const SessionRecord& session,
                                       uint64_t now_ms,
                                       char* out,
                                       size_t out_size);
ApiJsonWriteResult format_history_sample_json(const HistorySample& sample,
                                              char* out,
                                              size_t out_size);
ApiJsonWriteResult format_event_json(const EventEntry& event,
                                     char* out,
                                     size_t out_size);

}  // namespace ventilation
