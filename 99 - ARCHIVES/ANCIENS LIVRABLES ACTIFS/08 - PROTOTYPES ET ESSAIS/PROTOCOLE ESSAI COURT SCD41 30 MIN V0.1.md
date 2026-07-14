# Protocole essai court SCD41 30 min v0.1

## Objet

Vérifier rapidement que le SEN0536 / SCD41 donne des mesures CO₂ plausibles avant de lancer l'essai long 24 h.

Cet essai intervient après :

1. réception colis conforme ;
2. identification Wemos ;
3. scan I²C propre ;
4. présence de l'adresse `0x62`.

## Sketch à utiliser

`06 - LOGICIEL EMBARQUE\arduino-outils\lecture_scd41_csv\lecture_scd41_csv.ino`

Le sketch utilise les commandes I²C SCD41 directement et ne dépend pas d'une bibliothèque capteur externe.

## Montage

- Wemos ESP32-C3 ;
- SEN0536 alimenté en 3,3 V ;
- GND commun ;
- SDA/SCL selon la Wemos identifiée ;
- aucun DFR0971 obligatoire ;
- aucun moteur ;
- aucun 24 V.

## Procédure

1. Charger le sketch.
2. Ouvrir le moniteur série à 115200 bauds.
3. Copier l'en-tête CSV et les lignes dans un fichier d'essai, par exemple :

   `mesures_scd41_30min.csv`

4. Laisser tourner 10 minutes à l'air ambiant.
5. Approcher une respiration indirecte du capteur sans condensation directe.
6. Vérifier que le CO₂ monte.
7. Aérer ou éloigner la source.
8. Vérifier que le CO₂ redescend progressivement.
9. Continuer jusqu'à 30 minutes minimum.

## Critères d'acceptation rapide

| Critère | Attendu |
|---|---|
| Lecture I²C | Pas d'erreur persistante |
| Cadence | Une ligne environ toutes les 5 s |
| CO₂ | Valeurs numériques plausibles |
| Réaction respiration | Hausse visible |
| Réaction aération | Baisse progressive |
| Température / humidité | Valeurs non absurdes |
| Redémarrage Wemos | Aucun redémarrage spontané |

Si cet essai échoue, ne pas lancer l'essai 24 h avant d'avoir corrigé le câblage, l'alimentation ou le sketch.

## Suite

Si l'essai court est accepté, lancer l'essai 24 h prévu dans :

`08 - PROTOTYPES ET ESSAIS\PROTOCOLE DE RECEPTION DU LOT 1.md`
