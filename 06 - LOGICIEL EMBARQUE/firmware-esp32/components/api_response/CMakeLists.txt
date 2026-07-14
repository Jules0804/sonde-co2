idf_component_register(
  SRCS "api_response.cpp"
  INCLUDE_DIRS "include"
  REQUIRES api_request_guard http_api_contract
)
