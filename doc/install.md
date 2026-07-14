# Installation et mise en service du firmware `wifi_ap_web`

Ce document explique comment produire le livrable firmware à partir du code source actuel, le flasher dans la carte Wemos S2 Mini, puis vérifier que le système fonctionne.

## 1. Rôle de ce firmware

Ce firmware fait fonctionner le prototype de régulation CO₂ :

- création d’un Wi-Fi local par la carte ;
- serveur web embarqué accessible depuis un téléphone ;
- lecture de la sonde CO₂ / température / humidité SCD41 ;
- pilotage du module DAC 0-10 V DFR0971 ;
- mode automatique ou manuel ;
- historique RAM sur 24 h avec export CSV.

Le code source principal est :

```text
src/main.cpp
```

Le fichier de configuration PlatformIO est :

```text
platformio.ini
```

## 2. Matériel nécessaire

Matériel utilisé pour cette version :

- carte Wemos S2 Mini ;
- sonde SCD41 en I2C ;
- module DAC 0-10 V DFR0971 ;
- câble USB compatible données ;
- ordinateur avec VS Code + PlatformIO ;
- téléphone pour tester l’interface web ;
- multimètre pour vérifier la sortie 0-10 V.

## 3. Branchements actuels

Bus I2C commun :

| Signal | Wemos S2 Mini | SCD41 | DAC DFR0971 |
|---|---:|---:|---:|
| SDA | GPIO 15 | SDA | SDA |
| SCL | GPIO 21 | SCL | SCL |
| GND | GND | GND | GND |
| Alimentation | USB / 3V3 selon module | VCC | VCC selon module |

Adresses I2C utilisées par le firmware :

| Composant | Adresse |
|---|---:|
| SCD41 | `0x62` |
| DAC DFR0971 | `0x5F` |

Sortie analogique :

- mesurer entre `VOUT0` et `GND` du DAC ;
- `VOUT1` est aussi pilotée par le firmware avec la même valeur ;
- ne jamais relier `VOUT0` ou `VOUT1` directement à une entrée GPIO de la Wemos.

## 4. Préparer l’ordinateur

Installer :

1. Visual Studio Code ;
2. extension PlatformIO IDE dans VS Code ;
3. Git, si le projet vient de GitHub.

Ensuite récupérer ou ouvrir le dossier du firmware :

```text
06 - LOGICIEL EMBARQUE/firmware-esp32/tests-materiel/wifi_ap_web
```

Dans VS Code, il faut ouvrir ce dossier précis, pas seulement le dossier général du projet.

Le dossier doit contenir au minimum :

```text
platformio.ini
src/main.cpp
install.md
```

## 5. Vérifier la configuration PlatformIO

Le fichier `platformio.ini` doit contenir :

```ini
[env:lolin_s2_mini]
platform = espressif32
board = lolin_s2_mini
framework = arduino
upload_protocol = esptool
monitor_speed = 115200
```

Cette configuration indique :

- carte cible : Wemos / LOLIN S2 Mini ;
- framework : Arduino ;
- outil de flash : esptool ;
- vitesse du moniteur série : `115200`.

## 6. Compiler le firmware

Dans VS Code avec PlatformIO :

1. ouvrir le dossier `wifi_ap_web` ;
2. attendre que PlatformIO charge le projet ;
3. cliquer sur l’icône `Build`.

En ligne de commande, depuis le dossier `wifi_ap_web` :

```powershell
pio run
```

Résultat attendu :

```text
SUCCESS
```

PlatformIO produit notamment :

```text
.pio/build/lolin_s2_mini/firmware.bin
```

Ce fichier `.bin` est le livrable compilé à flasher dans la carte.

Attention : le dossier `.pio` est généré automatiquement. Il ne faut pas le mettre sur GitHub.

## 7. Brancher la carte

1. brancher la Wemos S2 Mini en USB ;
2. utiliser un câble USB qui transporte les données, pas seulement la charge ;
3. vérifier que Windows détecte un port COM.

Dans PlatformIO :

- ouvrir `Devices` ou `PlatformIO: Devices`.

En ligne de commande :

```powershell
pio device list
```

Résultat attendu, exemple :

```text
COM4
----
Hardware ID: USB VID:PID=303A:80C2
Description: Périphérique série USB
```

Le numéro de port peut changer selon l’ordinateur : `COM3`, `COM4`, `COM5`, etc.

## 8. Flasher la carte

Méthode normale avec PlatformIO :

```powershell
pio run -t upload
```

Si plusieurs ports existent, préciser le port :

```powershell
pio run -t upload --upload-port COM4
```

Adapter `COM4` avec le port réel de la carte.

Résultat attendu :

```text
Hash of data verified.
Hard resetting via RTS pin...
SUCCESS
```

Après le flash, la carte redémarre automatiquement.

## 9. Ouvrir le moniteur série

Pour vérifier le démarrage :

```powershell
pio device monitor --baud 115200
```

Ou, si besoin de préciser le port :

```powershell
pio device monitor --port COM4 --baud 115200
```

Messages attendus :

```text
Demarrage firmware web reel v4 - boot autonome
AP actif: oui / adresse http://192.168.4.1
Serveur HTTP pret
Sonde SCD41 0x62: OK
DAC DFR0971 0x5F: OK
CO2=531ppm sensor=OK dac=OK addr=0x5F output=20% target=2.00V write=OK
```

Si la sonde ou le DAC est absent, le message indiquera `ABSENT` ou une erreur.

## 10. Connexion au Wi-Fi de la carte

Depuis le téléphone :

1. ouvrir les réglages Wi-Fi ;
2. se connecter au réseau :

```text
VENT-CO2-TEST
```

Mot de passe Wi-Fi :

```text
ventco2test
```

Adresse web fiable :

```text
http://192.168.4.1
```

Le firmware contient aussi le domaine :

```text
sonde.com
```

Mais selon le téléphone, `sonde.com` peut ne pas fonctionner correctement. L’adresse fiable reste `http://192.168.4.1`.

## 11. Connexion installateur

La page est consultable sans connexion.

Pour modifier les réglages :

1. appuyer sur `Connexion` ;
2. saisir le mot de passe installateur :

```text
admin1234
```

La session installateur dure environ 15 minutes côté téléphone.

## 12. Vérifier la page d’accueil

Sur la page d’accueil, vérifier :

- CO₂ en ppm ;
- température ;
- humidité ;
- mode actif : `AUTO` ou `MANUEL` ;
- sortie DAC en pourcentage ;
- tension cible en volts.

Si la sonde fonctionne, le badge doit indiquer une lecture CO₂ réelle.

## 13. Tester le mode manuel

1. se connecter en installateur ;
2. aller dans `Réglages` ;
3. sélectionner `MANUEL` ;
4. déplacer le slider d’ouverture ;
5. appuyer sur `Enregistrer`.

Vérification au multimètre :

| Réglage manuel | Tension attendue approximative |
|---:|---:|
| 0 % | 0 V |
| 20 % | 2 V |
| 50 % | 5 V |
| 100 % | 10 V |

Mesurer entre :

```text
VOUT0 et GND
```

Le firmware écrit la même valeur sur `VOUT0` et `VOUT1`.

## 14. Tester le mode automatique

1. se connecter en installateur ;
2. aller dans `Réglages` ;
3. sélectionner `AUTO` ;
4. régler :
   - consigne CO₂ ;
   - ouverture mini ;
   - ouverture maxi ;
5. appuyer sur `Enregistrer`.

En mode auto :

- si le CO₂ est bas, la sortie tend vers l’ouverture mini ;
- si le CO₂ monte, la sortie augmente progressivement ;
- si la lecture CO₂ échoue, le firmware met la sortie au maximum par sécurité.

## 15. Tester l’historique

Aller dans l’onglet :

```text
Historique
```

Le firmware garde :

- 1 point dès la première lecture CO₂ valide ;
- puis 1 point toutes les 5 minutes ;
- 288 points maximum ;
- stockage en RAM uniquement.

Important :

- l’historique est perdu si la carte redémarre ;
- il n’est pas écrit en flash ;
- cela évite les problèmes de lenteur et d’usure mémoire.

Pour exporter :

1. appuyer sur `Exporter CSV Excel` ;
2. récupérer le fichier :

```text
historique_co2_24h.csv
```

Colonnes exportées :

```text
age_secondes
age_hhmmss
co2_ppm
temperature_c
humidite_rh
sortie_pct
```

## 16. Livrables produits

Après compilation, les fichiers utiles générés par PlatformIO sont :

```text
.pio/build/lolin_s2_mini/firmware.bin
.pio/build/lolin_s2_mini/firmware.elf
```

Pour un simple flash, le plus important est :

```text
firmware.bin
```

Mais pour GitHub, il faut versionner le code source, pas les fichiers générés.

## 17. Fichiers à mettre sur GitHub pour ce firmware

À mettre sur GitHub :

```text
platformio.ini
src/main.cpp
install.md
README.md
```

À ne pas mettre sur GitHub :

```text
.pio/
.tools/
.codex-pio/
firmware.bin
firmware.elf
*.map
*.o
*.a
```

## 18. Commandes rapides

Depuis le dossier `wifi_ap_web` :

Compiler :

```powershell
pio run
```

Lister les cartes branchées :

```powershell
pio device list
```

Flasher :

```powershell
pio run -t upload --upload-port COM4
```

Lire le moniteur série :

```powershell
pio device monitor --port COM4 --baud 115200
```

Remplacer `COM4` par le port réel de la carte.

## 19. Problèmes fréquents

### La carte n’apparaît pas

Vérifier :

- câble USB données ;
- autre port USB ;
- bouton reset de la carte ;
- pilote USB série si nécessaire ;
- `pio device list`.

### Le flash échoue

Essayer :

- débrancher/rebrancher la carte ;
- fermer le moniteur série ;
- relancer :

```powershell
pio run -t upload --upload-port COM4
```

### Le Wi-Fi n’apparaît pas

Vérifier au moniteur série que le firmware démarre.

Le réseau attendu est :

```text
VENT-CO2-TEST
```

### La page ne s’ouvre pas

Utiliser l’adresse fiable :

```text
http://192.168.4.1
```

Ne pas dépendre de `sonde.com` pour le moment.

### La sonde CO₂ est absente

Vérifier :

- SDA sur GPIO 15 ;
- SCL sur GPIO 21 ;
- GND commun ;
- alimentation de la sonde ;
- adresse I2C `0x62`.

### Le DAC est absent

Vérifier :

- SDA sur GPIO 15 ;
- SCL sur GPIO 21 ;
- GND commun ;
- alimentation du module ;
- réglage des switchs d’adresse ;
- adresse attendue `0x5F`.

### La sortie 0-10 V ne bouge pas

Vérifier :

- mode `MANUEL` ;
- appuyer sur `Enregistrer` après modification ;
- mesurer entre `VOUT0` et `GND` ;
- vérifier dans l’onglet `Test` que `Ecriture DAC` indique `OK`.

## 20. État validé de cette version

Cette version a été validée avec :

- compilation PlatformIO réussie ;
- flash réussi sur Wemos S2 Mini ;
- Wi-Fi actif ;
- serveur web accessible ;
- sonde SCD41 détectée en `0x62` ;
- DAC détecté en `0x5F` ;
- sortie DAC fonctionnelle ;
- historique RAM + export CSV.

