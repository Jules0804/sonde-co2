idf_component_register(
  SRCS "api_handlers.cpp"
  INCLUDE_DIRS "include"
  REQUIRES api_payloads api_response config_store firmware_app history_log local_auth
)
