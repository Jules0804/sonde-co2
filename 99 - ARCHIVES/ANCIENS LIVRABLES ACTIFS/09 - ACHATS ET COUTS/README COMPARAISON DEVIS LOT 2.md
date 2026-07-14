# README comparaison devis lot 2

## Objet

Comparer les réponses fournisseurs du lot 2 de façon structurée avant toute décision d'achat.

Fichier à remplir :

`TABLEAU COMPARAISON DEVIS LOT 2.csv`

Ce tableau est lié au modèle de demande :

`MODELE DEMANDE DEVIS LOT 2.md`

## Familles à comparer

| Famille | Exemples |
|---|---|
| moteur | Siemens GDB161.1E, Nenutec, Belimo ou équivalent |
| alimentation_24v | alimentation rail DIN 24 V, 60 W mini |
| convertisseur_5v | 24 V vers 5 V, 15 W mini |
| coffret | coffret isolant rail DIN, 12 modules mini ou équivalent |
| protection_entree | fusible/disjoncteur entrée 230 V |
| protection_moteur | protections départs moteurs 24 V |
| bornier | X1, X2 à X7, X8, X9 |
| presse_etoupe | entrées câbles |

## Règles de décision

Une ligne ne peut pas être retenue si :

- la fiche technique est absente ;
- la compatibilité 24 V est incertaine pour un moteur ;
- la compatibilité 0/2-10 V est incertaine pour un moteur ;
- le fournisseur ou la marque n'est pas traçable ;
- le prix ou le délai n'est pas daté ;
- la référence proposée ne correspond pas au besoin.

## Scores indicatifs

Les scores 0 à 5 servent à comparer, pas à remplacer le jugement technique.

| Score | Sens |
|---:|---|
| 0 | inacceptable / absent |
| 1 | très faible |
| 2 | faible |
| 3 | acceptable |
| 4 | bon |
| 5 | excellent |

## Décisions possibles

Dans la colonne `decision`, utiliser :

- `retenu_pour_budget` ;
- `a_clarifier` ;
- `rejete` ;
- `alternative`.

## Suite après remplissage

Après réception des devis et remplissage du tableau, mettre à jour :

- `COMPARAISON ACTIONNEURS ET DIMENSIONNEMENT LOT 2 V0.2.md` ou version suivante ;
- `CHECKLIST GO NO-GO LOT 2 AVANT ACHAT.md` ;
- `BUDGET DU PREMIER BANC V0.1.md` ou version suivante ;
- `AUDIT PHASE 2 V0.1.md`.

L'achat reste interdit sans validation finale de Jules.
