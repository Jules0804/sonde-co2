idf_component_register(
  SRCS "firmware_app.cpp"
  INCLUDE_DIRS "include"
  REQUIRES actuator_output config_store control_core history_log sensor_cycle service_mode
)
