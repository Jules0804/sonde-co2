idf_component_register(
  SRCS "api_request_guard.cpp"
  INCLUDE_DIRS "include"
  REQUIRES http_api_contract local_auth
)
