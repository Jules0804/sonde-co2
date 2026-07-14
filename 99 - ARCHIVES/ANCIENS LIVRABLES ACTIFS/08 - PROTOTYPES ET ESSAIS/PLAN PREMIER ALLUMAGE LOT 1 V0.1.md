# Plan premier allumage lot 1 v0.1

## Objectif

Demarrer le premier banc **sans moteur et sans 24 V**, uniquement pour confirmer :

- la carte Wemos S2 Mini exacte ;
- le bus I2C ;
- la presence du SEN0536/SCD41 ;
- la presence du DFR0971 ;
- l'absence d'erreur grossiere de cablage.

## Materiel a preparer

- Wemos S2 Mini ;
- SEN0536 / SCD41 ;
- DFR0971 ;
- cable USB ;
- multimetre ;
- fils courts ;
- ordinateur avec Arduino IDE ou equivalent ;
- appareil photo pour les preuves.

Ne pas preparer pour cette etape :

- alimentation 24 V ;
- servomoteur ;
- coffret secteur ;
- registre motorise.

## Ordre exact

### 1. Identifier la Wemos

Remplir `06 - LOGICIEL EMBARQUE\firmware-esp32\FICHE IDENTIFICATION CARTE WEMOS S2 MINI.md`.

Photos minimales :

- recto ;
- verso ;
- marquages lisibles.

### 2. Tester la Wemos seule

1. Brancher la Wemos seule en USB.
2. Relever le port COM.
3. Charger le sketch `06 - LOGICIEL EMBARQUE\arduino-outils\scan_i2c_lot1\scan_i2c_lot1.ino`.
4. Ouvrir le moniteur serie a 115200 bauds.
5. Verifier que le programme tourne.

Resultat attendu carte seule : aucune adresse I2C detectee, sauf module interne eventuel documente par la carte.

### 3. Mesurer le 3,3 V

Avant de raccorder les modules :

- mesurer 3V3/GND sur la Wemos ;
- accepter seulement 3,0 a 3,6 V ;
- couper si la tension est absente ou instable.

### 4. Brancher le SEN0536 seul

| SEN0536 | Wemos |
|---|---|
| VCC | 3V3 |
| GND | GND |
| SDA | SDA retenu ou broche I2C par defaut |
| SCL | SCL retenu ou broche I2C par defaut |

Resultat attendu : adresse `0x62`.

### 5. Brancher le DFR0971 seul

Meme logique, mais sans raccorder VOUT0/VOUT1 a l'ESP32.

Resultat attendu : adresse `0x58`.

### 6. Brancher les deux modules

Resultat attendu :

- `0x58` ;
- `0x62` ;
- aucune adresse inconnue.

### 7. Arret si anomalie

Arreter et classer `SOUS RESERVE` si :

- pas d'adresse attendue ;
- adresse inconnue ;
- redemarrage de la Wemos ;
- echauffement ;
- odeur ;
- SDA/SCL au-dessus de 3,6 V ;
- tension 3,3 V instable.

## Preuves a conserver

- photos des modules ;
- capture ou copie du moniteur serie ;
- tension 3,3 V mesuree ;
- port COM ;
- broches SDA/SCL utilisees ;
- date de l'essai.

## Suite apres validation

Si le scan I2C est propre, passer au protocole complet :

`08 - PROTOTYPES ET ESSAIS\PROTOCOLE DE RECEPTION DU LOT 1.md`
