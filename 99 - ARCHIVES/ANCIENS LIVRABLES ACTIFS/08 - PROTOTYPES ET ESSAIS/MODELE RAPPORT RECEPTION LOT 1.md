# Modèle de rapport de réception du lot 1

## Identification

| Champ | Valeur |
|---|---|
| Date et heure | À renseigner |
| Opérateur | À renseigner |
| Fournisseur et commande | À renseigner |
| Wemos S2 Mini exacte | Voir la fiche d'identification de la carte |
| Port COM Windows | À renseigner |
| Broches SDA/SCL utilisées | À renseigner |
| Alimentation USB utilisée | À renseigner |
| Multimètre utilisé | Marque, modèle et n° si disponible |
| Sketch ou firmware d'essai | `scan_i2c_lot1.ino`, puis version à renseigner |

## Identification Wemos

| Contrôle | Valeur | Critère | Verdict |
|---|---|---|---|
| Photo recto | Nom du fichier | Marquages lisibles | À statuer |
| Photo verso | Nom du fichier | Marquages lisibles | À statuer |
| Référence exacte imprimée | À renseigner | Cohérente avec Wemos S2 Mini / ESP32-S2 | À statuer |
| Type USB | USB-C / autre | Documenté | À statuer |
| Port COM détecté | À renseigner | Stable | À statuer |
| Taille flash lue si disponible | À renseigner | 4 Mo supposés à confirmer | À statuer |
| LED / bouton BOOT / RESET | À renseigner | Documenté pour le firmware | À statuer |

## Réception documentaire et visuelle

| Élément | Référence/marquage | Révision/lot | Câble présent | État | Photo |
|---|---|---|---|---|---|
| Capteur CO₂ | SEN0536 | À relever | Oui / Non | Conforme / Écart | Nom du fichier |
| DAC 0–10 V | DFR0971 | À relever | Oui / Non | Conforme / Écart | Nom du fichier |

## Contrôles électriques avant scan

| Contrôle | Résultat | Critère | Verdict |
|---|---:|---:|---|
| Tension USB à vide | À relever | 5 V nominal | À statuer |
| Tension 3,3 V carte seule | À relever | 3,0 à 3,6 V | À statuer |
| Tension 3,3 V avec SEN0536 | À relever | 3,0 à 3,6 V | À statuer |
| Tension 3,3 V avec DFR0971 | À relever | 3,0 à 3,6 V | À statuer |
| Tension SDA au repos | À relever | 3,0 à 3,6 V | À statuer |
| Tension SCL au repos | À relever | 3,0 à 3,6 V | À statuer |

## Premier scan I²C

Utiliser d'abord :

`06 - LOGICIEL EMBARQUE\arduino-outils\scan_i2c_lot1\scan_i2c_lot1.ino`

| Configuration | Adresses vues | Capture / fichier | Critère | Verdict |
|---|---|---|---|---|
| Wemos seule | À renseigner | À joindre | Aucune adresse inconnue non expliquée | À statuer |
| SEN0536 seul | À renseigner | À joindre | `0x62` | À statuer |
| DFR0971 seul | À renseigner | À joindre | `0x58` par défaut | À statuer |
| SEN0536 + DFR0971 | À renseigner | À joindre | `0x58` et `0x62` | À statuer |

Arrêter l'essai avant tout test DAC ou 24 h si une adresse attendue manque, si une adresse inconnue apparaît, si la carte redémarre, si SDA/SCL dépasse 3,6 V ou si un composant chauffe.

## Essai SCD41 sur 24 heures

| Indicateur | Résultat | Critère | Verdict |
|---|---:|---:|---|
| Nombre attendu de mesures | À calculer | Durée / 5 s | À statuer |
| Nombre de mesures valides | À calculer | — | À statuer |
| Taux de lectures invalides | À calculer | < 0,1 % | À statuer |
| Plus longue interruption | À calculer | ≤ 15 s | À statuer |
| Redémarrages spontanés | À relever | 0 | À statuer |
| Réaction à l'occupation/aération | À décrire | Sens cohérent | À statuer |

Fichier de données : `mesures_scd41_24h.csv`.

Verdict JSON de `analyser-reception.mjs` : à joindre ou copier ici.

## Essai DFR0971

Renseigner les moyennes, erreurs maximales et résultats de redémarrage des deux canaux. Conserver toutes les mesures dans `mesures_dac.csv`.

Verdict JSON de `analyser-reception.mjs` : à joindre ou copier ici.

| Indicateur | CH0 | CH1 | Critère | Verdict |
|---|---:|---:|---:|---|
| Sortie maximale | À relever | À relever | ≤ 10,2 V | À statuer |
| Erreur absolue maximale | À calculer | À calculer | ≤ 0,10 V | À statuer |
| Monotonie | Oui / Non | Oui / Non | Oui | À statuer |
| État à la mise sous tension | À relever | À relever | Connu et sûr avant moteur | À statuer |
| Réaction à la perte I²C | À relever | À relever | Conforme à la stratégie documentée | À statuer |

## Essai charge analogique 10 kΩ

À exécuter seulement après acceptation des mesures à vide.

Fichier / protocole associé :

`08 - PROTOTYPES ET ESSAIS\PROTOCOLE ESSAI CHARGE 0-10V SIX ENTREES V0.1.md`

| Indicateur | CH0 | CH1 | Critère | Verdict |
|---|---:|---:|---:|---|
| Erreur chargée maximale | À calculer | À calculer | ≤ 0,10 V | À statuer |
| Chute en charge maximale | À calculer | À calculer | ≤ 0,05 V | À statuer |
| Monotonie chargée | Oui / Non | Oui / Non | Oui | À statuer |

## Écarts et actions

| ID | Écart observé | Gravité | Action | Responsable | Échéance | Statut |
|---|---|---|---|---|---|---|
| E-01 | À renseigner ou supprimer | À classer | À définir | À définir | À définir | Ouvert |

## Verdict

- [ ] `ACCEPTÉ` — tous les critères sont satisfaits ;
- [ ] `SOUS RÉSERVE` — aucun danger, mais un écart doit être résolu ;
- [ ] `REFUSÉ` — défaut physique, électrique ou fonctionnel bloquant.

Décision motivée : à renseigner.

Nom et date : à renseigner.
