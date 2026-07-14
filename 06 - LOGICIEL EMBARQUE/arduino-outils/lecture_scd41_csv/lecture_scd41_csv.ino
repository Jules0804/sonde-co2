/*
  Lecture SCD41 vers CSV serie - Projet regulation ventilation CO2

  Objectif :
  - lire le SEN0536 / SCD41 apres validation du scan I2C ;
  - produire des lignes CSV compatibles avec MODELE MESURES SCD41 24H.csv ;
  - ne demander aucune bibliotheque capteur externe.

  Moniteur serie :
  - 115200 bauds ;
  - copier les lignes dans mesures_scd41_24h.csv ou un fichier d'essai court.

  Securite banc :
  - aucun moteur ;
  - aucun 24 V ;
  - module alimente en 3,3 V pour le premier essai.
*/

#include <Arduino.h>
#include <Wire.h>

// Banc lot 1 Wemos S2 Mini : SDA GPIO15, SCL GPIO21.
const int SDA_PIN = 15;
const int SCL_PIN = 21;

const uint8_t SCD41_ADDR = 0x62;
const uint16_t CMD_STOP_PERIODIC_MEASUREMENT = 0x3F86;
const uint16_t CMD_START_PERIODIC_MEASUREMENT = 0x21B1;
const uint16_t CMD_READ_MEASUREMENT = 0xEC05;

uint32_t sequenceNumber = 0;
uint32_t rebootCount = 0;
uint32_t lastReadMs = 0;

uint8_t scdCrc(uint8_t msb, uint8_t lsb) {
  uint8_t crc = 0xFF;
  uint8_t data[2] = {msb, lsb};
  for (uint8_t byteIndex = 0; byteIndex < 2; byteIndex++) {
    crc ^= data[byteIndex];
    for (uint8_t bit = 0; bit < 8; bit++) {
      if (crc & 0x80) {
        crc = (crc << 1) ^ 0x31;
      } else {
        crc <<= 1;
      }
    }
  }
  return crc;
}

bool sendCommand(uint16_t command) {
  Wire.beginTransmission(SCD41_ADDR);
  Wire.write(command >> 8);
  Wire.write(command & 0xFF);
  return Wire.endTransmission() == 0;
}

bool readWordWithCrc(const uint8_t *buffer, uint8_t offset, uint16_t &value) {
  const uint8_t msb = buffer[offset];
  const uint8_t lsb = buffer[offset + 1];
  const uint8_t crc = buffer[offset + 2];
  if (scdCrc(msb, lsb) != crc) return false;
  value = (uint16_t(msb) << 8) | lsb;
  return true;
}

bool readMeasurement(uint16_t &co2Ppm, float &temperatureC, float &humidityRh, String &errorCode) {
  if (!sendCommand(CMD_READ_MEASUREMENT)) {
    errorCode = "cmd_read_nack";
    return false;
  }
  delay(1);

  uint8_t buffer[9] = {0};
  const uint8_t requested = Wire.requestFrom(SCD41_ADDR, uint8_t(9));
  if (requested != 9) {
    errorCode = "short_read";
    return false;
  }

  for (uint8_t i = 0; i < 9; i++) {
    buffer[i] = Wire.read();
  }

  uint16_t rawCo2 = 0;
  uint16_t rawTemperature = 0;
  uint16_t rawHumidity = 0;
  if (!readWordWithCrc(buffer, 0, rawCo2)) {
    errorCode = "crc_co2";
    return false;
  }
  if (!readWordWithCrc(buffer, 3, rawTemperature)) {
    errorCode = "crc_temperature";
    return false;
  }
  if (!readWordWithCrc(buffer, 6, rawHumidity)) {
    errorCode = "crc_humidity";
    return false;
  }

  co2Ppm = rawCo2;
  temperatureC = -45.0f + 175.0f * float(rawTemperature) / 65535.0f;
  humidityRh = 100.0f * float(rawHumidity) / 65535.0f;
  errorCode = "";
  return true;
}

void startWire() {
  if (SDA_PIN >= 0 && SCL_PIN >= 0) {
    Wire.begin(SDA_PIN, SCL_PIN);
  } else {
    Wire.begin();
  }
  Wire.setClock(100000);
}

void printCsvHeader() {
  Serial.println("timestamp_iso,uptime_s,sequence,co2_ppm,temperature_c,humidity_rh,data_ready,read_ok,error_code,reboot_count,comment");
}

void printCsvLine(bool readOk, uint16_t co2Ppm, float temperatureC, float humidityRh, const String &errorCode) {
  const float uptimeS = millis() / 1000.0f;
  Serial.print("NA,");
  Serial.print(uptimeS, 3);
  Serial.print(",");
  Serial.print(sequenceNumber++);
  Serial.print(",");
  if (readOk) Serial.print(co2Ppm);
  Serial.print(",");
  if (readOk) Serial.print(temperatureC, 2);
  Serial.print(",");
  if (readOk) Serial.print(humidityRh, 2);
  Serial.print(",");
  Serial.print(readOk ? "1" : "0");
  Serial.print(",");
  Serial.print(readOk ? "1" : "0");
  Serial.print(",");
  Serial.print(errorCode);
  Serial.print(",");
  Serial.print(rebootCount);
  Serial.println(",");
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  startWire();

  // Le stop rend le demarrage plus robuste si le capteur etait deja en mesure periodique.
  sendCommand(CMD_STOP_PERIODIC_MEASUREMENT);
  delay(500);

  printCsvHeader();

  if (!sendCommand(CMD_START_PERIODIC_MEASUREMENT)) {
    printCsvLine(false, 0, 0, 0, "start_periodic_nack");
  }

  delay(5000);
}

void loop() {
  if (millis() - lastReadMs < 5000) return;
  lastReadMs = millis();

  uint16_t co2Ppm = 0;
  float temperatureC = 0;
  float humidityRh = 0;
  String errorCode;
  const bool ok = readMeasurement(co2Ppm, temperatureC, humidityRh, errorCode);
  printCsvLine(ok, co2Ppm, temperatureC, humidityRh, errorCode);
}
