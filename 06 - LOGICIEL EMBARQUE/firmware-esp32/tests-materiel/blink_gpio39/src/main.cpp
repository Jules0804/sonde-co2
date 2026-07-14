#include <Arduino.h>

constexpr uint8_t kLedPin = 39;
constexpr uint32_t kStateDelayMs = 10000;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("Test Wemos S2 Mini - GPIO39 10s ON / 10s OFF");
  pinMode(kLedPin, OUTPUT);
  digitalWrite(kLedPin, LOW);
}

void loop() {
  digitalWrite(kLedPin, HIGH);
  Serial.println("GPIO39 = HIGH pendant 10 s");
  delay(kStateDelayMs);

  digitalWrite(kLedPin, LOW);
  Serial.println("GPIO39 = LOW pendant 10 s");
  delay(kStateDelayMs);
}
