#include "credential_store.hpp"

namespace ventilation {
namespace {

void write_u16_le(uint8_t* data, size_t offset, uint16_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
}

void write_u32_le(uint8_t* data, size_t offset, uint32_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
  data[offset + 2U] = static_cast<uint8_t>((value >> 16U) & 0xffU);
  data[offset + 3U] = static_cast<uint8_t>((value >> 24U) & 0xffU);
}

uint16_t read_u16_le(const uint8_t* data, size_t offset) {
  return static_cast<uint16_t>(data[offset]) |
         static_cast<uint16_t>(static_cast<uint16_t>(data[offset + 1U]) << 8U);
}

uint32_t read_u32_le(const uint8_t* data, size_t offset) {
  return static_cast<uint32_t>(data[offset]) |
         (static_cast<uint32_t>(data[offset + 1U]) << 8U) |
         (static_cast<uint32_t>(data[offset + 2U]) << 16U) |
         (static_cast<uint32_t>(data[offset + 3U]) << 24U);
}

bool valid_role(ApiRole role) {
  return role == ApiRole::kInstaller || role == ApiRole::kAdmin;
}

bool valid_algorithm(CredentialAlgorithm algorithm) {
  return algorithm == CredentialAlgorithm::kExternalMeasuredVerifier;
}

}  // namespace

bool password_length_allowed(size_t length) {
  return length >= kPasswordMinLength && length <= kPasswordMaxLength;
}

uint32_t crc32_credential(const uint8_t* data, size_t length) {
  uint32_t crc = 0xffffffffU;
  for (size_t index = 0U; index < length; ++index) {
    crc ^= data[index];
    for (uint8_t bit = 0U; bit < 8U; ++bit) {
      crc = (crc & 1U) != 0U ? (crc >> 1U) ^ 0xedb88320U : crc >> 1U;
    }
  }
  return ~crc;
}

bool encode_credential_record(const CredentialPayload& payload, CredentialRecord& output) {
  if (!valid_role(payload.role)) return false;
  if (!valid_algorithm(payload.algorithm)) return false;
  if (!password_length_allowed(payload.password_min_length)) return false;

  output.bytes.fill(0U);
  uint8_t* data = output.bytes.data();
  for (size_t index = 0U; index < kCredentialMagic.size(); ++index) data[index] = kCredentialMagic[index];
  write_u16_le(data, 4U, kCredentialSchemaVersion);
  data[6U] = static_cast<uint8_t>(payload.role);
  data[7U] = static_cast<uint8_t>(payload.algorithm);
  write_u32_le(data, 8U, payload.generation);
  write_u16_le(data, 12U, payload.password_min_length);
  for (size_t index = 0U; index < payload.salt.size(); ++index) data[16U + index] = payload.salt[index];
  for (size_t index = 0U; index < payload.verifier.size(); ++index) data[32U + index] = payload.verifier[index];
  write_u32_le(data, 76U, crc32_credential(data, 76U));
  return true;
}

CredentialDecodeResult decode_credential_record(const uint8_t* data, size_t length) {
  CredentialDecodeResult result{false, CredentialDecodeReason::kLength, {}};
  if (data == nullptr || length != kCredentialRecordSize) return result;

  bool empty = true;
  for (size_t index = 0U; index < length; ++index) empty = empty && data[index] == 0xffU;
  if (empty) {
    result.reason = CredentialDecodeReason::kEmpty;
    return result;
  }

  for (size_t index = 0U; index < kCredentialMagic.size(); ++index) {
    if (data[index] != kCredentialMagic[index]) {
      result.reason = CredentialDecodeReason::kMagic;
      return result;
    }
  }
  if (read_u16_le(data, 4U) != kCredentialSchemaVersion) {
    result.reason = CredentialDecodeReason::kSchema;
    return result;
  }

  const auto role = static_cast<ApiRole>(data[6U]);
  if (!valid_role(role)) {
    result.reason = CredentialDecodeReason::kRole;
    return result;
  }
  const auto algorithm = static_cast<CredentialAlgorithm>(data[7U]);
  if (!valid_algorithm(algorithm)) {
    result.reason = CredentialDecodeReason::kAlgorithm;
    return result;
  }
  const uint16_t password_min_length = read_u16_le(data, 12U);
  if (!password_length_allowed(password_min_length)) {
    result.reason = CredentialDecodeReason::kPasswordPolicy;
    return result;
  }
  if (read_u32_le(data, 76U) != crc32_credential(data, 76U)) {
    result.reason = CredentialDecodeReason::kCrc;
    return result;
  }

  result.ok = true;
  result.reason = CredentialDecodeReason::kOk;
  result.payload.role = role;
  result.payload.algorithm = algorithm;
  result.payload.generation = read_u32_le(data, 8U);
  result.payload.password_min_length = password_min_length;
  for (size_t index = 0U; index < result.payload.salt.size(); ++index) {
    result.payload.salt[index] = data[16U + index];
  }
  for (size_t index = 0U; index < result.payload.verifier.size(); ++index) {
    result.payload.verifier[index] = data[32U + index];
  }
  return result;
}

bool verify_credential_material(const CredentialPayload& payload,
                                const uint8_t* candidate_verifier,
                                size_t candidate_length) {
  if (!valid_role(payload.role) || !valid_algorithm(payload.algorithm)) return false;
  if (candidate_length != payload.verifier.size()) return false;
  return constant_time_equal(payload.verifier.data(), candidate_verifier, payload.verifier.size());
}

const char* to_string(CredentialAlgorithm algorithm) {
  switch (algorithm) {
    case CredentialAlgorithm::kExternalMeasuredVerifier: return "EXTERNAL_MEASURED_VERIFIER";
  }
  return "UNKNOWN";
}

const char* to_string(CredentialDecodeReason reason) {
  switch (reason) {
    case CredentialDecodeReason::kOk: return "OK";
    case CredentialDecodeReason::kEmpty: return "EMPTY";
    case CredentialDecodeReason::kLength: return "LENGTH";
    case CredentialDecodeReason::kMagic: return "MAGIC";
    case CredentialDecodeReason::kSchema: return "SCHEMA";
    case CredentialDecodeReason::kRole: return "ROLE";
    case CredentialDecodeReason::kAlgorithm: return "ALGORITHM";
    case CredentialDecodeReason::kPasswordPolicy: return "PASSWORD_POLICY";
    case CredentialDecodeReason::kCrc: return "CRC";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
