/*
  Scanner I2C lot 1 - Projet regulation ventilation CO2

  Materiel vise :
  - Wemos S2 Mini v1.0.0
  - SEN0536 / SCD41 attendu a l'adresse 0x62
  - DFR0971 / DAC 0-10 V detecte sur le banc a l'adresse 0x5F

  Usage :
  1. Ne raccorder aucun 24 V et aucun moteur.
  2. Alimenter les modules en 3,3 V pour le premier essai.
  3. Lancer ce sketch carte seule, puis avec SCD41 seul, DAC seul, puis les deux.
  4. Ouvrir le moniteur serie a 115200 bauds.
*/

#include <Arduino.h>
#include <Wire.h>

// Banc lot 1 Wemos S2 Mini : SDA GPIO15, SCL GPIO21.
const int SDA_PIN = 15;
const int SCL_PIN = 21;

const uint8_t ADDR_DFR0971 = 0x5F;
const uint8_t ADDR_SCD41 = 0x62;

void startWire() {
  if (SDA_PIN >= 0 && SCL_PIN >= 0) {
    Wire.begin(SDA_PIN, SCL_PIN);
  } else {
    Wire.begin();
  }
  Wire.setClock(100000);
}

bool probeAddress(uint8_t address) {
  Wire.beginTransmission(address);
  return Wire.endTransmission() == 0;
}

void printAddress(uint8_t address) {
  Serial.print("0x");
  if (address < 16) Serial.print("0");
  Serial.print(address, HEX);
  if (address == ADDR_DFR0971) Serial.print("  <- DFR0971 attendu");
  if (address == ADDR_SCD41) Serial.print("  <- SEN0536/SCD41 attendu");
  Serial.println();
}

void scanI2C() {
  bool foundDac = false;
  bool foundScd41 = false;
  int count = 0;

  Serial.println();
  Serial.println("Scan I2C lot 1...");

  for (uint8_t address = 0x03; address <= 0x77; address++) {
    if (probeAddress(address)) {
      printAddress(address);
      count++;
      if (address == ADDR_DFR0971) foundDac = true;
      if (address == ADDR_SCD41) foundScd41 = true;
      delay(5);
    }
  }

  Serial.print("Nombre adresse(s) trouvee(s) : ");
  Serial.println(count);
  Serial.print("DFR0971 0x5F : ");
  Serial.println(foundDac ? "OK" : "ABSENT");
  Serial.print("SEN0536/SCD41 0x62 : ");
  Serial.println(foundScd41 ? "OK" : "ABSENT");

  if (count == 0) {
    Serial.println("Aucun module detecte : verifier GND, 3V3, SDA, SCL, broches I2C et alimentation.");
  }
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  Serial.println("Projet ventilation CO2 - scanner I2C lot 1");
  Serial.println("Aucun moteur, aucun 24 V, sorties 0-10 V non raccordees a l'ESP32.");
  startWire();
}

void loop() {
  scanI2C();
  delay(3000);
}
