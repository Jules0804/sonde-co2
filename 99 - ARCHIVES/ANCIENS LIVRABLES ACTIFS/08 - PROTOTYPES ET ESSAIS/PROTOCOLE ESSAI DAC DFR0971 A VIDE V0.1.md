# Protocole essai DAC DFR0971 à vide v0.1

## Objet

Vérifier que le module DFR0971 génère correctement une consigne 0-10 V avant tout raccordement moteur.

Cet essai intervient après :

1. réception colis conforme ;
2. identification Wemos ;
3. scan I²C propre ;
4. adresse DFR0971 `0x58` présente ;
5. vérification que VOUT0/VOUT1 ne sont raccordés qu'au multimètre.

## Sketch à utiliser

`06 - LOGICIEL EMBARQUE\arduino-outils\test_dfr0971_csv\test_dfr0971_csv.ino`

Le sketch configure la plage 10 V, force un départ à 10 V, puis commande 0, 20, 50, 80 et 100 % sur CH0 et CH1.

## Montage

- Wemos ESP32-C3 ;
- DFR0971 alimenté selon le dossier de câblage du lot 1 ;
- GND commun ;
- SDA/SCL selon la Wemos identifiée ;
- multimètre entre GND et VOUT0 puis GND et VOUT1 ;
- aucun moteur ;
- aucun 24 V ;
- VOUT0/VOUT1 jamais reliés à une entrée ESP32.

## Procédure

1. Charger le sketch.
2. Ouvrir le moniteur série à 115200 bauds.
3. Copier l'en-tête CSV dans `mesures_dac.csv`.
4. Pour chaque ligne affichée, attendre la stabilisation, mesurer au multimètre et compléter :
   - `measured_v` ;
   - `absolute_error_v` ;
   - `relative_error_percent` si utile ;
   - modèle du multimètre.
5. Répéter la séquence complète trois fois.
6. Vérifier que la fin du sketch remet CH0 et CH1 à 10 V.

## Critères d'acceptation

| Critère | Attendu |
|---|---|
| Adresse I²C | `0x58` |
| Points testés | 0, 2, 5, 8, 10 V |
| Canaux | CH0 et CH1 |
| Répétitions | 3 par point |
| Erreur absolue | ≤ 0,10 V |
| Tension maximale | ≤ 10,20 V |
| Monotonie | Oui |
| Fin d'essai | Retour 10 V sur CH0 et CH1 |

Si une sortie dépasse 10,20 V, si la tension n'est pas monotone ou si le module chauffe, classer l'essai `REFUSÉ`.

## Analyse

Après saisie des mesures, lancer :

```powershell
node .\analyser-reception.mjs .\mesures_dac.csv
```

Le verdict automatique doit être copié dans le rapport de réception.

## Suite

Si l'essai à vide est accepté, réaliser ensuite :

`PROTOCOLE ESSAI CHARGE 0-10V SIX ENTREES V0.1.md`
