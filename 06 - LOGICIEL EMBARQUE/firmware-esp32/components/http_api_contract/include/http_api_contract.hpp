#pragma once

#include <cstddef>
#include <cstdint>

namespace ventilation {

constexpr const char* kApiBasePath = "/api/v1";
constexpr size_t kApiRouteCount = 11U;
constexpr size_t kApiMaxJsonBodyBytes = 1024U;
constexpr uint32_t kApiSessionDurationSeconds = 15U * 60U;
constexpr uint8_t kApiMaxFailedLoginBeforeLock = 5U;

enum class HttpMethod : uint8_t {
  kGet,
  kPost,
  kPut,
  kDelete,
};

enum class ApiRole : uint8_t {
  kPublic,
  kInstaller,
  kAdmin,
};

enum class ApiHandler : uint8_t {
  kStatus,
  kHistoryGet,
  kHistoryDelete,
  kEvents,
  kSessionCreate,
  kSessionRead,
  kSessionDelete,
  kConfigGet,
  kConfigPut,
  kOutputTestStart,
  kOutputTestStop,
  kNotFound,
};

struct ApiRoute {
  HttpMethod method;
  const char* path;
  ApiRole min_role;
  bool csrf_required;
  ApiHandler handler;
};

const ApiRoute* api_routes();
size_t api_route_count();
const ApiRoute* find_api_route(HttpMethod method, const char* path);
const char* to_string(HttpMethod method);
const char* to_string(ApiRole role);
const char* to_string(ApiHandler handler);

}  // namespace ventilation
