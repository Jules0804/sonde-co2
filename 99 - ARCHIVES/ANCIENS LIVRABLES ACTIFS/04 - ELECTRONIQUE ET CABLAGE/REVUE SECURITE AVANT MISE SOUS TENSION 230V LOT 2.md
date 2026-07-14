# Revue sécurité avant mise sous tension 230 V lot 2

## Objet

Préparer la revue obligatoire avant toute mise sous tension secteur du futur lot 2.

Cette fiche ne donne pas l'autorisation de câbler ou d'alimenter le 230 V. Elle définit les conditions minimales à vérifier lorsque le coffret, l'alimentation 24 V, les protections et les borniers auront été choisis.

Statut actuel : **à remplir avant essai lot 2**.

## Prérequis

| Prérequis | Preuve attendue | Statut |
|---|---|---|
| Lot 1 qualifié | Revue fin lot 1 acceptée | À faire |
| Lot 2 autorisé | Checklist go/no-go validée par Jules | À faire |
| Schéma lot 2 à jour | Repères X/F/PS/M cohérents | À faire |
| Coffret choisi | Référence, dimensions, matière, IP | À faire |
| Protections choisies | Entrée 230 V et départs 24 V | À faire |
| Alimentation 24 V choisie | Fiche technique reçue | À faire |
| Plan de câblage imprimé ou disponible | Version datée | À faire |

## 1. Inspection mécanique du coffret

| Point | Critère | Verdict |
|---|---|---|
| Coffret fermé | Aucune borne secteur accessible utilisateur | À statuer |
| Fixation rail DIN / platine | Éléments maintenus mécaniquement | À statuer |
| Presse-étoupes | Câbles serrés, pas de traction directe | À statuer |
| Séparation interne | Secteur éloigné du 24 V et de la logique | À statuer |
| Repérage | X1, PS1, F1, F2... visibles | À statuer |
| Capot / porte | Fermeture possible sans écraser les fils | À statuer |

## 2. Classe électrique et terre

| Point | Critère | Verdict |
|---|---|---|
| Classe retenue | Classe II isolante ou classe I documentée | À statuer |
| PE si classe I | Continuité de terre à mesurer | À statuer |
| Parties métalliques accessibles | Reliées au PE ou absentes/accessibles isolées | À statuer |
| Alimentation | Fiche technique et marquage cohérents | À statuer |
| Vis / entretoises | Ne réduisent pas les distances secteur/TBTS | À statuer |

## 3. Protections et sectionnement

| Point | Critère | Verdict |
|---|---|---|
| Sectionnement local | Interrupteur ou moyen de coupure identifié | À statuer |
| Protection entrée | Calibre et type choisis selon alimentation | À statuer |
| Protection départs 24 V | Stratégie F2 à F7 définie | À statuer |
| Polarités | L/N/PE et +24/0 V repérés | À statuer |
| Arrêt d'urgence ou coupure accessible | Moyen de couper rapidement pendant l'essai | À statuer |

## 4. Contrôles hors tension

À faire avant tout branchement secteur :

| Mesure | Critère | Résultat |
|---|---|---|
| Continuité L-N | Pas de court-circuit franc | À relever |
| Continuité L-PE | Pas de court-circuit franc | À relever |
| Continuité N-PE | Selon architecture, pas de défaut inattendu | À relever |
| Continuité +24-0 V | Pas de court-circuit franc | À relever |
| Continuité 0-10 V vers 24 V | Aucune liaison directe | À relever |
| Continuité VOUT vers ESP32 | Aucune liaison directe | À relever |
| PE parties métalliques si classe I | Continuité conforme | À relever |

## 5. Première mise sous tension autorisable

La première mise sous tension lot 2, si autorisée, doit être limitée à :

1. coffret fermé ;
2. moteurs débranchés ;
3. logique basse tension débranchée si possible ;
4. alimentation 24 V seule ;
5. mesure du 24 V ;
6. coupure et contrôle d'absence d'échauffement/odeur ;
7. consignation dans le rapport.

Aucun moteur ne doit être raccordé lors du tout premier essai secteur.

## 6. Points d'arrêt immédiat

Arrêter et couper si :

- disjonction/fusible déclenché ;
- odeur, fumée ou bruit anormal ;
- échauffement rapide ;
- tension 24 V hors plage ;
- tension secteur présente sur une zone TBTS ;
- coffret impossible à fermer ;
- doute sur la classe électrique ou le PE.

## 7. Décision

- [ ] `MISE SOUS TENSION 230 V REFUSÉE`
- [ ] `MISE SOUS TENSION 230 V SOUS RÉSERVE`
- [ ] `MISE SOUS TENSION 230 V AUTORISÉE POUR ESSAI LIMITÉ PS1 SEULE`

Décision motivée : à renseigner.

Nom et date : à renseigner.

## 8. Suite

Si l'essai PS1 seule est accepté, créer ou compléter ensuite un protocole de mise sous tension progressive du lot 2 :

1. PS1 seule ;
2. PS1 + convertisseur 5 V ;
3. logique seule ;
4. DAC mesuré ;
5. un seul moteur ;
6. deux moteurs ;
7. défauts contrôlés ;
8. échauffement coffret fermé.
