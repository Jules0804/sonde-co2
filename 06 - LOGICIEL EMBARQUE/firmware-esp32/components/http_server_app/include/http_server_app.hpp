#pragma once

#include <cstddef>
#include <cstdint>

#include "api_payloads.hpp"
#include "api_handlers.hpp"
#include "api_request_guard.hpp"
#include "api_response.hpp"
#include "http_api_contract.hpp"

namespace ventilation {

constexpr size_t kHttpServerAppRouteCount = kApiRouteCount;
constexpr size_t kHttpServerAppMaxResponseBytes = kApiStatusJsonMaxBytes;

enum class HttpServerAction : uint8_t {
  kSendError,
  kSendStatus,
  kSendHistory,
  kClearHistory,
  kSendEvents,
  kOpenSession,
  kReadSession,
  kCloseSession,
  kSendConfig,
  kRejectMissingRevision,
  kUpdateConfig,
  kStartOutputTest,
  kStopOutputTest,
};

struct HttpServerRequest {
  ApiRequestView api;
  const char* body;
  const char* if_match;
};

struct HttpServerPlan {
  uint16_t http_status;
  ApiHandler handler;
  HttpServerAction action;
  const HttpHeader* headers;
  size_t header_count;
  size_t payload_capacity;
  bool bearer_challenge;
  bool retry_after_allowed;
};

HttpServerPlan plan_http_server_request(LocalAuth& auth, const HttpServerRequest& request);
size_t payload_capacity_for_handler(ApiHandler handler);
const char* to_string(HttpServerAction action);

}  // namespace ventilation
