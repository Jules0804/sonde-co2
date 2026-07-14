#include "api_handlers.hpp"

#include <cstdlib>
#include <cstring>
#include <cstdio>

namespace ventilation {
namespace {

ApiHandlerResult from_json_result(ApiJsonWriteResult result) {
  return result.ok ? ApiHandlerResult{ApiHandlerStatus::kOk, 200U, result.length}
                   : ApiHandlerResult{ApiHandlerStatus::kBufferTooSmall, 500U, 0U};
}

ApiHandlerResult write_literal(const char* json, char* out, size_t out_size) {
  if (json == nullptr || out == nullptr || out_size == 0U) {
    return {ApiHandlerStatus::kBufferTooSmall, 500U, 0U};
  }
  const size_t length = std::strlen(json);
  if (length >= out_size) {
    out[0] = '\0';
    return {ApiHandlerStatus::kBufferTooSmall, 500U, 0U};
  }
  std::memcpy(out, json, length + 1U);
  return {ApiHandlerStatus::kOk, 200U, length};
}

ApiHandlerResult write_error(ApiHandlerStatus status, uint16_t http_status, char* out, size_t out_size) {
  const ApiErrorBody body{
      to_string(status),
      status == ApiHandlerStatus::kRevisionRequired ? "Revision If-Match requise."
      : status == ApiHandlerStatus::kRevisionConflict ? "Revision de configuration obsolete."
      : status == ApiHandlerStatus::kInvalidConfig ? "Configuration refusee."
      : status == ApiHandlerStatus::kInvalidTest ? "Test actionneur refuse."
      : status == ApiHandlerStatus::kAuthFailed ? "Connexion refusee."
      : "Requete invalide.",
      0U,
  };
  const size_t length = format_api_error_json(body, out, out_size);
  return {length > 0U ? status : ApiHandlerStatus::kBufferTooSmall,
          length > 0U ? http_status : 500U,
          length};
}

const char* find_json_key(const char* body, const char* key) {
  if (body == nullptr || key == nullptr) return nullptr;
  char quoted[48]{};
  const int written = std::snprintf(quoted, sizeof(quoted), "\"%s\"", key);
  if (written <= 0 || static_cast<size_t>(written) >= sizeof(quoted)) return nullptr;
  const char* match = std::strstr(body, quoted);
  if (match == nullptr) return nullptr;
  const char* colon = std::strchr(match + written, ':');
  return colon == nullptr ? nullptr : colon + 1;
}

bool read_json_number(const char* body, const char* key, double& value) {
  const char* at = find_json_key(body, key);
  if (at == nullptr) return false;
  char* end = nullptr;
  value = std::strtod(at, &end);
  return end != at;
}

bool read_json_u32(const char* body, const char* key, uint32_t& value) {
  double number = 0.0;
  if (!read_json_number(body, key, number)) return false;
  if (number < 0.0 || number > 4294967295.0) return false;
  const auto integer = static_cast<uint32_t>(number);
  if (static_cast<double>(integer) != number) return false;
  value = integer;
  return true;
}

bool allowed_config_key(const char* begin, size_t length) {
  return (length == 9U && std::strncmp(begin, "targetPpm", length) == 0) ||
         (length == 12U && std::strncmp(begin, "minOutputPct", length) == 0) ||
         (length == 12U && std::strncmp(begin, "maxOutputPct", length) == 0) ||
         (length == 12U && std::strncmp(begin, "highAlarmPpm", length) == 0);
}

bool config_body_has_only_known_fields(const char* body) {
  if (body == nullptr) return false;
  const char* cursor = body;
  while ((cursor = std::strchr(cursor, '"')) != nullptr) {
    const char* key_begin = cursor + 1;
    const char* key_end = std::strchr(key_begin, '"');
    if (key_end == nullptr) return false;
    const char* colon = key_end + 1;
    while (*colon == ' ' || *colon == '\t' || *colon == '\r' || *colon == '\n') ++colon;
    if (*colon == ':' && !allowed_config_key(key_begin, static_cast<size_t>(key_end - key_begin))) {
      return false;
    }
    cursor = key_end + 1;
  }
  return true;
}

bool parse_if_match_revision(const char* if_match, uint32_t& revision) {
  if (if_match == nullptr || if_match[0] == '\0') return false;
  const char* begin = if_match;
  if (*begin == '"') ++begin;
  char* end = nullptr;
  const unsigned long parsed = std::strtoul(begin, &end, 10);
  if (end == begin) return false;
  if (*end == '"') ++end;
  if (*end != '\0') return false;
  revision = static_cast<uint32_t>(parsed);
  return true;
}

bool parse_config_body(const ApiReadContext& context, const char* body, PersistentConfig& candidate) {
  if (!config_body_has_only_known_fields(body)) return false;

  uint32_t target_ppm = 0U;
  uint32_t high_alarm_ppm = 0U;
  double min_output_pct = 0.0;
  double max_output_pct = 0.0;
  if (!read_json_u32(body, "targetPpm", target_ppm)) return false;
  if (!read_json_number(body, "minOutputPct", min_output_pct)) return false;
  if (!read_json_number(body, "maxOutputPct", max_output_pct)) return false;
  if (!read_json_u32(body, "highAlarmPpm", high_alarm_ppm)) return false;
  if (target_ppm > 65535U || high_alarm_ppm > 65535U) return false;

  candidate = context.config;
  candidate.target_ppm = static_cast<uint16_t>(target_ppm);
  candidate.min_output_pct = static_cast<float>(min_output_pct);
  candidate.max_output_pct = static_cast<float>(max_output_pct);
  candidate.high_alarm_ppm = static_cast<uint16_t>(high_alarm_ppm);
  return validate_persistent_config(candidate);
}

bool output_pct_allowed(float output_pct) {
  return output_pct == 0.0F || output_pct == 25.0F || output_pct == 50.0F ||
         output_pct == 75.0F || output_pct == 100.0F;
}

}  // namespace

ApiHandlerResult handle_status_get(const ApiReadContext& context, char* out, size_t out_size) {
  return from_json_result(format_status_json(context.snapshot, context.epoch_seconds, out, out_size));
}

ApiHandlerResult handle_config_get(const ApiReadContext& context, char* out, size_t out_size) {
  return from_json_result(format_config_json(context.config, context.config_revision, out, out_size));
}

ApiHandlerResult handle_session_read(const ApiReadContext& context, char* out, size_t out_size) {
  return from_json_result(format_session_json(context.session, context.now_ms, out, out_size));
}

ApiHandlerResult handle_session_create(const LoginResult& login, uint64_t now_ms, char* out, size_t out_size) {
  if (login.status == AuthStatus::kLoginLocked) {
    ApiErrorBody body{to_string(ApiHandlerStatus::kAuthFailed), "Trop de tentatives.", login.retry_after_seconds};
    const size_t length = format_api_error_json(body, out, out_size);
    return {length > 0U ? ApiHandlerStatus::kAuthFailed : ApiHandlerStatus::kBufferTooSmall,
            length > 0U ? 429U : 500U,
            length};
  }
  if (login.status != AuthStatus::kOk || login.session == nullptr) {
    return write_error(ApiHandlerStatus::kAuthFailed, 401U, out, out_size);
  }
  return from_json_result(format_session_json(*login.session, now_ms, out, out_size));
}

ApiHandlerResult handle_session_delete(bool closed, char* out, size_t out_size) {
  return closed ? write_literal("{\"disconnected\":true}", out, out_size)
                : write_error(ApiHandlerStatus::kAuthFailed, 401U, out, out_size);
}

ApiHandlerResult handle_history_sample_get(const ApiReadContext& context, char* out, size_t out_size) {
  return from_json_result(format_history_sample_json(context.history_sample, out, out_size));
}

ApiHandlerResult handle_history_delete(uint32_t deleted_samples, char* out, size_t out_size) {
  if (out == nullptr || out_size == 0U) return {ApiHandlerStatus::kBufferTooSmall, 500U, 0U};
  const int written = std::snprintf(out, out_size, "{\"cleared\":true,\"deletedSamples\":%lu}",
                                    static_cast<unsigned long>(deleted_samples));
  if (written < 0 || static_cast<size_t>(written) >= out_size) {
    out[0] = '\0';
    return {ApiHandlerStatus::kBufferTooSmall, 500U, 0U};
  }
  return {ApiHandlerStatus::kOk, 200U, static_cast<size_t>(written)};
}

ApiHandlerResult handle_event_get(const ApiReadContext& context, char* out, size_t out_size) {
  return from_json_result(format_event_json(context.event, out, out_size));
}

ConfigUpdateResult handle_config_put(const ApiReadContext& context,
                                     const char* body,
                                     const char* if_match,
                                     char* out,
                                     size_t out_size) {
  uint32_t expected_revision = 0U;
  if (!parse_if_match_revision(if_match, expected_revision)) {
    return {write_error(ApiHandlerStatus::kRevisionRequired, 428U, out, out_size), context.config, 0U};
  }
  if (expected_revision != context.config_revision) {
    return {write_error(ApiHandlerStatus::kRevisionConflict, 409U, out, out_size), context.config, expected_revision};
  }

  PersistentConfig candidate{};
  if (!parse_config_body(context, body, candidate)) {
    return {write_error(ApiHandlerStatus::kInvalidConfig, 422U, out, out_size), context.config, expected_revision};
  }

  const auto formatted = format_config_json(candidate, context.config_revision + 1U, out, out_size);
  return {from_json_result(formatted), candidate, expected_revision};
}

OutputTestResult handle_output_test_start(const char* body) {
  double output_pct = 0.0;
  uint32_t duration_seconds = 0U;
  if (!read_json_number(body, "outputPct", output_pct) ||
      !read_json_u32(body, "durationSeconds", duration_seconds)) {
    return {{ApiHandlerStatus::kInvalidBody, 400U, 0U}, {}};
  }

  const auto output = static_cast<float>(output_pct);
  if (!output_pct_allowed(output) || duration_seconds < 5U || duration_seconds > 600U) {
    return {{ApiHandlerStatus::kInvalidTest, 422U, 0U}, {}};
  }
  return {{ApiHandlerStatus::kOk, 200U, 0U}, {output, duration_seconds}};
}

ApiHandlerResult handle_output_test_stop(const ApiReadContext& context, char* out, size_t out_size) {
  return handle_status_get(context, out, out_size);
}

const char* to_string(ApiHandlerStatus status) {
  switch (status) {
    case ApiHandlerStatus::kOk: return "OK";
    case ApiHandlerStatus::kInvalidBody: return "INVALID_BODY";
    case ApiHandlerStatus::kRevisionRequired: return "REVISION_REQUIRED";
    case ApiHandlerStatus::kRevisionConflict: return "REVISION_CONFLICT";
    case ApiHandlerStatus::kInvalidConfig: return "INVALID_CONFIG";
    case ApiHandlerStatus::kInvalidTest: return "INVALID_TEST";
    case ApiHandlerStatus::kAuthFailed: return "AUTH_FAILED";
    case ApiHandlerStatus::kBufferTooSmall: return "BUFFER_TOO_SMALL";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
