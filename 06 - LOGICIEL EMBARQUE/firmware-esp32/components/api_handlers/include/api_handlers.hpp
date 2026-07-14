#pragma once

#include <cstddef>
#include <cstdint>

#include "api_payloads.hpp"
#include "api_response.hpp"
#include "config_store.hpp"
#include "firmware_app.hpp"
#include "history_log.hpp"
#include "local_auth.hpp"

namespace ventilation {

constexpr size_t kApiCommandJsonMaxBytes = 192U;

enum class ApiHandlerStatus : uint8_t {
  kOk,
  kInvalidBody,
  kRevisionRequired,
  kRevisionConflict,
  kInvalidConfig,
  kInvalidTest,
  kAuthFailed,
  kBufferTooSmall,
};

struct ApiHandlerResult {
  ApiHandlerStatus status;
  uint16_t http_status;
  size_t length;
};

struct ApiReadContext {
  FirmwareAppSnapshot snapshot;
  PersistentConfig config;
  uint32_t config_revision;
  SessionRecord session;
  HistorySample history_sample;
  EventEntry event;
  uint64_t epoch_seconds;
  uint64_t now_ms;
};

struct ConfigUpdateResult {
  ApiHandlerResult result;
  PersistentConfig candidate;
  uint32_t expected_revision;
};

struct OutputTestCommand {
  float output_pct;
  uint32_t duration_seconds;
};

struct OutputTestResult {
  ApiHandlerResult result;
  OutputTestCommand command;
};

ApiHandlerResult handle_status_get(const ApiReadContext& context, char* out, size_t out_size);
ApiHandlerResult handle_config_get(const ApiReadContext& context, char* out, size_t out_size);
ApiHandlerResult handle_session_read(const ApiReadContext& context, char* out, size_t out_size);
ApiHandlerResult handle_session_create(const LoginResult& login, uint64_t now_ms, char* out, size_t out_size);
ApiHandlerResult handle_session_delete(bool closed, char* out, size_t out_size);
ApiHandlerResult handle_history_sample_get(const ApiReadContext& context, char* out, size_t out_size);
ApiHandlerResult handle_history_delete(uint32_t deleted_samples, char* out, size_t out_size);
ApiHandlerResult handle_event_get(const ApiReadContext& context, char* out, size_t out_size);
ConfigUpdateResult handle_config_put(const ApiReadContext& context,
                                     const char* body,
                                     const char* if_match,
                                     char* out,
                                     size_t out_size);
OutputTestResult handle_output_test_start(const char* body);
ApiHandlerResult handle_output_test_stop(const ApiReadContext& context, char* out, size_t out_size);

const char* to_string(ApiHandlerStatus status);

}  // namespace ventilation
