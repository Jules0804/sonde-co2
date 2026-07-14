#pragma once

#include <array>
#include <cstddef>
#include <cstdint>

#include "hardware_contracts.hpp"

namespace ventilation {

constexpr uint16_t kScd41CmdStartPeriodicMeasurement = 0x21b1U;
constexpr uint16_t kScd41CmdStopPeriodicMeasurement = 0x3f86U;
constexpr uint16_t kScd41CmdGetDataReadyStatus = 0xe4b8U;
constexpr uint16_t kScd41CmdReadMeasurement = 0xec05U;
constexpr uint16_t kScd41CmdReinit = 0x3646U;
constexpr uint32_t kScd41StartUpDelayMs = 5000U;
constexpr uint32_t kScd41StopDelayMs = 500U;
constexpr uint32_t kScd41ReadIntervalMs = 5000U;

struct I2cWrite {
  uint8_t address;
  uint8_t reg;
  std::array<uint8_t, 8> bytes;
  size_t length;
};

struct Scd41CommandFrame {
  uint8_t address;
  std::array<uint8_t, 2> bytes;
};

struct Scd41RawMeasurement {
  uint16_t co2_raw{0U};
  int32_t temperature_milli_c{0};
  uint32_t humidity_milli_percent{0U};
  bool crc_valid{false};
};

Scd41CommandFrame scd41_command(uint16_t command);
uint8_t scd41_crc8(const uint8_t* data, size_t length);
bool scd41_word_crc_ok(const uint8_t* data);
bool scd41_data_ready(const uint8_t* raw_status);
Scd41RawMeasurement decode_scd41_measurement(const uint8_t* data, size_t length);

I2cWrite dfr0971_configure_0_10v_write();
I2cWrite dfr0971_output_write(float percent, uint8_t channel = 2U);

}  // namespace ventilation
