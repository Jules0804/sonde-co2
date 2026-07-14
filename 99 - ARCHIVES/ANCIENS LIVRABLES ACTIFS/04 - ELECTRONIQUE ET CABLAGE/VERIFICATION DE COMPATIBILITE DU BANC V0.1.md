# Vérification de compatibilité du banc v0.1

## Résultat général

Les composants proposés sont compatibles au niveau des tensions et interfaces de principe. Des vérifications de fiche et mesures restent obligatoires avant mise sous tension.

## Matrice

| Liaison | Source | Destination | Compatibilité | Vérification restante |
|---|---|---|---|---|
| 230 V AC | réseau | HDR-60-24 | Oui, entrée universelle de la gamme | Protection, classe et bornier |
| 24 V DC | HDR-60-24 | GDB161.1E | Oui, moteur AC/DC 24 V | Courant exact et polarité DC |
| 24 V DC | HDR-60-24 | DDR-15G-5 | Oui, entrée 9–36 V DC | Protection de départ |
| 5 V DC | DDR-15G-5 | ESP32 DevKit | Oui via broche 5V/VIN selon carte | Référence exacte de l'ESP32 |
| 3,3/5 V | logique | DFR0971 | Oui, module annoncé 3,3–5 V | Adresse I²C et bibliothèque |
| 5 V/I²C | logique | SEN0536 SCD41 | Oui pour breakout Gravity | Niveaux logiques de la carte exacte |
| I²C | ESP32 | SCD41 + DFR0971 | Adresses distinctes attendues | Confirmer par scan I²C |
| 0–10 V | DFR0971 | GDB161.1E Y | Oui, commande 0/2–10 V | Impédance, calibration et sens |
| 0 V commun | PS1/DAC | GDB161.1E G0 | Nécessaire | Vérifier schéma fabricant |
| Sortie Y commune | DFR0971 | deux à six moteurs | Conditionnelle : résistance équivalente ≥ 10 kΩ | Essai résistif 10 kΩ puis mesure avec moteurs réels |
| Retour U 2–10 V | un moteur | ADC ESP32 | Non direct : dépasse 3,3 V | Ajouter diviseur, protection et calibration |

## Points favorables

- Le DFR0971 évite un étage analogique bricolé pour la première preuve.
- Ses deux canaux permettent de comparer une commande commune et deux groupes sans changer de module.
- Le 24 V limite le secteur à la zone d'entrée et aux alimentations.
- Les deux capteurs I²C restent proches de l'ESP32 sur le banc.

## Risques de compatibilité

1. La référence exacte de l'ESP32 peut modifier les broches et capacités.
2. Le breakout SCD41 peut comporter ou non des résistances de tirage/convertisseurs de niveau.
3. L'état de la sortie DAC au démarrage doit être mesuré ; une ouverture 100 % doit être imposée par le logiciel avant le mode AUTO.
4. Le GDB161.1E peut être configuré 0–10 ou 2–10 V : la loi doit correspondre.
5. Les retours U ne doivent jamais être raccordés ensemble.
6. Le HDR-60-24 doit être validé pour le courant cumulé réel et la température du coffret.

## Qualification complémentaire de la sortie commune

La compatibilité six moteurs n'est pas présumée. La règle provisoire exige au moins 60 kΩ par entrée Y, soit 10 kΩ pour six entrées identiques en parallèle. Le protocole et l'analyseur correspondants sont rangés dans `08 - PROTOTYPES ET ESSAIS`. Une référence présentant une impédance plus faible impose un nouvel essai et éventuellement un buffer analogique.

## Essais de réception composants

- photographier et relever chaque référence ;
- contrôler l'absence de dommage ;
- mesurer les alimentations à vide ;
- scanner le bus I²C ;
- comparer la commande DAC au multimètre sur 0/25/50/75/100 % ;
- tester un moteur avant d'en ajouter un deuxième ;
- mesurer courant et température ;
- consigner les résultats dans `08 - PROTOTYPES ET ESSAIS`.
