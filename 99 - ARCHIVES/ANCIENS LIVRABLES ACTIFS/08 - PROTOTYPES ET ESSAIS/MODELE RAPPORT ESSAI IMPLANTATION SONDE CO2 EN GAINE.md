# Modèle rapport essai implantation sonde CO2 en gaine

## Identification

| Champ | Valeur |
|---|---|
| Date | À renseigner |
| Opérateur | À renseigner |
| Version boîtier / CAO | À renseigner |
| Sonde utilisée | SEN0536 / SCD41 |
| Carte contrôleur | Wemos ESP32-C3, référence exacte à renseigner |
| Sketch utilisé | `lecture_scd41_csv.ino` |
| Gaine / montage | DN200 / DN250 / autre à renseigner |
| Ventilation | Arrêtée / marche / débit estimé |

## Photos à joindre

| Photo | Fichier |
|---|---|
| Boîtier hors gaine | À renseigner |
| Carte SEN0536 montée | À renseigner |
| Passage câble | À renseigner |
| Boîtier monté sur gaine | À renseigner |
| Vue orientation flux d'air | À renseigner |
| État après essai | À renseigner |

## Fichiers CSV

| Séquence | Fichier | Durée | Statut |
|---|---|---:|---|
| Référence hors gaine avant | `mesures_scd41_reference_ambiante.csv` | 10 min | À statuer |
| Gaine stable | `mesures_scd41_gaine_30min.csv` | 30 min | À statuer |
| Réponse variation CO₂ | `mesures_scd41_gaine_reponse.csv` | 30 min mini | À statuer |
| Référence hors gaine retour | `mesures_scd41_reference_retour.csv` | 10 min | À statuer |

## Observations mécaniques

| Point | Observation | Verdict |
|---|---|---|
| Fixation sur gaine | À renseigner | OK / réserve / refus |
| Étanchéité apparente | À renseigner | OK / réserve / refus |
| Passage câble | À renseigner | OK / réserve / refus |
| Démontabilité | À renseigner | OK / réserve / refus |
| Vibration | À renseigner | OK / réserve / refus |
| Poussière / condensation | À renseigner | OK / réserve / refus |
| Contact carte / métal | À renseigner | OK / réserve / refus |

## Observations mesure CO2

| Point | Résultat | Critère | Verdict |
|---|---:|---|---|
| Lecture I²C persistante | À renseigner | Pas de défaut persistant | À statuer |
| Valeurs plausibles | À renseigner | Pas de saut impossible | À statuer |
| Réaction variation CO₂ | À renseigner | Sens cohérent | À statuer |
| Retour après aération | À renseigner | Baisse progressive | À statuer |
| Température | À renseigner | Pas d'échauffement boîtier évident | À statuer |
| Humidité | À renseigner | Pas de condensation | À statuer |

## Écarts et actions CAO

| ID | Écart | Action CAO / montage | Priorité | Statut |
|---|---|---|---|---|
| G-01 | À renseigner ou supprimer | À définir | À classer | Ouvert |

## Verdict

- [ ] `ACCEPTÉE POUR BANC` — implantation suffisante pour poursuivre les essais du banc ;
- [ ] `SOUS RÉSERVE` — implantation utilisable mais modification mineure requise ;
- [ ] `REFUSÉE` — implantation non exploitable ou risque matériel.

Décision motivée : à renseigner.

Nom et date : à renseigner.

## Effet sur la suite

Si le verdict est `ACCEPTÉE POUR BANC`, la CAO peut être conservée comme base d'essai.

Si le verdict est `SOUS RÉSERVE`, créer une révision de la CAO avant répétition de l'essai.

Si le verdict est `REFUSÉE`, ne pas utiliser cette implantation pour les essais de régulation en gaine.
