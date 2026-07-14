#include "api_request_guard.hpp"

namespace ventilation {

bool api_method_requires_json_body(HttpMethod method) {
  return method == HttpMethod::kPost || method == HttpMethod::kPut;
}

ApiGuardResult guard_api_request(LocalAuth& auth, const ApiRequestView& request) {
  const ApiRoute* route = find_api_route(request.method, request.path);
  if (route == nullptr) {
    return ApiGuardResult{ApiGuardStatus::kNotFound, 404U, ApiHandler::kNotFound, nullptr, nullptr};
  }

  if (api_method_requires_json_body(request.method) && request.body_length > 0U && !request.content_type_json) {
    return ApiGuardResult{ApiGuardStatus::kUnsupportedMediaType, 415U, route->handler, route, nullptr};
  }

  if (request.body_length > kApiMaxJsonBodyBytes) {
    return ApiGuardResult{ApiGuardStatus::kPayloadTooLarge, 413U, route->handler, route, nullptr};
  }

  if (route->min_role != ApiRole::kPublic) {
    const AuthCheck check = auth.authorize(
        request.bearer_token, route->min_role, route->csrf_required, request.csrf_token, request.now_ms);
    if (check.status == AuthStatus::kAuthRequired) {
      return ApiGuardResult{ApiGuardStatus::kAuthRequired, 401U, route->handler, route, nullptr};
    }
    if (check.status == AuthStatus::kForbidden) {
      return ApiGuardResult{ApiGuardStatus::kForbidden, 403U, route->handler, route, check.session};
    }
    if (check.status == AuthStatus::kCsrfRequired) {
      return ApiGuardResult{ApiGuardStatus::kCsrfRequired, 403U, route->handler, route, check.session};
    }
    if (check.status != AuthStatus::kOk) {
      return ApiGuardResult{ApiGuardStatus::kAuthRequired, 401U, route->handler, route, nullptr};
    }
    return ApiGuardResult{ApiGuardStatus::kOk, 200U, route->handler, route, check.session};
  }

  return ApiGuardResult{ApiGuardStatus::kOk, 200U, route->handler, route, nullptr};
}

const char* error_code(ApiGuardStatus status) {
  switch (status) {
    case ApiGuardStatus::kOk: return "OK";
    case ApiGuardStatus::kNotFound: return "NOT_FOUND";
    case ApiGuardStatus::kUnsupportedMediaType: return "UNSUPPORTED_MEDIA_TYPE";
    case ApiGuardStatus::kPayloadTooLarge: return "PAYLOAD_TOO_LARGE";
    case ApiGuardStatus::kAuthRequired: return "AUTH_REQUIRED";
    case ApiGuardStatus::kForbidden: return "FORBIDDEN";
    case ApiGuardStatus::kCsrfRequired: return "CSRF_REQUIRED";
  }
  return "REQUEST_ERROR";
}

const char* to_string(ApiGuardStatus status) {
  return error_code(status);
}

}  // namespace ventilation
