#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

#include "http_api_contract.hpp"
#include "local_auth.hpp"

namespace ventilation {

constexpr uint16_t kCredentialSchemaVersion = 1U;
constexpr size_t kCredentialRecordSize = 80U;
constexpr size_t kCredentialSaltBytes = 16U;
constexpr size_t kCredentialVerifierBytes = 32U;
constexpr std::array<uint8_t, 4> kCredentialMagic{{0x41U, 0x55U, 0x54U, 0x48U}};  // "AUTH"

enum class CredentialAlgorithm : uint8_t {
  kExternalMeasuredVerifier = 1U,
};

enum class CredentialDecodeReason : uint8_t {
  kOk,
  kEmpty,
  kLength,
  kMagic,
  kSchema,
  kRole,
  kAlgorithm,
  kPasswordPolicy,
  kCrc,
};

struct CredentialRecord {
  std::array<uint8_t, kCredentialRecordSize> bytes{};
};

struct CredentialPayload {
  ApiRole role{ApiRole::kPublic};
  CredentialAlgorithm algorithm{CredentialAlgorithm::kExternalMeasuredVerifier};
  uint32_t generation{0U};
  std::array<uint8_t, kCredentialSaltBytes> salt{};
  std::array<uint8_t, kCredentialVerifierBytes> verifier{};
  uint16_t password_min_length{kPasswordMinLength};
};

struct CredentialDecodeResult {
  bool ok;
  CredentialDecodeReason reason;
  CredentialPayload payload;
};

bool password_length_allowed(size_t length);
uint32_t crc32_credential(const uint8_t* data, size_t length);
bool encode_credential_record(const CredentialPayload& payload, CredentialRecord& output);
CredentialDecodeResult decode_credential_record(const uint8_t* data, size_t length);
bool verify_credential_material(const CredentialPayload& payload,
                                const uint8_t* candidate_verifier,
                                size_t candidate_length);

const char* to_string(CredentialAlgorithm algorithm);
const char* to_string(CredentialDecodeReason reason);

}  // namespace ventilation
