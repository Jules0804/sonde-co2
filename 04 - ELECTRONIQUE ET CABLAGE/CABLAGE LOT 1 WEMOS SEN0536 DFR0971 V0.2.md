# Câblage lot 1 — Wemos S2 Mini + SEN0536 + DFR0971 v0.2

Objectif : brancher la sonde CO₂ `DFRobot SEN0536 / SCD41` et le module DAC `DFRobot DFR0971 / GP8403 0-10 V` sur la Wemos S2 Mini.

Ce document accompagne le schéma atelier :

- `SCHEMA CABLAGE ATELIER LOT 1 V0.3.svg`
- `SCHEMA CABLAGE ATELIER LOT 1 V0.3.drawio`

## 1. Adressage I²C attendu

| Module | Adresse attendue | Remarque |
|---|---:|---|
| SEN0536 / SCD41 CO₂ | `0x62` | Adresse fixe du capteur SCD41 |
| DFR0971 / GP8403 DAC 0-10 V | `0x5F` | Adresse réellement mesurée sur le banc, switchs conservés dans cette position |

Les deux modules peuvent être branchés sur le même bus I²C car leurs adresses sont différentes.

## 2. Broches Wemos retenues pour le banc

Vue dessus, USB en bas, comme sur la documentation officielle Wemos.

| Fonction | Broche Wemos S2 Mini | Repère physique |
|---|---:|---|
| 3V3 | `3V3` | colonne extérieure gauche, dernière ligne |
| GND | `GND` | colonne intérieure droite, avant-dernière ligne |
| SDA | `GPIO15` | colonne intérieure droite, dernière ligne |
| SCL | `GPIO21` | colonne intérieure droite, ligne `21/18` |

Important : pour ce premier essai, alimenter les modules en `3V3`, pas en `VBUS/5V`.

## 3. Câblage de la sonde CO₂ SEN0536

Sur le SEN0536, suivre la sérigraphie imprimée sur la carte.

| Wemos S2 Mini | SEN0536 / SCD41 |
|---|---|
| `3V3` | `VCC` |
| `GND` | `GND` |
| `GPIO15 / SDA` | `SDA` |
| `GPIO21 / SCL` | `SCL` |

## 4. Câblage du DAC DFR0971

Sur le DFR0971, le connecteur blanc Gravity est repéré `+`, `-`, `C`, `D`.

| Wemos S2 Mini | DFR0971 / GP8403 |
|---|---|
| `3V3` | `+` |
| `GND` | `-` |
| `GPIO15 / SDA` | `D` |
| `GPIO21 / SCL` | `C` |

`C` signifie clock / SCL. `D` signifie data / SDA.

## 5. Sortie analogique 0-10 V du DAC

Le bornier vert du DFR0971 est repéré, de haut en bas sur la vue utilisée :

1. `VOUT1`
2. `GND`
3. `VOUT0`

Pour le premier test :

| DFR0971 | Multimètre |
|---|---|
| `VOUT0` | Pointe rouge `V` |
| `GND` | Pointe noire `COM` |

Ne jamais raccorder `VOUT0` ou `VOUT1` directement sur une entrée de la Wemos : ces sorties peuvent monter à 10 V.

## 6. Switchs d’adresse du DFR0971

Le DFR0971 possède trois switchs `A2`, `A1`, `A0`.

| A2 | A1 | A0 | Adresse |
|---:|---:|---:|---:|
| 0 | 0 | 0 | `0x58` |
| 0 | 0 | 1 | `0x59` |
| 0 | 1 | 0 | `0x5A` |
| 0 | 1 | 1 | `0x5B` |
| 1 | 0 | 0 | `0x5C` |
| 1 | 0 | 1 | `0x5D` |
| 1 | 1 | 0 | `0x5E` |
| 1 | 1 | 1 | `0x5F` |

La position physique exacte `0` ou `1` doit être confirmée par scan I²C. Sur le banc actuel, le scan a confirmé `0x5F`, et on conserve cette adresse.

## 7. Ordre de test recommandé

1. Wemos seule : lancer le scanner I²C, aucune adresse ne doit apparaître.
2. Ajouter seulement la sonde SEN0536 : le scanner doit trouver `0x62`.
3. Retirer la sonde, ajouter seulement le DAC DFR0971 : le scanner doit trouver `0x5F`.
4. Brancher les deux modules : le scanner doit trouver `0x5F` et `0x62`.
5. Tester ensuite la sortie `VOUT0` du DAC au multimètre.
