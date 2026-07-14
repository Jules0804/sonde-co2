# Protocole essai implantation sonde CO2 en gaine v0.1

## Objet

Vérifier que la sonde SEN0536 / SCD41 reste exploitable lorsqu'elle est intégrée dans une pièce imprimée 3D et exposée à l'air d'une gaine de ventilation.

Cet essai ne valide pas encore la métrologie produit finale. Il sert à détecter les erreurs grossières d'implantation :

- flux direct trop violent ;
- temps de réponse trop lent ;
- zone morte dans le boîtier ;
- échauffement local ;
- risque poussière / condensation ;
- montage impossible à maintenir.

## Prérequis

Avant cet essai :

1. lot 1 reçu et accepté ;
2. Wemos identifiée ;
3. lecture SCD41 30 min acceptée ;
4. lecture SCD41 24 h acceptée ou au moins essai long en cours sans défaut bloquant ;
5. boîtier sonde imprimé ou prototype équivalent ;
6. aucune alimentation 24 V ni moteur nécessaire.

## Références projet

- `05 - MECANIQUE ET AERAULIQUE\CAO SONDE SEN0536 - README V0.1.md`
- `05 - MECANIQUE ET AERAULIQUE\fusion360_sonde_sen0536_boitiers.py`
- `06 - LOGICIEL EMBARQUE\arduino-outils\lecture_scd41_csv\lecture_scd41_csv.ino`
- `08 - PROTOTYPES ET ESSAIS\README CAPTURE SERIE CSV LOT 1.md`

## Montage d'essai

| Élément | Exigence |
|---|---|
| Gaine | DN200 ou DN250 si disponible, sinon montage provisoire documenté |
| Sonde | SEN0536 montée dans le boîtier imprimé |
| Alimentation | USB / 3,3 V côté logique uniquement |
| Capture | CSV via `capturer-serie-csv.ps1` |
| Référence simple | Mesure ambiante hors gaine avec la même sonde avant/après |
| Ventilation | Débit stable si possible, sinon état ventilateur documenté |

## Séquence d'essai

### 1. Référence hors gaine

1. Placer la sonde hors gaine, à l'air ambiant.
2. Capturer 10 minutes.
3. Noter température, humidité et contexte d'occupation.

Fichier conseillé :

`mesures_scd41_reference_ambiante.csv`

### 2. Montage en gaine

1. Monter le boîtier sur la gaine.
2. Vérifier que la carte ne touche pas la gaine métallique.
3. Vérifier que le câble n'est pas en traction.
4. Vérifier que l'ouverture de mesure n'est pas obstruée.
5. Photographier le montage.

### 3. Essai gaine stable

1. Lancer la ventilation ou documenter l'état réel.
2. Capturer 30 minutes.
3. Noter toute variation de débit, porte ouverte, présence humaine ou événement.

Fichier conseillé :

`mesures_scd41_gaine_30min.csv`

### 4. Essai réponse

Créer une variation de CO₂ prudente et reproductible :

- soit présence humaine dans la salle raccordée ;
- soit respiration indirecte près de la reprise, sans condensation directe sur la sonde ;
- soit comparaison avec une pièce occupée puis aérée.

Capturer au moins 30 minutes supplémentaires.

Fichier conseillé :

`mesures_scd41_gaine_reponse.csv`

### 5. Retour hors gaine

Déposer la sonde ou ouvrir le boîtier si nécessaire, puis refaire 10 minutes à l'air ambiant.

Fichier conseillé :

`mesures_scd41_reference_retour.csv`

## Points à observer

| Point | Attendu |
|---|---|
| Lecture I²C | Pas d'erreur persistante |
| CO₂ | Valeurs plausibles, sans saut impossible |
| Réponse | Variation dans le bon sens |
| Retour | Baisse progressive après aération |
| Température | Pas d'échauffement lié au boîtier |
| Humidité | Pas de condensation |
| Boîtier | Pas de vibration, pas de fuite évidente, accès maintenance possible |
| Câble | Pas de traction ni frottement coupant |

## Critères d'acceptation prototype

L'implantation est `ACCEPTÉE POUR BANC` si :

- la sonde reste lue sans défaut I²C persistant ;
- les valeurs CO₂ restent plausibles ;
- la réponse est dans le bon sens lors d'une variation ;
- aucune condensation ou poussière visible ne menace la carte ;
- le montage est démontable sans casser la pièce ;
- le câble peut être sécurisé.

L'implantation est `SOUS RÉSERVE` si :

- la réponse est lente mais exploitable ;
- le boîtier nécessite une modification mineure ;
- les photos montrent un problème de passage câble ou de fixation corrigeable.

L'implantation est `REFUSÉE` si :

- la sonde ne répond plus correctement ;
- de la condensation apparaît ;
- le flux direct provoque des valeurs instables ;
- la carte est exposée à la poussière ou à l'eau ;
- le montage n'est pas maintenable.

## Rapport

Créer un rapport court :

`RAPPORT ESSAI IMPLANTATION SONDE CO2 EN GAINE.md`

Utiliser comme base :

`MODELE RAPPORT ESSAI IMPLANTATION SONDE CO2 EN GAINE.md`

Il doit contenir :

- photos du montage ;
- fichiers CSV produits ;
- description de la gaine ;
- orientation du boîtier ;
- décision `ACCEPTÉE POUR BANC`, `SOUS RÉSERVE` ou `REFUSÉE` ;
- modifications CAO à prévoir.

## Effet sur la suite

Un refus bloque l'intégration mécanique de la sonde, mais ne bloque pas forcément les essais électroniques du lot 1.

Une acceptation pour banc n'autorise pas encore une commercialisation : il faudra ensuite traiter calibration, dérive, filtre, maintenance, nettoyage, CEM et conformité produit.
