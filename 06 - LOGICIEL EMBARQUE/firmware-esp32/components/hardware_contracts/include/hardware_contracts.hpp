#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

namespace ventilation {

constexpr uint8_t kDfr0971DefaultAddress = 0x58;
constexpr uint8_t kDfr0971RangeRegister = 0x01;
constexpr uint8_t kDfr0971Range10V = 0x11;
constexpr uint8_t kScd41Address = 0x62;

struct DacFrame {
  uint8_t reg;
  std::array<uint8_t, 4> bytes;
  size_t length;
};

uint16_t dac_word_from_percent(float percent);
DacFrame dac_frame_from_percent(float percent, uint8_t channel);

enum class SensorSampleStatus : uint8_t {
  kValid,
  kNotReady,
  kMissing,
  kCrcError,
  kStale,
  kRange,
};

struct Scd41Sample {
  bool communication_ok;
  bool data_ready;
  bool crc_valid;
  float co2_ppm;
  uint32_t age_ms;
};

SensorSampleStatus classify_scd41_sample(const Scd41Sample& sample,
                                         float min_ppm = 350.0F,
                                         float max_ppm = 5000.0F,
                                         uint32_t stale_after_ms = 30000U);

}  // namespace ventilation
