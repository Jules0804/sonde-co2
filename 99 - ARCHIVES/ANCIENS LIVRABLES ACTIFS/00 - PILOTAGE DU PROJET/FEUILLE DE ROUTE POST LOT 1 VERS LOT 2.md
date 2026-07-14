# Feuille de route post lot 1 vers lot 2

## Objet

Définir l'enchaînement à suivre après les essais du lot 1 pour préparer un prototype motorisé sans brûler les étapes.

Cette feuille de route ne donne pas le droit d'acheter le lot 2. Elle décrit les travaux à faire avant de demander la validation du lot 2.

## Condition de départ

La feuille de route ne démarre réellement que lorsque :

- le lot 1 est reçu ;
- la revue fin lot 1 est remplie ;
- les essais CO₂ et DAC sont acceptés ou classés avec écarts maîtrisés ;
- la checklist go/no-go lot 2 est mise à jour.

Document de départ :

`00 - PILOTAGE DU PROJET\REVUE FIN LOT 1 - PASSAGE LOT 2.md`

## Étapes

| Étape | Travail | Livrable | Critère de validation |
|---:|---|---|---|
| P2B-01 | Clôturer la réception lot 1 | Rapport réception lot 1 rempli | Verdict accepté ou sous réserve non bloquante |
| P2B-02 | Relever ou choisir le registre | Fiche registre/gaine remplie | DN, axe, rotation et encombrement documentés |
| P2B-03 | Confirmer le couple moteur | Note de cohérence registre / moteur | 5 Nm acceptable ou autre couple justifié |
| P2B-04 | Demander les devis lot 2 | Modèle demande devis envoyé / rempli | Prix, délais et fiches reçus |
| P2B-05 | Comparer les devis | Tableau comparaison devis lot 2 | Candidats retenus/rejetés justifiés |
| P2B-06 | Mettre à jour le budget | Budget lot 2 ou budget banc révisé | Total TTC et réserve connus |
| P2B-07 | Choisir coffret/protections | Note coffret/protections révisée | Références et implantation papier |
| P2B-08 | Mettre à jour schéma électrique | Schéma lot 2 révisé | Repères X/F/PS/M cohérents |
| P2B-09 | Revue sécurité avant 230 V | `04 - ELECTRONIQUE ET CABLAGE\REVUE SECURITE AVANT MISE SOUS TENSION 230V LOT 2.md` | Points secteur relus avant essai |
| P2B-10 | Soumettre lot 2 | Checklist go/no-go lot 2 | Validation finale de Jules requise |

## Points bloquants connus

| Blocage | Pourquoi c'est bloquant | Comment le lever |
|---|---|---|
| Registre réel absent | Le couple moteur dépend du registre | Remplir la fiche registre/gaine |
| Wemos non identifiée | Les GPIO ne peuvent pas être figés | Remplir la fiche Wemos |
| Charge 0-10 V non testée | Six entrées moteur en parallèle restent une hypothèse | Essai 10 kΩ accepté |
| Coffret non choisi | Impossible de valider protections et implantation | Comparer références coffret/protections |
| Devis moteur absent | Budget lot 2 non fiable | Utiliser le modèle demande devis |
| Validation Jules absente | Achat non autorisé | Soumettre la checklist go/no-go |

## Critère de sortie

Cette feuille de route est terminée lorsque le lot 2 dispose de :

1. références candidates ;
2. prix et délais datés ;
3. budget TTC ;
4. schéma électrique révisé ;
5. registre/couple cohérents ;
6. coffret/protections choisis ;
7. checklist go/no-go à jour ;
8. validation finale de Jules.

Tant que ces huit points ne sont pas réunis, le lot 2 reste en préparation.
