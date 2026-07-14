/*
  Test DFR0971 / GP8403 vers CSV - Projet regulation ventilation CO2

  Objectif :
  - configurer le DFR0971 en plage 0-10 V ;
  - commander CH0 puis CH1 a 0, 20, 50, 80 et 100 % ;
  - imprimer un CSV compatible avec MODELE MESURES DAC.csv ;
  - laisser l'operateur remplir measured_v au multimetre.

  Securite banc :
  - aucun moteur ;
  - aucun 24 V ;
  - VOUT0/VOUT1 uniquement vers point de mesure multimetre ;
  - ne jamais relier VOUT0/VOUT1 a l'ESP32.
*/

#include <Arduino.h>
#include <Wire.h>

// Banc lot 1 Wemos S2 Mini : SDA GPIO15, SCL GPIO21.
const int SDA_PIN = 15;
const int SCL_PIN = 21;

const uint8_t DFR0971_ADDR = 0x5F;
const uint8_t REG_RANGE = 0x01;
const uint8_t RANGE_10V = 0x11;
const uint8_t REG_CH0 = 0x02;
const uint8_t REG_CH1 = 0x04;

const uint8_t COMMANDS_PERCENT[] = {0, 20, 50, 80, 100};
const uint8_t REPETITIONS = 3;
const uint32_t SETTLE_MS = 2500;

void startWire() {
  if (SDA_PIN >= 0 && SCL_PIN >= 0) {
    Wire.begin(SDA_PIN, SCL_PIN);
  } else {
    Wire.begin();
  }
  Wire.setClock(100000);
}

bool writeRegister(uint8_t reg, uint8_t value) {
  Wire.beginTransmission(DFR0971_ADDR);
  Wire.write(reg);
  Wire.write(value);
  return Wire.endTransmission() == 0;
}

bool writeDacChannel(uint8_t channel, uint8_t percent) {
  if (percent > 100) percent = 100;
  const uint16_t code12 = uint16_t((uint32_t(percent) * 4095UL) / 100UL);
  const uint16_t shifted = code12 << 4;
  const uint8_t low = shifted & 0xFF;
  const uint8_t high = (shifted >> 8) & 0xFF;
  const uint8_t reg = channel == 0 ? REG_CH0 : REG_CH1;

  Wire.beginTransmission(DFR0971_ADDR);
  Wire.write(reg);
  Wire.write(low);
  Wire.write(high);
  return Wire.endTransmission() == 0;
}

void printCsvHeader() {
  Serial.println("timestamp_iso,channel,command_percent,target_v,measured_v,absolute_error_v,relative_error_percent,repetition,test_condition,firmware_version,multimeter,comment");
}

void printCsvCommand(uint8_t channel, uint8_t percent, uint8_t repetition, const char *condition, const char *comment) {
  Serial.print("NA,");
  Serial.print(channel);
  Serial.print(",");
  Serial.print(percent);
  Serial.print(",");
  Serial.print(float(percent) / 10.0f, 2);
  Serial.print(",,,,");
  Serial.print(repetition);
  Serial.print(",");
  Serial.print(condition);
  Serial.print(",test_dfr0971_csv_v0.1,,");
  Serial.println(comment);
}

void setup() {
  Serial.begin(115200);
  delay(1500);
  startWire();

  printCsvHeader();

  if (!writeRegister(REG_RANGE, RANGE_10V)) {
    printCsvCommand(0, 100, 0, "init", "ERREUR: DFR0971 absent ou plage 10V refusee");
    return;
  }

  // Etat de depart volontairement ouvert/haut avant la sequence.
  writeDacChannel(0, 100);
  writeDacChannel(1, 100);
  delay(SETTLE_MS);
  printCsvCommand(0, 100, 0, "startup_safe", "depart force 10V CH0");
  printCsvCommand(1, 100, 0, "startup_safe", "depart force 10V CH1");

  for (uint8_t repetition = 1; repetition <= REPETITIONS; repetition++) {
    for (uint8_t channel = 0; channel <= 1; channel++) {
      for (uint8_t i = 0; i < sizeof(COMMANDS_PERCENT); i++) {
        const uint8_t percent = COMMANDS_PERCENT[i];
        const bool ok = writeDacChannel(channel, percent);
        delay(SETTLE_MS);
        printCsvCommand(channel, percent, repetition, "no_load", ok ? "mesurer au multimetre" : "ERREUR: ecriture I2C");
      }
    }
  }

  // Fin en 10 V pour rester dans la convention de repli ouverte avant moteur.
  writeDacChannel(0, 100);
  writeDacChannel(1, 100);
  delay(SETTLE_MS);
  printCsvCommand(0, 100, 99, "end_safe", "fin forcee 10V CH0");
  printCsvCommand(1, 100, 99, "end_safe", "fin forcee 10V CH1");
}

void loop() {
  delay(1000);
}
