# Ordre d'exécution réception et essais lot 1

## Objet

Donner l'ordre pratique à suivre quand la commande lot 1 arrive. Ce document pointe vers les fiches détaillées, sans les remplacer.

Règle générale : **on ne raccorde jamais de moteur ni de 24 V pendant le lot 1**.

## Séquence complète

| Ordre | Action | Fichier à ouvrir | Point d'arrêt |
|---:|---|---|---|
| 1 | Réceptionner le colis | `09 - ACHATS ET COUTS\FICHE RECEPTION COMMANDE LOT 1.md` | Stop si mauvaise référence ou dégât |
| 2 | Photographier les modules | `08 - PROTOTYPES ET ESSAIS\PHOTOS LOT 1` | Stop si marquage illisible ou défaut visible |
| 3 | Identifier la Wemos S2 Mini | `06 - LOGICIEL EMBARQUE\firmware-esp32\FICHE IDENTIFICATION CARTE WEMOS S2 MINI.md` | Stop si carte non identifiée |
| 4 | Préparer les outils Arduino | `06 - LOGICIEL EMBARQUE\arduino-outils\README OUTILS ARDUINO LOT 1.md` | Stop si broches SDA/SCL incertaines |
| 5 | Identifier et capturer le port série | `08 - PROTOTYPES ET ESSAIS\README CAPTURE SERIE CSV LOT 1.md` | Stop si port COM indisponible |
| 6 | Premier scan I²C | `08 - PROTOTYPES ET ESSAIS\PLAN PREMIER ALLUMAGE LOT 1 V0.1.md` | Stop si `0x58` ou `0x62` manque |
| 7 | Essai CO₂ court | `08 - PROTOTYPES ET ESSAIS\PROTOCOLE ESSAI COURT SCD41 30 MIN V0.1.md` | Stop si pas de réaction plausible |
| 8 | Essai CO₂ long | `08 - PROTOTYPES ET ESSAIS\PROTOCOLE DE RECEPTION DU LOT 1.md` | Stop si analyseur refuse |
| 9 | Essai DAC à vide | `08 - PROTOTYPES ET ESSAIS\PROTOCOLE ESSAI DAC DFR0971 A VIDE V0.1.md` | Stop si > 10,20 V ou non-monotone |
| 10 | Essai charge 10 kΩ | `08 - PROTOTYPES ET ESSAIS\PROTOCOLE ESSAI CHARGE 0-10V SIX ENTREES V0.1.md` | Stop si chute/erreur hors seuil |
| 11 | Remplir le rapport | `08 - PROTOTYPES ET ESSAIS\MODELE RAPPORT RECEPTION LOT 1.md` | Stop si preuve manquante |
| 12 | Décider fin lot 1 | `00 - PILOTAGE DU PROJET\REVUE FIN LOT 1 - PASSAGE LOT 2.md` | Passage lot 2 seulement si revue validée |

## Fichiers de résultats à créer

| Fichier | Origine |
|---|---|
| `mesures_scd41_30min.csv` | essai court CO₂ |
| `mesures_scd41_24h.csv` | essai long CO₂ |
| `mesures_dac.csv` | essai DAC à vide |
| copie datée du CSV charge 10 kΩ | essai charge analogique |
| `RAPPORT RECEPTION LOT 1.md` | synthèse de réception |

## Commandes utiles

Depuis `08 - PROTOTYPES ET ESSAIS` :

```powershell
.\lister-ports-serie.ps1
.\capturer-serie-csv.ps1 -Port COM5 -Output .\mesures_scd41_30min.csv -DurationMinutes 30
node .\analyser-reception.mjs .\mesures_scd41_24h.csv
node .\analyser-reception.mjs .\mesures_dac.csv
node .\analyser-charge-analogique.mjs .\MODELE ESSAI CHARGE 0-10V SIX ENTREES.csv
```

Remplacer `COM5` par le port réel de la Wemos.

En cas de problème pendant l'une des étapes, utiliser :

`08 - PROTOTYPES ET ESSAIS\GUIDE DEPANNAGE LOT 1.md`

## Critères de passage vers lot 2

Le lot 2 ne peut pas être préparé tant que :

- la revue fin lot 1 n'est pas remplie ;
- le rapport de réception lot 1 n'est pas accepté ;
- la checklist go/no-go lot 2 reste en `NO-GO` sur les critères lot 1.

Même si le lot 1 est validé, l'achat lot 2 reste bloqué par les points non matériels du lot 1 : registre réel, couple moteur, coffret/protections, prix et validation finale de Jules.
