# Procédure de build et flash de la carte

Ce document décrit précisément les étapes effectuées quand on dit : “flashe la carte”.

Il couvre :

- la compilation du code source ;
- la production du fichier firmware ;
- la détection de la carte ;
- l’écriture du firmware dans l’ESP32 ;
- le redémarrage ;
- la vérification au moniteur série.

## 1. Dossier de travail

La procédure se lance depuis le dossier PlatformIO du firmware :

```text
9 - PROJET REGULATION VENTILATION CO2/
06 - LOGICIEL EMBARQUE/
firmware-esp32/
tests-materiel/
wifi_ap_web/
```

Ce dossier contient au minimum :

```text
platformio.ini
src/main.cpp
```

Le fichier `src/main.cpp` contient :

- le firmware ESP32 ;
- la lecture de la sonde SCD41 ;
- le pilotage du DAC 0-10 V ;
- le serveur web ;
- la page HTML/CSS/JS embarquée ;
- l’historique RAM et l’export CSV.

## 2. Vérification rapide de la configuration

Avant de compiler, on vérifie que `platformio.ini` cible bien la bonne carte :

```ini
[env:lolin_s2_mini]
platform = espressif32
board = lolin_s2_mini
framework = arduino
upload_protocol = esptool
monitor_speed = 115200
```

Cette configuration signifie :

| Champ | Rôle |
|---|---|
| `platform = espressif32` | Utilise la plateforme ESP32 |
| `board = lolin_s2_mini` | Cible la Wemos / LOLIN S2 Mini |
| `framework = arduino` | Compile avec le framework Arduino C++ |
| `upload_protocol = esptool` | Flashe la carte avec `esptool.py` |
| `monitor_speed = 115200` | Configure le moniteur série à 115200 bauds |

## 3. Compilation du firmware

La compilation transforme le code source en fichier binaire exécutable par l’ESP32.

Commande :

```powershell
pio run
```

PlatformIO effectue alors :

1. lecture de `platformio.ini` ;
2. préparation de l’environnement `lolin_s2_mini` ;
3. compilation du fichier `src/main.cpp` ;
4. compilation ou liaison des bibliothèques Arduino utilisées :
   - `WiFi` ;
   - `WebServer` ;
   - `DNSServer` ;
   - `Wire` ;
   - `Preferences` ;
5. édition de liens ;
6. génération du firmware final.

Résultat attendu :

```text
SUCCESS
```

PlatformIO affiche aussi l’utilisation mémoire, par exemple :

```text
RAM:   [==        ]  17.1%
Flash: [======    ]  59.2%
```

Si la compilation échoue, on ne flashe pas la carte. Il faut d’abord corriger le code.

## 4. Livrable produit par la compilation

Après une compilation réussie, le firmware binaire est généré ici :

```text
.pio/build/lolin_s2_mini/firmware.bin
```

C’est ce fichier qui contient le programme compilé à envoyer dans la carte.

PlatformIO génère aussi d’autres fichiers utiles au debug ou au flash :

```text
.pio/build/lolin_s2_mini/firmware.elf
.pio/build/lolin_s2_mini/bootloader.bin
.pio/build/lolin_s2_mini/partitions.bin
```

Ces fichiers sont générés automatiquement. Ils ne doivent normalement pas être versionnés sur GitHub.

## 5. Détection de la carte

Avant le flash, on vérifie que l’ordinateur voit la carte en USB.

Commande :

```powershell
pio device list
```

Exemple de résultat :

```text
COM4
----
Hardware ID: USB VID:PID=303A:80C2
Description: Périphérique série USB
```

Le port peut changer selon l’ordinateur :

```text
COM3
COM4
COM5
...
```

Il faut utiliser le port réellement détecté.

## 6. Flash de la carte

Commande générale :

```powershell
pio run -t upload
```

Commande avec port explicite :

```powershell
pio run -t upload --upload-port COM4
```

Remplacer `COM4` par le port réel si nécessaire.

## 7. Passage en mode bootloader

Pendant le flash, PlatformIO force la carte à passer en mode bootloader.

Sur l’ESP32-S2, on peut voir :

```text
Forcing reset using 1200bps open/close on port COM4
Waiting for the new upload port...
```

Cela signifie que PlatformIO ouvre puis ferme le port série à une vitesse spéciale pour demander à la carte de redémarrer en mode flash.

Il est possible que Windows change temporairement le numéro de port.

Exemple :

```text
Using manually specified: COM4
Serial port COM3
```

Ce n’est pas forcément une erreur. La carte peut apparaître en `COM4` en mode normal puis en `COM3` en mode bootloader.

## 8. Connexion à la puce ESP32

Ensuite `esptool.py` se connecte à l’ESP32.

Sortie typique :

```text
Connecting...
Chip is ESP32-S2FNR2
Features: WiFi, Embedded Flash 4MB, Embedded PSRAM 2MB
Crystal is 40MHz
MAC: 80:65:99:xx:xx:xx
```

Cette étape confirme que :

- l’ordinateur communique avec la carte ;
- la puce détectée est bien un ESP32-S2 ;
- la mémoire flash est accessible.

## 9. Effacement des zones flash

Avant l’écriture, `esptool.py` efface les zones nécessaires dans la mémoire interne de l’ESP32.

Exemple :

```text
Flash will be erased from 0x00001000 to 0x00004fff...
Flash will be erased from 0x00008000 to 0x00008fff...
Flash will be erased from 0x0000e000 to 0x0000ffff...
Flash will be erased from 0x00010000 to 0x000cdfff...
```

Cela concerne uniquement la mémoire flash de la carte ESP32.

## 10. Écriture des fichiers dans l’ESP32

Pendant le flash, plusieurs blocs sont écrits :

| Fichier | Rôle |
|---|---|
| `bootloader.bin` | Programme de démarrage de l’ESP32 |
| `partitions.bin` | Plan de partition mémoire |
| `boot_app0.bin` | Élément de boot utilisé par le framework ESP32 / Arduino |
| `firmware.bin` | Programme principal du projet |

On voit une progression comme :

```text
Writing at 0x00010000... (10 %)
Writing at 0x00010000... (20 %)
...
Writing at 0x00010000... (100 %)
```

## 11. Vérification de l’écriture

Après écriture, `esptool.py` vérifie que les données envoyées correspondent bien aux données écrites.

Résultat attendu :

```text
Hash of data verified.
```

Cette ligne est importante : elle confirme que le firmware a été écrit correctement.

## 12. Redémarrage de la carte

À la fin du flash, la carte redémarre :

```text
Leaving...
Hard resetting via RTS pin...
SUCCESS
```

La carte quitte alors le mode bootloader et lance le nouveau firmware.

## 13. Vérification au moniteur série

Après le flash, on ouvre le moniteur série.

Commande :

```powershell
pio device monitor --port COM4 --baud 115200
```

Remplacer `COM4` par le port réel.

Messages de démarrage attendus :

```text
Demarrage firmware web reel v4 - boot autonome
AP actif: oui / adresse http://192.168.4.1
Serveur HTTP pret
Sonde SCD41 0x62: OK
DAC DFR0971 0x5F: OK
```

Puis les messages périodiques :

```text
CO2=531ppm sensor=OK dac=OK addr=0x5F output=20% target=2.00V write=OK
```

## 14. Points validés après flash

Après un flash réussi, on vérifie :

- le firmware démarre ;
- le Wi-Fi est créé ;
- le serveur web est prêt ;
- la sonde SCD41 répond à l’adresse `0x62` ;
- le DAC répond à l’adresse `0x5F` ;
- le DAC reçoit bien les ordres ;
- la sortie calculée est cohérente ;
- la page web est accessible depuis un téléphone.

## 15. Test côté téléphone

Depuis le téléphone :

1. se connecter au Wi-Fi :

```text
VENT-CO2-TEST
```

2. saisir le mot de passe :

```text
ventco2test
```

3. ouvrir :

```text
http://192.168.4.1
```

L’adresse `sonde.com` existe dans le firmware, mais selon le téléphone elle peut ne pas fonctionner. Pour les tests fiables, utiliser `192.168.4.1`.

## 16. Test installateur

Pour modifier les réglages :

1. appuyer sur `Connexion` ;
2. saisir :

```text
admin1234
```

3. aller dans `Réglages` ;
4. tester le mode `MANUEL` ou `AUTO`.

## 17. Test rapide du DAC

En mode manuel :

| Réglage | Tension cible |
|---:|---:|
| 0 % | 0 V |
| 20 % | 2 V |
| 50 % | 5 V |
| 100 % | 10 V |

Mesure à faire entre :

```text
VOUT0 et GND
```

ou :

```text
VOUT1 et GND
```

Le firmware écrit la même valeur sur `VOUT0` et `VOUT1`.

## 18. Résumé très court

La procédure complète est :

```text
code source
-> compilation PlatformIO
-> génération firmware.bin
-> détection du port COM
-> upload avec esptool
-> écriture dans la flash ESP32
-> redémarrage
-> vérification série
-> test Wi-Fi / page web / sonde / DAC
```

## 19. Commandes rapides

Depuis le dossier `wifi_ap_web` :

Compiler :

```powershell
pio run
```

Lister les ports :

```powershell
pio device list
```

Flasher :

```powershell
pio run -t upload --upload-port COM4
```

Moniteur série :

```powershell
pio device monitor --port COM4 --baud 115200
```

Remplacer `COM4` par le port réel.

