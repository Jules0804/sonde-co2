#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

namespace ventilation {

constexpr uint16_t kConfigSchemaVersion = 1U;
constexpr size_t kConfigRecordSize = 32U;
constexpr size_t kConfigPayloadSize = 20U;
constexpr std::array<uint8_t, 4> kConfigMagic{{0x56U, 0x43U, 0x4fU, 0x32U}};  // "VCO2"

struct PersistentConfig {
  uint16_t target_ppm{1000U};
  float min_output_pct{20.0F};
  float max_output_pct{100.0F};
  uint16_t high_alarm_ppm{1500U};
  uint16_t alarm_delay_s{60U};
  uint16_t test_duration_s{600U};
  uint16_t history_period_s{60U};
};

struct ConfigRecord {
  std::array<uint8_t, kConfigRecordSize> bytes{};
};

enum class ConfigDecodeReason : uint8_t {
  kOk,
  kEmpty,
  kLength,
  kMagic,
  kSchema,
  kPayloadLength,
  kFlags,
  kCrc,
  kBounds,
};

struct ConfigDecodeResult {
  bool ok;
  ConfigDecodeReason reason;
  uint32_t generation;
  PersistentConfig config;
};

enum class ConfigSource : uint8_t {
  kFactory,
  kSlotA,
  kSlotB,
};

enum class ConfigLoadStatus : uint8_t {
  kOk,
  kFactoryDefaults,
  kConfigCorrupt,
  kBackupDegraded,
  kRedundant,
  kGenerationConflict,
  kGenerationAmbiguous,
};

struct ConfigLoadResult {
  PersistentConfig config;
  uint32_t generation;
  ConfigSource source;
  ConfigLoadStatus status;
  bool safe_to_auto;
  ConfigDecodeResult slot_a;
  ConfigDecodeResult slot_b;
};

PersistentConfig factory_config();
bool validate_persistent_config(const PersistentConfig& config);
uint32_t crc32_config(const uint8_t* data, size_t length);
bool encode_config_record(const PersistentConfig& config, uint32_t generation, ConfigRecord& output);
ConfigDecodeResult decode_config_record(const uint8_t* data, size_t length);
bool is_newer_generation(uint32_t candidate, uint32_t reference);
ConfigLoadResult load_config_slots(const uint8_t* slot_a, size_t slot_a_length,
                                   const uint8_t* slot_b, size_t slot_b_length);

const char* to_string(ConfigDecodeReason reason);
const char* to_string(ConfigSource source);
const char* to_string(ConfigLoadStatus status);

}  // namespace ventilation
