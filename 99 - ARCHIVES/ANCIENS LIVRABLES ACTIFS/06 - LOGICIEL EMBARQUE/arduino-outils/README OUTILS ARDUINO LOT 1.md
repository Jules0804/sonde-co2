# README outils Arduino lot 1

## Objet

Ces sketches servent uniquement aux essais de réception du lot 1 avec la Wemos ESP32-C3, le SEN0536/SCD41 et le DFR0971.

Ils ne constituent pas encore le firmware produit final. Leur rôle est de prouver séparément :

1. que le bus I²C fonctionne ;
2. que la sonde CO₂ répond ;
3. que la sortie 0-10 V du DAC est mesurable et monotone.

## Règles non négociables

- Aucun moteur raccordé.
- Aucun 24 V raccordé.
- VOUT0/VOUT1 jamais reliés à l'ESP32.
- Les modules sont d'abord alimentés en 3,3 V.
- Les broches SDA/SCL restent à confirmer selon la Wemos exacte.
- Si un composant chauffe, si une adresse disparaît ou si une tension dépasse 3,6 V côté I²C, arrêter l'essai.

## Ordre d'utilisation

| Ordre | Sketch | Matériel raccordé | Résultat attendu |
|---:|---|---|---|
| 1 | `scan_i2c_lot1\scan_i2c_lot1.ino` | Wemos seule | aucune adresse non expliquée |
| 2 | `scan_i2c_lot1\scan_i2c_lot1.ino` | Wemos + SEN0536 | `0x62` |
| 3 | `scan_i2c_lot1\scan_i2c_lot1.ino` | Wemos + DFR0971 | `0x58` |
| 4 | `scan_i2c_lot1\scan_i2c_lot1.ino` | Wemos + SEN0536 + DFR0971 | `0x58` et `0x62` |
| 5 | `lecture_scd41_csv\lecture_scd41_csv.ino` | Wemos + SEN0536 | CSV CO₂ toutes les 5 s |
| 6 | `test_dfr0971_csv\test_dfr0971_csv.ino` | Wemos + DFR0971 + multimètre | CSV consignes 0/2/5/8/10 V |

## Sorties CSV

### SCD41

Le sketch `lecture_scd41_csv.ino` imprime l'en-tête :

`timestamp_iso,uptime_s,sequence,co2_ppm,temperature_c,humidity_rh,data_ready,read_ok,error_code,reboot_count,comment`

Les lignes peuvent être copiées dans :

`08 - PROTOTYPES ET ESSAIS\mesures_scd41_30min.csv`

puis, pour l'essai long :

`08 - PROTOTYPES ET ESSAIS\mesures_scd41_24h.csv`

### DFR0971

Le sketch `test_dfr0971_csv.ino` imprime l'en-tête :

`timestamp_iso,channel,command_percent,target_v,measured_v,absolute_error_v,relative_error_percent,repetition,test_condition,firmware_version,multimeter,comment`

Le sketch ne mesure pas la tension. Il faut remplir `measured_v` au multimètre.

## Analyse des résultats

Depuis `08 - PROTOTYPES ET ESSAIS` :

```powershell
node .\analyser-reception.mjs .\mesures_scd41_24h.csv
node .\analyser-reception.mjs .\mesures_dac.csv
```

Le verdict automatique est une aide. La décision finale doit rester dans :

`MODELE RAPPORT RECEPTION LOT 1.md`

## Capture automatique du port série

Pour éviter le copier-coller du moniteur série Arduino, utiliser :

`08 - PROTOTYPES ET ESSAIS\capturer-serie-csv.ps1`

La procédure est décrite dans :

`08 - PROTOTYPES ET ESSAIS\README CAPTURE SERIE CSV LOT 1.md`

## Modification des broches I²C

Les trois sketches contiennent :

```cpp
const int SDA_PIN = -1;
const int SCL_PIN = -1;
```

Tant que ces valeurs restent à `-1`, Arduino utilise les broches par défaut de la carte sélectionnée. Après identification exacte de la Wemos, remplacer ces valeurs si nécessaire et reporter les broches dans la fiche Wemos et le rapport de réception.

## Interdictions pendant ces essais

- Ne pas tester la mémorisation non volatile du DFR0971 pendant la boucle normale.
- Ne pas raccorder un servomoteur pour "voir si ça bouge".
- Ne pas alimenter le bus I²C en 5 V sans preuve de niveau logique compatible.
- Ne pas interpréter une mesure CO₂ courte comme preuve métrologique produit.
