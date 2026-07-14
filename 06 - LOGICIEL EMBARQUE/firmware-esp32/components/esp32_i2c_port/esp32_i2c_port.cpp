#include "esp32_i2c_port.hpp"

#if __has_include("driver/i2c.h")
#include "driver/i2c.h"
#define VENTILATION_HAS_LEGACY_I2C 1
#else
#define VENTILATION_HAS_LEGACY_I2C 0
#endif

namespace ventilation {
namespace {

constexpr int kLot1I2cPort = 0;

#if VENTILATION_HAS_LEGACY_I2C
constexpr i2c_port_t kIdfI2cPort = static_cast<i2c_port_t>(kLot1I2cPort);
#endif

}  // namespace

bool Esp32I2cPort::pins_assigned() const {
  return pins_.sda_gpio >= 0 && pins_.scl_gpio >= 0 && pins_.sda_gpio != pins_.scl_gpio;
}

I2cPortStatus Esp32I2cPort::init() {
  if (!pins_assigned()) return I2cPortStatus::kPinsNotAssigned;

#if VENTILATION_HAS_LEGACY_I2C
  i2c_config_t config{};
  config.mode = I2C_MODE_MASTER;
  config.sda_io_num = static_cast<gpio_num_t>(pins_.sda_gpio);
  config.scl_io_num = static_cast<gpio_num_t>(pins_.scl_gpio);
  config.sda_pullup_en = GPIO_PULLUP_ENABLE;
  config.scl_pullup_en = GPIO_PULLUP_ENABLE;
  config.master.clk_speed = kLot1I2cClockHz;

  if (i2c_param_config(kIdfI2cPort, &config) != ESP_OK) return I2cPortStatus::kInstallFailed;
  if (i2c_driver_install(kIdfI2cPort, I2C_MODE_MASTER, 0, 0, 0) != ESP_OK) {
    return I2cPortStatus::kInstallFailed;
  }
  initialized_ = true;
  return I2cPortStatus::kOk;
#else
  return I2cPortStatus::kInstallFailed;
#endif
}

I2cPortStatus Esp32I2cPort::write(const I2cWrite& command) {
  if (!pins_assigned()) return I2cPortStatus::kPinsNotAssigned;
  if (!initialized_) return I2cPortStatus::kInstallFailed;
  if (command.length == 0U) return I2cPortStatus::kWriteFailed;

#if VENTILATION_HAS_LEGACY_I2C
  uint8_t buffer[9]{};
  buffer[0] = command.reg;
  for (size_t index = 0U; index < command.length && index < command.bytes.size(); ++index) {
    buffer[index + 1U] = command.bytes[index];
  }
  const auto timeout_ticks = pdMS_TO_TICKS(kLot1I2cTimeoutMs);
  const esp_err_t result = i2c_master_write_to_device(
      kIdfI2cPort, command.address, buffer, command.length + 1U, timeout_ticks);
  return result == ESP_OK ? I2cPortStatus::kOk : I2cPortStatus::kWriteFailed;
#else
  return I2cPortStatus::kWriteFailed;
#endif
}

I2cPortStatus Esp32I2cPort::write_read(uint8_t address,
                                       const uint8_t* write_data,
                                       size_t write_length,
                                       uint8_t* read_data,
                                       size_t read_length) {
  if (!pins_assigned()) return I2cPortStatus::kPinsNotAssigned;
  if (!initialized_) return I2cPortStatus::kInstallFailed;
  if (write_data == nullptr || read_data == nullptr || write_length == 0U || read_length == 0U) {
    return I2cPortStatus::kReadFailed;
  }

#if VENTILATION_HAS_LEGACY_I2C
  const auto timeout_ticks = pdMS_TO_TICKS(kLot1I2cTimeoutMs);
  const esp_err_t result = i2c_master_write_read_device(
      kIdfI2cPort, address, write_data, write_length, read_data, read_length, timeout_ticks);
  return result == ESP_OK ? I2cPortStatus::kOk : I2cPortStatus::kReadFailed;
#else
  return I2cPortStatus::kReadFailed;
#endif
}

const char* to_string(I2cPortStatus status) {
  switch (status) {
    case I2cPortStatus::kOk: return "OK";
    case I2cPortStatus::kPinsNotAssigned: return "PINS_NOT_ASSIGNED";
    case I2cPortStatus::kInstallFailed: return "INSTALL_FAILED";
    case I2cPortStatus::kWriteFailed: return "WRITE_FAILED";
    case I2cPortStatus::kReadFailed: return "READ_FAILED";
  }
  return "UNKNOWN";
}

}  // namespace ventilation
