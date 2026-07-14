#include <Arduino.h>
#include <Wire.h>

constexpr int kSdaPin = 15;
constexpr int kSclPin = 21;
constexpr uint8_t kDfr0971Address = 0x5F;
constexpr uint8_t kScd41Address = 0x62;

bool probe(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

void printAddress(uint8_t address) {
  Serial.print("0x");
  if (address < 16) {
    Serial.print("0");
  }
  Serial.print(address, HEX);
  if (address == kDfr0971Address) {
    Serial.print(" <- DAC DFR0971 attendu");
  }
  if (address == kScd41Address) {
    Serial.print(" <- Sonde CO2 SEN0536/SCD41 attendue");
  }
  Serial.println();
}

void scanI2c() {
  bool foundDac = false;
  bool foundScd41 = false;
  int count = 0;

  Serial.println();
  Serial.println("Scan I2C lot 1 sur Wemos S2 Mini");
  Serial.println("SDA=GPIO15, SCL=GPIO21, alimentation modules en 3V3");

  for (uint8_t address = 0x03; address <= 0x77; ++address) {
    if (probe(address)) {
      printAddress(address);
      foundDac = foundDac || address == kDfr0971Address;
      foundScd41 = foundScd41 || address == kScd41Address;
      ++count;
      delay(5);
    }
  }

  Serial.print("Nombre adresse(s) trouvee(s): ");
  Serial.println(count);
  Serial.print("DFR0971 0x5F: ");
  Serial.println(foundDac ? "OK" : "ABSENT");
  Serial.print("SEN0536/SCD41 0x62: ");
  Serial.println(foundScd41 ? "OK" : "ABSENT");

  if (!foundDac || !foundScd41) {
    Serial.println("Si un module est absent: verifier GND commun, 3V3, SDA->D/SDA, SCL->C/SCL et switchs adresse DAC.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(2000);
  Serial.println("Projet ventilation CO2 - test scan I2C lot 1");
  Wire.begin(kSdaPin, kSclPin);
  Wire.setClock(100000);
}

void loop() {
  scanI2c();
  delay(3000);
}
