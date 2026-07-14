#include "api_response.hpp"

#include <cstdio>

namespace ventilation {
namespace {

constexpr HttpHeader kSecurityHeaders[kSecurityHeaderCount] = {
    {"Content-Type", kJsonContentType},
    {"Cache-Control", "no-store"},
    {"X-Content-Type-Options", "nosniff"},
    {"X-Frame-Options", "DENY"},
    {"Referrer-Policy", "no-referrer"},
    {"Permissions-Policy", "camera=(), microphone=(), geolocation=()"},
    {"Content-Security-Policy",
     "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
     "connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'"},
};

}  // namespace

const HttpHeader* security_headers() {
  return kSecurityHeaders;
}

size_t security_header_count() {
  return kSecurityHeaderCount;
}

const char* api_error_message(ApiGuardStatus status) {
  switch (status) {
    case ApiGuardStatus::kOk: return "OK";
    case ApiGuardStatus::kNotFound: return "Endpoint inconnu.";
    case ApiGuardStatus::kUnsupportedMediaType: return "Content-Type application/json requis.";
    case ApiGuardStatus::kPayloadTooLarge: return "Payload too large.";
    case ApiGuardStatus::kAuthRequired: return "Connexion requise.";
    case ApiGuardStatus::kForbidden: return "Droits insuffisants.";
    case ApiGuardStatus::kCsrfRequired: return "Jeton de confirmation absent ou invalide.";
  }
  return "Erreur de requete.";
}

ApiErrorBody api_error_body(ApiGuardStatus status) {
  return ApiErrorBody{error_code(status), api_error_message(status), 0U};
}

bool guard_status_requires_bearer_challenge(ApiGuardStatus status) {
  return status == ApiGuardStatus::kAuthRequired;
}

bool guard_status_allows_retry_after(ApiGuardStatus status) {
  return status == ApiGuardStatus::kAuthRequired || status == ApiGuardStatus::kForbidden;
}

size_t format_api_error_json(const ApiErrorBody& body, char* output, size_t output_size) {
  if (output == nullptr || output_size == 0U) return 0U;
  const int written = body.retry_after_seconds > 0U
                          ? std::snprintf(output, output_size,
                                          "{\"code\":\"%s\",\"message\":\"%s\",\"retryAfterSeconds\":%u}",
                                          body.code, body.message, body.retry_after_seconds)
                          : std::snprintf(output, output_size, "{\"code\":\"%s\",\"message\":\"%s\"}",
                                          body.code, body.message);
  if (written < 0) {
    output[0] = '\0';
    return 0U;
  }
  const auto as_size = static_cast<size_t>(written);
  return as_size >= output_size ? output_size - 1U : as_size;
}

}  // namespace ventilation
