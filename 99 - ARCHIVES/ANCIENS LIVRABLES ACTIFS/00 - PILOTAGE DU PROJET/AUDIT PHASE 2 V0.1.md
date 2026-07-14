# Audit de la phase 2 v0.1

**Date :** 21 juin 2026  
**Référence :** `PLAN DIRECTEUR V0.1 - REGULATION VENTILATION CO2.md`

## 1. Résultat

La phase 2 n'est pas encore clôturée dans son périmètre complet. Le sous-jalon autorisant le lot 1 est prêt, mais la sélection des moteurs, de leur alimentation, du coffret et des protections exige encore des preuves avant le lot 2.

## 2. Travaux du plan directeur

| Travail exigé | Preuve actuelle | État | Reste à faire |
|---|---|---|---|
| Comparer plusieurs sondes CO₂ NDIR | `COMPARAISON CAPTEURS CO2 V0.1.md` + matrice pondérée | Satisfait pour le banc | Qualification mécanique et métrologique produit |
| Comparer moteurs économiques, Belimo et Siemens | Comparaison v0.2 : Siemens, Belimo, Gruner, Nenutec et générique non traçable | Satisfait pour la sélection papier | Obtenir les tarifs professionnels et confirmer le couple avec le registre réel avant achat |
| Comparer 0–10 V, trois points et autres solutions | Matrice pondérée | Satisfait au niveau architecture | Essais matériels 0–10 V |
| Dimensionner l'alimentation pour six moteurs | Calcul versionné : 39,69 W / 1,65 A avec marge de 25 %, alimentation 60 W / 2,5 A | Satisfait sur papier | Mesurer courant de démarrage, déclassement, chute de tension et six charges réelles |
| Comparer les mesures de débit | `COMPARAISON MESURE DE DEBIT V0.1.md` + matrice | Satisfait pour report | Étalonnage en phase 7 |
| Comparer afficheurs, coffrets, connecteurs, protections | Afficheur étudié ; cadrage coffret/protections/connectique lot 2 créé | Partiellement satisfait | Choisir références réelles, dimensions, protections et implantation avant achat |
| Choisir le registre du banc et confirmer le couple | Cadrage DN200/DN250, calculateur et fiche de relevé créés | Partiellement satisfait | Relever ou acheter le registre réel, confirmer l'axe et le couple avant moteur |
| Acheter seulement le premier banc validé | Lot 1 et audit avant achat | Prêt, non exécuté | Confirmation finale puis commande |

## 3. Livrables du plan directeur

| Livrable exigé | Preuve | État |
|---|---|---|
| Matrice de choix pondérée | `MATRICE DE CHOIX PONDEREE PHASE 2 V0.1.md` | Créée |
| Nomenclature du prototype | `NOMENCLATURE DU PREMIER BANC V0.1.md` | Créée, encore provisoire pour le lot 2 |
| Nomenclature cible provisoire du produit | `NOMENCLATURE CIBLE PROVISOIRE PRODUIT V0.1.md` | Créée au niveau fonctionnel |
| Budget et liste d'achats | Budget, liste lot 1, comparaison fournisseurs | Satisfait pour le lot 1 ; incomplet pour le lot 2 |
| Checklist go/no-go lot 2 | `CHECKLIST GO NO-GO LOT 2 AVANT ACHAT.md` | Créée ; verdict actuel NO-GO |
| Traçabilité réception lot 1 | `FICHE RECEPTION COMMANDE LOT 1.md` | Créée ; à remplir à réception |

## 4. Validation de phase

| Critère | Verdict | Justification |
|---|---|---|
| Compatibilité électrique démontrée sur papier | Satisfait pour le lot 1 | Bus I²C, alimentation initiale 3,3 V, absence de 24 V/moteur et netlist fil à fil contrôlée par cinq tests |
| Composants disponibles | Satisfait pour le lot 1 | Stocks recontrôlés le 21 juin 2026 |
| Budget accepté | Satisfait pour le lot 1 | 69 € livré sous plafond de 90 € |
| Compatibilité et puissance du lot 2 | Partiellement satisfait | Architecture 24 V et alimentation 60 W démontrées ; charge six entrées définie à 10 kΩ avec analyseur, mais mesures réelles et couple restent ouverts |
| Coffret/protections/connecteurs | Partiellement satisfait | Cadrage fonctionnel créé ; références, dimensions, protections et implantation détaillée encore manquantes |

## 5. Décision de jalon

- **Sous-jalon P2A — électronique CO₂ + 0–10 V : AUTORISÉ**, achat non encore exécuté.
- **Phase 2 complète : NON CLÔTURÉE.**
- **Lot 2 moteurs/coffret : NON AUTORISÉ.**
- **Checklist lot 2 : NO-GO**, tant que lot 1, registre, charge 0–10 V, coffret et protections ne sont pas validés.

Ce classement permet de développer et tester le lot 1 sans prétendre que l'ensemble du matériel produit est sélectionné.

## 6. Chemin critique suivant

1. commander et réceptionner le lot 1 après confirmation finale ;
2. identifier la Wemos exacte et figer le brochage du banc ;
3. valider lecture SCD41 et sorties DFR0971 ;
4. choisir le registre du banc, confirmer le couple et demander le tarif professionnel Siemens/Nenutec ;
5. vérifier la charge de six entrées 0–10 V et comparer coffrets/protections ;
6. soumettre le lot 2 à validation.
