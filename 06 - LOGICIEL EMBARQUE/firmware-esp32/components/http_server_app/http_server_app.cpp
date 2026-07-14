#include "http_server_app.hpp"

namespace ventilation {
namespace {

bool header_present(const char* value) {
  return value != nullptr && value[0] != '\0';
}

HttpServerPlan error_plan(const ApiGuardResult& guard) {
  return {
      guard.http_status,
      guard.handler,
      HttpServerAction::kSendError,
      security_headers(),
      security_header_count(),
      kApiErrorJsonMaxBytes,
      guard_status_requires_bearer_challenge(guard.status),
      guard_status_allows_retry_after(guard.status),
  };
}

HttpServerAction action_for_handler(ApiHandler handler, const HttpServerRequest& request) {
  switch (handler) {
    case ApiHandler::kStatus: return HttpServerAction::kSendStatus;
    case ApiHandler::kHistoryGet: return HttpServerAction::kSendHistory;
    case ApiHandler::kHistoryDelete: return HttpServerAction::kClearHistory;
    case ApiHandler::kEvents: return HttpServerAction::kSendEvents;
    case ApiHandler::kSessionCreate: return HttpServerAction::kOpenSession;
    case ApiHandler::kSessionRead: return HttpServerAction::kReadSession;
    case ApiHandler::kSessionDelete: return HttpServerAction::kCloseSession;
    case ApiHandler::kConfigGet: return HttpServerAction::kSendConfig;
    case ApiHandler::kConfigPut:
      return header_present(request.if_match) ? HttpServerAction::kUpdateConfig
                                              : HttpServerAction::kRejectMissingRevision;
    case ApiHandler::kOutputTestStart: return HttpServerAction::kStartOutputTest;
    case ApiHandler::kOutputTestStop: return HttpServerAction::kStopOutputTest;
    case ApiHandler::kNotFound: return HttpServerAction::kSendError;
  }
  return HttpServerAction::kSendError;
}

uint16_t http_status_for_action(HttpServerAction action) {
  switch (action) {
    case HttpServerAction::kRejectMissingRevision: return 428U;
    case HttpServerAction::kSendError: return 500U;
    case HttpServerAction::kSendStatus:
    case HttpServerAction::kSendHistory:
    case HttpServerAction::kClearHistory:
    case HttpServerAction::kSendEvents:
    case HttpServerAction::kOpenSession:
    case HttpServerAction::kReadSession:
    case HttpServerAction::kCloseSession:
    case HttpServerAction::kSendConfig:
    case HttpServerAction::kUpdateConfig:
    case HttpServerAction::kStartOutputTest:
    case HttpServerAction::kStopOutputTest:
      return 200U;
  }
  return 500U;
}

}  // namespace

HttpServerPlan plan_http_server_request(LocalAuth& auth, const HttpServerRequest& request) {
  const ApiGuardResult guard = guard_api_request(auth, request.api);
  if (guard.status != ApiGuardStatus::kOk) {
    return error_plan(guard);
  }

  const HttpServerAction action = action_for_handler(guard.handler, request);
  return {
      http_status_for_action(action),
      guard.handler,
      action,
      security_headers(),
      security_header_count(),
      payload_capacity_for_handler(guard.handler),
      false,
      false,
  };
}

size_t payload_capacity_for_handler(ApiHandler handler) {
  switch (handler) {
    case ApiHandler::kStatus: return kApiStatusJsonMaxBytes;
    case ApiHandler::kHistoryGet: return kApiHistorySampleJsonMaxBytes;
    case ApiHandler::kHistoryDelete: return kApiErrorJsonMaxBytes;
    case ApiHandler::kEvents: return kApiEventJsonMaxBytes;
    case ApiHandler::kSessionCreate: return kApiSessionJsonMaxBytes;
    case ApiHandler::kSessionRead: return kApiSessionJsonMaxBytes;
    case ApiHandler::kSessionDelete: return kApiErrorJsonMaxBytes;
    case ApiHandler::kConfigGet: return kApiConfigJsonMaxBytes;
    case ApiHandler::kConfigPut: return kApiConfigJsonMaxBytes;
    case ApiHandler::kOutputTestStart: return kApiStatusJsonMaxBytes;
    case ApiHandler::kOutputTestStop: return kApiStatusJsonMaxBytes;
    case ApiHandler::kNotFound: return kApiErrorJsonMaxBytes;
  }
  return kApiErrorJsonMaxBytes;
}

const char* to_string(HttpServerAction action) {
  switch (action) {
    case HttpServerAction::kSendError: return "SEND_ERROR";
    case HttpServerAction::kSendStatus: return "SEND_STATUS";
    case HttpServerAction::kSendHistory: return "SEND_HISTORY";
    case HttpServerAction::kClearHistory: return "CLEAR_HISTORY";
    case HttpServerAction::kSendEvents: return "SEND_EVENTS";
    case HttpServerAction::kOpenSession: return "OPEN_SESSION";
    case HttpServerAction::kReadSession: return "READ_SESSION";
    case HttpServerAction::kCloseSession: return "CLOSE_SESSION";
    case HttpServerAction::kSendConfig: return "SEND_CONFIG";
    case HttpServerAction::kRejectMissingRevision: return "REJECT_MISSING_REVISION";
    case HttpServerAction::kUpdateConfig: return "UPDATE_CONFIG";
    case HttpServerAction::kStartOutputTest: return "START_OUTPUT_TEST";
    case HttpServerAction::kStopOutputTest: return "STOP_OUTPUT_TEST";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
