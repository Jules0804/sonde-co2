#include "hardware_contracts.hpp"

#include <algorithm>
#include <cmath>

namespace ventilation {

uint16_t dac_word_from_percent(float percent) {
  const float bounded = std::clamp(percent, 0.0F, 100.0F);
  const float millivolts = bounded * 100.0F;
  const auto code12 = static_cast<uint16_t>((millivolts / 10000.0F) * 4095.0F);
  return static_cast<uint16_t>(code12 << 4U);
}

DacFrame dac_frame_from_percent(float percent, uint8_t channel) {
  const uint16_t word = dac_word_from_percent(percent);
  const uint8_t low = static_cast<uint8_t>(word & 0xffU);
  const uint8_t high = static_cast<uint8_t>((word >> 8U) & 0xffU);
  if (channel == 0U) return {0x02U, {low, high, 0U, 0U}, 2U};
  if (channel == 1U) return {0x04U, {low, high, 0U, 0U}, 2U};
  if (channel == 2U) return {0x02U, {low, high, low, high}, 4U};
  return {0x00U, {0U, 0U, 0U, 0U}, 0U};
}

SensorSampleStatus classify_scd41_sample(const Scd41Sample& sample,
                                         float min_ppm,
                                         float max_ppm,
                                         uint32_t stale_after_ms) {
  if (!sample.communication_ok) return SensorSampleStatus::kMissing;
  if (!sample.data_ready) {
    return sample.age_ms >= stale_after_ms ? SensorSampleStatus::kStale : SensorSampleStatus::kNotReady;
  }
  if (!sample.crc_valid) return SensorSampleStatus::kCrcError;
  if (!std::isfinite(sample.co2_ppm) || sample.co2_ppm < min_ppm || sample.co2_ppm > max_ppm) {
    return SensorSampleStatus::kRange;
  }
  if (sample.age_ms >= stale_after_ms) return SensorSampleStatus::kStale;
  return SensorSampleStatus::kValid;
}

}  // namespace ventilation
