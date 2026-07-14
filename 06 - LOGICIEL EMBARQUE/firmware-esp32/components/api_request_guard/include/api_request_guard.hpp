#pragma once

#include <cstddef>
#include <cstdint>

#include "http_api_contract.hpp"
#include "local_auth.hpp"

namespace ventilation {

enum class ApiGuardStatus : uint8_t {
  kOk,
  kNotFound,
  kUnsupportedMediaType,
  kPayloadTooLarge,
  kAuthRequired,
  kForbidden,
  kCsrfRequired,
};

struct ApiRequestView {
  HttpMethod method;
  const char* path;
  bool content_type_json;
  size_t body_length;
  const SessionToken* bearer_token;
  const CsrfToken* csrf_token;
  uint64_t now_ms;
};

struct ApiGuardResult {
  ApiGuardStatus status;
  uint16_t http_status;
  ApiHandler handler;
  const ApiRoute* route;
  const SessionRecord* session;
};

bool api_method_requires_json_body(HttpMethod method);
ApiGuardResult guard_api_request(LocalAuth& auth, const ApiRequestView& request);
const char* error_code(ApiGuardStatus status);
const char* to_string(ApiGuardStatus status);

}  // namespace ventilation
