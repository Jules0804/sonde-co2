#include "config_store.hpp"

#include <algorithm>
#include <cmath>
#include <cstring>

namespace ventilation {
namespace {

uint16_t read_u16_le(const uint8_t* data, size_t offset) {
  return static_cast<uint16_t>(data[offset] | (static_cast<uint16_t>(data[offset + 1U]) << 8U));
}

uint32_t read_u32_le(const uint8_t* data, size_t offset) {
  return static_cast<uint32_t>(data[offset]) |
         (static_cast<uint32_t>(data[offset + 1U]) << 8U) |
         (static_cast<uint32_t>(data[offset + 2U]) << 16U) |
         (static_cast<uint32_t>(data[offset + 3U]) << 24U);
}

void write_u16_le(std::array<uint8_t, kConfigRecordSize>& data, size_t offset, uint16_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
}

void write_u32_le(std::array<uint8_t, kConfigRecordSize>& data, size_t offset, uint32_t value) {
  data[offset] = static_cast<uint8_t>(value & 0xffU);
  data[offset + 1U] = static_cast<uint8_t>((value >> 8U) & 0xffU);
  data[offset + 2U] = static_cast<uint8_t>((value >> 16U) & 0xffU);
  data[offset + 3U] = static_cast<uint8_t>((value >> 24U) & 0xffU);
}

bool tenth_in_range(float value, float min, float max) {
  if (!std::isfinite(value) || value < min || value > max) return false;
  return std::fabs(value * 10.0F - std::round(value * 10.0F)) < 0.0001F;
}

bool same_config(const PersistentConfig& left, const PersistentConfig& right) {
  return left.target_ppm == right.target_ppm &&
         std::fabs(left.min_output_pct - right.min_output_pct) < 0.0001F &&
         std::fabs(left.max_output_pct - right.max_output_pct) < 0.0001F &&
         left.high_alarm_ppm == right.high_alarm_ppm &&
         left.alarm_delay_s == right.alarm_delay_s &&
         left.test_duration_s == right.test_duration_s &&
         left.history_period_s == right.history_period_s;
}

ConfigDecodeResult decode_empty(ConfigDecodeReason reason) {
  return {false, reason, 0U, factory_config()};
}

ConfigLoadResult load_from_single_valid(const ConfigDecodeResult& selected,
                                        const ConfigDecodeResult& a,
                                        const ConfigDecodeResult& b) {
  const bool from_a = a.ok;
  return {
      selected.config,
      selected.generation,
      from_a ? ConfigSource::kSlotA : ConfigSource::kSlotB,
      ConfigLoadStatus::kBackupDegraded,
      true,
      a,
      b,
  };
}

}  // namespace

PersistentConfig factory_config() {
  return {};
}

bool validate_persistent_config(const PersistentConfig& config) {
  if (config.target_ppm < 800U || config.target_ppm > 1400U) return false;
  if (!tenth_in_range(config.min_output_pct, 0.0F, 80.0F)) return false;
  if (!tenth_in_range(config.max_output_pct, 50.0F, 100.0F)) return false;
  if (config.min_output_pct > config.max_output_pct) return false;
  if (config.high_alarm_ppm < 1200U || config.high_alarm_ppm > 2500U) return false;
  if (config.high_alarm_ppm <= config.target_ppm) return false;
  if (config.alarm_delay_s < 10U || config.alarm_delay_s > 600U) return false;
  if (config.test_duration_s < 30U || config.test_duration_s > 600U) return false;
  if (config.history_period_s < 10U || config.history_period_s > 300U) return false;
  return true;
}

uint32_t crc32_config(const uint8_t* data, size_t length) {
  uint32_t crc = 0xffffffffU;
  for (size_t index = 0; index < length; ++index) {
    crc ^= data[index];
    for (uint8_t bit = 0U; bit < 8U; ++bit) {
      crc = (crc & 1U) ? (0xedb88320U ^ (crc >> 1U)) : (crc >> 1U);
    }
  }
  return crc ^ 0xffffffffU;
}

bool encode_config_record(const PersistentConfig& config, uint32_t generation, ConfigRecord& output) {
  if (!validate_persistent_config(config)) return false;
  output.bytes.fill(0U);
  std::copy(kConfigMagic.begin(), kConfigMagic.end(), output.bytes.begin());
  write_u16_le(output.bytes, 4U, kConfigSchemaVersion);
  write_u16_le(output.bytes, 6U, static_cast<uint16_t>(kConfigPayloadSize));
  write_u32_le(output.bytes, 8U, generation);
  write_u16_le(output.bytes, 12U, config.target_ppm);
  write_u16_le(output.bytes, 14U, static_cast<uint16_t>(std::lround(config.min_output_pct * 10.0F)));
  write_u16_le(output.bytes, 16U, static_cast<uint16_t>(std::lround(config.max_output_pct * 10.0F)));
  write_u16_le(output.bytes, 18U, config.high_alarm_ppm);
  write_u16_le(output.bytes, 20U, config.alarm_delay_s);
  write_u16_le(output.bytes, 22U, config.test_duration_s);
  write_u16_le(output.bytes, 24U, config.history_period_s);
  write_u16_le(output.bytes, 26U, 0U);
  write_u32_le(output.bytes, 28U, crc32_config(output.bytes.data(), 28U));
  return true;
}

ConfigDecodeResult decode_config_record(const uint8_t* data, size_t length) {
  if (data == nullptr) return decode_empty(ConfigDecodeReason::kEmpty);
  if (length != kConfigRecordSize) return decode_empty(ConfigDecodeReason::kLength);
  if (!std::equal(kConfigMagic.begin(), kConfigMagic.end(), data)) return decode_empty(ConfigDecodeReason::kMagic);
  if (read_u16_le(data, 4U) != kConfigSchemaVersion) return decode_empty(ConfigDecodeReason::kSchema);
  if (read_u16_le(data, 6U) != kConfigPayloadSize) return decode_empty(ConfigDecodeReason::kPayloadLength);
  if (read_u16_le(data, 26U) != 0U) return decode_empty(ConfigDecodeReason::kFlags);
  if (read_u32_le(data, 28U) != crc32_config(data, 28U)) return decode_empty(ConfigDecodeReason::kCrc);

  PersistentConfig config{
      read_u16_le(data, 12U),
      static_cast<float>(read_u16_le(data, 14U)) / 10.0F,
      static_cast<float>(read_u16_le(data, 16U)) / 10.0F,
      read_u16_le(data, 18U),
      read_u16_le(data, 20U),
      read_u16_le(data, 22U),
      read_u16_le(data, 24U),
  };
  if (!validate_persistent_config(config)) return decode_empty(ConfigDecodeReason::kBounds);
  return {true, ConfigDecodeReason::kOk, read_u32_le(data, 8U), config};
}

bool is_newer_generation(uint32_t candidate, uint32_t reference) {
  const uint32_t difference = candidate - reference;
  return difference != 0U && difference < 0x80000000U;
}

ConfigLoadResult load_config_slots(const uint8_t* slot_a, size_t slot_a_length,
                                   const uint8_t* slot_b, size_t slot_b_length) {
  const ConfigDecodeResult a = decode_config_record(slot_a, slot_a_length);
  const ConfigDecodeResult b = decode_config_record(slot_b, slot_b_length);

  if (!a.ok && !b.ok) {
    const bool virgin = a.reason == ConfigDecodeReason::kEmpty && b.reason == ConfigDecodeReason::kEmpty;
    return {factory_config(), 0U, ConfigSource::kFactory,
            virgin ? ConfigLoadStatus::kFactoryDefaults : ConfigLoadStatus::kConfigCorrupt,
            virgin, a, b};
  }

  if (a.ok && b.ok) {
    if (a.generation == b.generation) {
      if (!same_config(a.config, b.config)) {
        return {factory_config(), a.generation, ConfigSource::kFactory,
                ConfigLoadStatus::kGenerationConflict, false, a, b};
      }
      return {a.config, a.generation, ConfigSource::kSlotA, ConfigLoadStatus::kRedundant, true, a, b};
    }
    const bool a_newer = is_newer_generation(a.generation, b.generation);
    const bool b_newer = is_newer_generation(b.generation, a.generation);
    if (a_newer == b_newer) {
      return {factory_config(), 0U, ConfigSource::kFactory,
              ConfigLoadStatus::kGenerationAmbiguous, false, a, b};
    }
    const ConfigDecodeResult& selected = a_newer ? a : b;
    return {selected.config, selected.generation, a_newer ? ConfigSource::kSlotA : ConfigSource::kSlotB,
            ConfigLoadStatus::kOk, true, a, b};
  }

  return load_from_single_valid(a.ok ? a : b, a, b);
}

const char* to_string(ConfigDecodeReason reason) {
  switch (reason) {
    case ConfigDecodeReason::kOk: return "OK";
    case ConfigDecodeReason::kEmpty: return "EMPTY";
    case ConfigDecodeReason::kLength: return "LENGTH";
    case ConfigDecodeReason::kMagic: return "MAGIC";
    case ConfigDecodeReason::kSchema: return "SCHEMA";
    case ConfigDecodeReason::kPayloadLength: return "PAYLOAD_LENGTH";
    case ConfigDecodeReason::kFlags: return "FLAGS";
    case ConfigDecodeReason::kCrc: return "CRC";
    case ConfigDecodeReason::kBounds: return "BOUNDS";
  }
  return "UNKNOWN";
}

const char* to_string(ConfigSource source) {
  switch (source) {
    case ConfigSource::kFactory: return "FACTORY";
    case ConfigSource::kSlotA: return "A";
    case ConfigSource::kSlotB: return "B";
  }
  return "UNKNOWN";
}

const char* to_string(ConfigLoadStatus status) {
  switch (status) {
    case ConfigLoadStatus::kOk: return "OK";
    case ConfigLoadStatus::kFactoryDefaults: return "FACTORY_DEFAULTS";
    case ConfigLoadStatus::kConfigCorrupt: return "CONFIG_CORRUPT";
    case ConfigLoadStatus::kBackupDegraded: return "BACKUP_DEGRADED";
    case ConfigLoadStatus::kRedundant: return "REDUNDANT";
    case ConfigLoadStatus::kGenerationConflict: return "GENERATION_CONFLICT";
    case ConfigLoadStatus::kGenerationAmbiguous: return "GENERATION_AMBIGUOUS";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
