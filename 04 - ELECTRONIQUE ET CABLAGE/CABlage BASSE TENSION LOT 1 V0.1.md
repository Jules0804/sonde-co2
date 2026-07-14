# Câblage basse tension du lot 1 v0.1

## Important

Le brochage exact de l'ESP32 doit être vérifié sur la référence possédée avant raccordement. Ce document définit les signaux, pas encore les numéros GPIO.

## Liaisons

```text
ESP32                    SEN0536 SCD41
3V3 ou 5V validé  -----> VCC
GND               -----> GND
GPIO_SDA          -----> SDA
GPIO_SCL          -----> SCL

ESP32                    DFR0971
3V3 ou 5V validé  -----> VCC
GND               -----> GND
GPIO_SDA          -----> SDA
GPIO_SCL          -----> SCL

DFR0971
VOUT0 (+) --------> multimètre V
GND/AGND  --------> multimètre COM
```

## Règles

- couper l'USB avant tout changement ;
- garder SDA/SCL courts ;
- utiliser une masse commune ;
- ne pas connecter la sortie 0–10 V à une entrée ESP32 ;
- ne pas raccorder de moteur pendant ces essais ;
- vérifier les résistances de tirage présentes sur les deux modules ;
- si les deux cartes comportent des pull-ups vers des tensions différentes, corriger avant alimentation.

## Tableau à compléter après identification de l'ESP32

| Signal | GPIO choisi | Broche physique | Remarque |
|---|---:|---|---|
| SDA | À relever | À relever | |
| SCL | À relever | À relever | |
| Bouton service | À relever | À relever | Pull-up interne possible |
| LED état | À relever | À relever | Ne pas utiliser une broche de boot sensible |

