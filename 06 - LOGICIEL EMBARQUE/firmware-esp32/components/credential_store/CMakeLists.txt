idf_component_register(
  SRCS "credential_store.cpp"
  INCLUDE_DIRS "include"
  REQUIRES http_api_contract local_auth
)
