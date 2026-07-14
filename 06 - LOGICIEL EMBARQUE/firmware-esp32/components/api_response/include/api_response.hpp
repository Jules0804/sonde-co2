#pragma once

#include <cstddef>
#include <cstdint>

#include "api_request_guard.hpp"
#include "http_api_contract.hpp"

namespace ventilation {

constexpr const char* kJsonContentType = "application/json; charset=utf-8";
constexpr size_t kSecurityHeaderCount = 7U;
constexpr size_t kApiErrorJsonMaxBytes = 160U;

struct HttpHeader {
  const char* name;
  const char* value;
};

struct ApiErrorBody {
  const char* code;
  const char* message;
  uint32_t retry_after_seconds;
};

const HttpHeader* security_headers();
size_t security_header_count();
ApiErrorBody api_error_body(ApiGuardStatus status);
const char* api_error_message(ApiGuardStatus status);
bool guard_status_requires_bearer_challenge(ApiGuardStatus status);
bool guard_status_allows_retry_after(ApiGuardStatus status);
size_t format_api_error_json(const ApiErrorBody& body, char* output, size_t output_size);

}  // namespace ventilation
