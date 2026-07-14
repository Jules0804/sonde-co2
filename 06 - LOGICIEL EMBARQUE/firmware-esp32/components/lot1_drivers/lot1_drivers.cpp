#include "lot1_drivers.hpp"

namespace ventilation {
namespace {

uint16_t read_u16_be(const uint8_t* data) {
  return static_cast<uint16_t>((static_cast<uint16_t>(data[0]) << 8U) | data[1]);
}

}  // namespace

Scd41CommandFrame scd41_command(uint16_t command) {
  return Scd41CommandFrame{
      kScd41Address,
      {static_cast<uint8_t>((command >> 8U) & 0xffU), static_cast<uint8_t>(command & 0xffU)},
  };
}

uint8_t scd41_crc8(const uint8_t* data, size_t length) {
  uint8_t crc = 0xffU;
  for (size_t index = 0U; index < length; ++index) {
    crc ^= data[index];
    for (uint8_t bit = 0U; bit < 8U; ++bit) {
      crc = (crc & 0x80U) != 0U ? static_cast<uint8_t>((crc << 1U) ^ 0x31U)
                                : static_cast<uint8_t>(crc << 1U);
    }
  }
  return crc;
}

bool scd41_word_crc_ok(const uint8_t* data) {
  if (data == nullptr) return false;
  return scd41_crc8(data, 2U) == data[2U];
}

bool scd41_data_ready(const uint8_t* raw_status) {
  if (!scd41_word_crc_ok(raw_status)) return false;
  return (read_u16_be(raw_status) & 0x07ffU) != 0U;
}

Scd41RawMeasurement decode_scd41_measurement(const uint8_t* data, size_t length) {
  Scd41RawMeasurement result{};
  if (data == nullptr || length != 9U) return result;
  const bool crc_ok = scd41_word_crc_ok(data) &&
                      scd41_word_crc_ok(data + 3U) &&
                      scd41_word_crc_ok(data + 6U);
  result.crc_valid = crc_ok;
  if (!crc_ok) return result;

  result.co2_raw = read_u16_be(data);
  const uint16_t temperature_raw = read_u16_be(data + 3U);
  const uint16_t humidity_raw = read_u16_be(data + 6U);
  result.temperature_milli_c =
      static_cast<int32_t>((static_cast<int64_t>(temperature_raw) * 175000LL) / 65535LL - 45000LL);
  result.humidity_milli_percent =
      static_cast<uint32_t>((static_cast<uint64_t>(humidity_raw) * 100000ULL) / 65535ULL);
  return result;
}

I2cWrite dfr0971_configure_0_10v_write() {
  return I2cWrite{kDfr0971DefaultAddress, kDfr0971RangeRegister, {kDfr0971Range10V, 0U, 0U, 0U, 0U, 0U, 0U, 0U}, 1U};
}

I2cWrite dfr0971_output_write(float percent, uint8_t channel) {
  const auto frame = dac_frame_from_percent(percent, channel);
  return I2cWrite{kDfr0971DefaultAddress, frame.reg, frame.bytes, frame.length};
}

}  // namespace ventilation
