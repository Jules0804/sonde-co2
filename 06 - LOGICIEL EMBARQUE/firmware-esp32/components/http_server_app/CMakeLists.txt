idf_component_register(
  SRCS "http_server_app.cpp"
  INCLUDE_DIRS "include"
  REQUIRES api_handlers api_payloads api_request_guard api_response config_store firmware_app history_log http_api_contract local_auth
)
