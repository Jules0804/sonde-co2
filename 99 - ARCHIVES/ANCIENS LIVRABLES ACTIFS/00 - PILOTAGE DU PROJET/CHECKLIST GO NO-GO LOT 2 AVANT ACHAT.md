# Checklist go/no-go lot 2 avant achat

## Objet

Cette checklist décide si le **lot 2 moteurs / alimentation 24 V / coffret / protections** peut être acheté. Elle évite de commander un moteur, une alimentation ou un coffret avant d'avoir prouvé les points critiques du banc.

Statut actuel : **NO-GO**.

Le lot 2 reste non autorisé tant que les critères bloquants ne sont pas validés.

## 1. Prérequis lot 1

| Critère | Preuve attendue | Statut |
|---|---|---|
| Lot 1 reçu | Facture + photos modules | À faire |
| Wemos ESP32-C3 identifiée | Fiche identification remplie | À faire |
| Scan I²C SEN0536 seul | Adresse `0x62` vue | À faire |
| Scan I²C DFR0971 seul | Adresse `0x58` vue | À faire |
| Scan I²C deux modules | `0x58` et `0x62` ensemble | À faire |
| Tensions 3,3 V / SDA / SCL | 3,0 à 3,6 V | À faire |
| Rapport réception lot 1 | Modèle rempli et verdict | À faire |

Décision : **NO-GO** tant que le lot 1 n'est pas qualifié.

## 2. Registre et mécanique

| Critère | Preuve attendue | Statut |
|---|---|---|
| Diamètre de banc choisi | DN200 recommandé ou DN250 justifié | À trancher |
| Registre réel identifié | Référence, photos, dimensions | À faire |
| Axe compatible moteur CVC | Forme et dimensions relevées | À faire |
| Rotation 90 degrés confirmée | Essai manuel / documentation | À faire |
| Couple moteur cohérent | Couple constructeur ou estimation prudente | À faire |
| Place disponible moteur | Photo + cote d'encombrement | À faire |

Décision : **NO-GO** tant que le registre réel et le couple ne sont pas confirmés.

## 3. Moteurs

| Critère | Preuve attendue | Statut |
|---|---|---|
| Architecture 24 V proportionnelle confirmée | Décision D-017 + comparaison lot 2 | Validé papier |
| Référence candidate | Siemens GDB161.1E ou alternative justifiée | Validé papier |
| Tarif professionnel demandé | Devis ou prix fournisseur daté | À faire |
| Disponibilité vérifiée | Stock / délai au moment achat | À faire |
| Retour U traité | Pas de mise en parallèle des retours | À intégrer |
| Quantité du banc | 1, 2 ou 6 moteurs explicitement décidés | À trancher |

Décision : **NO-GO** tant que le prix/date/quantité ne sont pas figés.

## 4. Alimentation 24 V

| Critère | Preuve attendue | Statut |
|---|---|---|
| Dimensionnement six moteurs | Calcul 39,69 W / 1,65 A avec marge | Validé papier |
| Alimentation candidate | 24 V, 60 W, 2,5 A type HDR-60-24 ou équivalent | Validé papier |
| Courant d'appel | Fiche alimentation ou essai à réception | À vérifier |
| Échauffement coffret | Essai lot 2 fermé | À faire après achat |
| Chute tension moteur éloigné | Mesure sur banc | À faire après achat |

Décision : **GO papier partiel**, mais achat lié au choix coffret/protections.

## 5. Commande 0-10 V

| Critère | Preuve attendue | Statut |
|---|---|---|
| DAC à vide monotone | Mesures 0/2/5/8/10 V | À faire lot 1 |
| Erreur à vide | ≤ 0,10 V | À faire lot 1 |
| Charge équivalente six entrées | Essai 10 kΩ | À faire lot 1 |
| Chute en charge | ≤ 0,05 V | À faire lot 1 |
| Sortie max | ≤ 10,20 V | À faire lot 1 |
| Court-circuit sortie | Comportement sûr à documenter | À faire avant produit |

Décision : **NO-GO** tant que l'essai 10 kΩ n'est pas réussi.

## 6. Coffret, protections et connectique

| Critère | Preuve attendue | Statut |
|---|---|---|
| Coffret isolant adapté | Référence + dimensions internes | À faire |
| Volume suffisant | 12 modules rail DIN minimum ou équivalent justifié | À faire |
| Séparation secteur / 24 V / logique | Implantation papier | À faire |
| Protection entrée 230 V | Valeur et type choisis | À faire |
| Protections départs moteurs | F2 à F7 dimensionnées ou stratégie justifiée | À faire |
| Bornier X1 secteur | Incompatible basse tension | À choisir |
| Borniers X2 à X7 moteurs | G/G0/Y, éventuellement U | À choisir |
| Presse-étoupes / passage câbles | Nombre et diamètres | À faire |

Décision : **NO-GO** tant que les références et protections ne sont pas choisies.

## 7. Go/no-go synthèse

| Domaine | Verdict actuel |
|---|---|
| Lot 1 réception | NO-GO |
| Registre / mécanique | NO-GO |
| Moteurs | NO-GO |
| Alimentation 24 V | GO papier partiel |
| Commande 0-10 V | NO-GO |
| Coffret / protections | NO-GO |

## 8. Conditions minimales pour passer en GO achat lot 2

Le lot 2 peut passer en **GO achat** seulement si :

1. le lot 1 est reçu, câblé et qualifié ;
2. le scan I²C et les mesures DAC sont acceptés ;
3. l'essai charge 10 kΩ est accepté ;
4. le registre réel est choisi ou relevé ;
5. le couple moteur est cohérent avec le registre ;
6. le nombre de moteurs à acheter est fixé ;
7. le prix et délai des moteurs sont revérifiés ;
8. le coffret et les protections sont sélectionnés ;
9. le budget lot 2 est soumis à validation ;
10. aucune commande n'est passée sans validation finale de Jules.

La qualification du lot 1 doit être formalisée dans :

`00 - PILOTAGE DU PROJET\REVUE FIN LOT 1 - PASSAGE LOT 2.md`

## 9. Prochaine action recommandée

Après réception du lot 1 :

1. remplir le rapport de réception ;
2. exécuter le scan I²C ;
3. mesurer le DAC à vide ;
4. réaliser l'essai charge 10 kΩ ;
5. relever ou choisir le registre DN200/DN250.

Pour préparer la collecte des prix et disponibilités du lot 2, utiliser :

`09 - ACHATS ET COUTS\MODELE DEMANDE DEVIS LOT 2.md`
