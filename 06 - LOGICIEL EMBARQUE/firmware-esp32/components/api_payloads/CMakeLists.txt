idf_component_register(
  SRCS "api_payloads.cpp"
  INCLUDE_DIRS "include"
  REQUIRES actuator_output config_store firmware_app history_log http_api_contract local_auth sensor_cycle
)
