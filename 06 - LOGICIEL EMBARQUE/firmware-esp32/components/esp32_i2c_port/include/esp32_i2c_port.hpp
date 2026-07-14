#pragma once

#include <cstddef>
#include <cstdint>

#include "lot1_drivers.hpp"

namespace ventilation {

constexpr int kUnassignedGpio = -1;
constexpr uint32_t kLot1I2cClockHz = 100000U;
constexpr uint32_t kLot1I2cTimeoutMs = 100U;

struct Esp32I2cPins {
  int sda_gpio{kUnassignedGpio};
  int scl_gpio{kUnassignedGpio};
};

enum class I2cPortStatus : uint8_t {
  kOk,
  kPinsNotAssigned,
  kInstallFailed,
  kWriteFailed,
  kReadFailed,
};

class Esp32I2cPort {
 public:
  explicit Esp32I2cPort(Esp32I2cPins pins) : pins_(pins) {}

  I2cPortStatus init();
  I2cPortStatus write(const I2cWrite& command);
  I2cPortStatus write_read(uint8_t address,
                           const uint8_t* write_data,
                           size_t write_length,
                           uint8_t* read_data,
                           size_t read_length);
  bool initialized() const { return initialized_; }
  Esp32I2cPins pins() const { return pins_; }

 private:
  bool pins_assigned() const;

  Esp32I2cPins pins_;
  bool initialized_{false};
};

const char* to_string(I2cPortStatus status);

}  // namespace ventilation
