#include "http_api_contract.hpp"

#include <cstring>

namespace ventilation {
namespace {

constexpr ApiRoute kRoutes[kApiRouteCount] = {
    {HttpMethod::kGet, "/api/v1/status", ApiRole::kPublic, false, ApiHandler::kStatus},
    {HttpMethod::kGet, "/api/v1/history", ApiRole::kPublic, false, ApiHandler::kHistoryGet},
    {HttpMethod::kDelete, "/api/v1/history", ApiRole::kAdmin, true, ApiHandler::kHistoryDelete},
    {HttpMethod::kGet, "/api/v1/events", ApiRole::kInstaller, false, ApiHandler::kEvents},
    {HttpMethod::kPost, "/api/v1/session", ApiRole::kPublic, false, ApiHandler::kSessionCreate},
    {HttpMethod::kGet, "/api/v1/session", ApiRole::kInstaller, false, ApiHandler::kSessionRead},
    {HttpMethod::kDelete, "/api/v1/session", ApiRole::kInstaller, true, ApiHandler::kSessionDelete},
    {HttpMethod::kGet, "/api/v1/config", ApiRole::kInstaller, false, ApiHandler::kConfigGet},
    {HttpMethod::kPut, "/api/v1/config", ApiRole::kInstaller, true, ApiHandler::kConfigPut},
    {HttpMethod::kPost, "/api/v1/output-test", ApiRole::kInstaller, true, ApiHandler::kOutputTestStart},
    {HttpMethod::kDelete, "/api/v1/output-test", ApiRole::kInstaller, true, ApiHandler::kOutputTestStop},
};

}  // namespace

const ApiRoute* api_routes() {
  return kRoutes;
}

size_t api_route_count() {
  return kApiRouteCount;
}

const ApiRoute* find_api_route(HttpMethod method, const char* path) {
  if (path == nullptr) return nullptr;
  for (size_t index = 0U; index < kApiRouteCount; ++index) {
    if (kRoutes[index].method == method && std::strcmp(kRoutes[index].path, path) == 0) {
      return &kRoutes[index];
    }
  }
  return nullptr;
}

const char* to_string(HttpMethod method) {
  switch (method) {
    case HttpMethod::kGet: return "GET";
    case HttpMethod::kPost: return "POST";
    case HttpMethod::kPut: return "PUT";
    case HttpMethod::kDelete: return "DELETE";
  }
  return "UNKNOWN";
}

const char* to_string(ApiRole role) {
  switch (role) {
    case ApiRole::kPublic: return "PUBLIC";
    case ApiRole::kInstaller: return "INSTALLER";
    case ApiRole::kAdmin: return "ADMIN";
  }
  return "UNKNOWN";
}

const char* to_string(ApiHandler handler) {
  switch (handler) {
    case ApiHandler::kStatus: return "STATUS";
    case ApiHandler::kHistoryGet: return "HISTORY_GET";
    case ApiHandler::kHistoryDelete: return "HISTORY_DELETE";
    case ApiHandler::kEvents: return "EVENTS";
    case ApiHandler::kSessionCreate: return "SESSION_CREATE";
    case ApiHandler::kSessionRead: return "SESSION_READ";
    case ApiHandler::kSessionDelete: return "SESSION_DELETE";
    case ApiHandler::kConfigGet: return "CONFIG_GET";
    case ApiHandler::kConfigPut: return "CONFIG_PUT";
    case ApiHandler::kOutputTestStart: return "OUTPUT_TEST_START";
    case ApiHandler::kOutputTestStop: return "OUTPUT_TEST_STOP";
    case ApiHandler::kNotFound: return "NOT_FOUND";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
