idf_component_register(
  SRCS "app_main.cpp"
  INCLUDE_DIRS "."
  REQUIRES config_store control_core history_log service_mode nvs_flash esp_timer
)
