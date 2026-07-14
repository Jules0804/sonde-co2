# Analyse de risques préliminaire v0.1

## Méthode

Échelle initiale : gravité G de 1 à 4, probabilité P de 1 à 4, criticité C = G × P. Les valeurs seront réévaluées après les choix matériels et les premiers essais.

| ID | Danger ou défaillance | Effet | G | P initiale | C | Mesures prévues | Vérification |
|---|---|---:|---:|---:|---:|---|---|
| R-01 | Contact avec le 230 V | Électrisation, incendie | 4 | 2 | 8 | Enveloppe, isolation, protections, borniers inaccessibles sans outil, revue sécurité | Inspection, essais diélectriques et laboratoire |
| R-02 | Court-circuit d'un moteur/câble | Échauffement ou arrêt complet | 4 | 2 | 8 | Départs protégés, alimentation limitée, câbles spécifiés | Essais de défaut |
| R-03 | Alimentation sous-dimensionnée pour six moteurs | Redémarrages, perte de commande | 3 | 3 | 9 | Dimensionnement au courant de pointe et marge | Mesure avec six moteurs |
| R-04 | Sonde CO₂ absente ou erronée | Sous-ventilation | 3 | 3 | 9 | Diagnostic, plausibilité, valeur figée, ouverture 100 % sous tension | Injection de défauts |
| R-05 | Sonde dans une reprise non dédiée | Mesure non représentative | 3 | 2 | 6 | Domaine d'emploi explicite et contrôle de mise en service | Revue installation |
| R-06 | Débit minimal réglé trop bas | Non-conformité et confinement | 4 | 2 | 8 | Calcul par effectif/type de local, valeur protégée, rapport de mise en service | Mesure aéraulique |
| R-07 | CO₂ utilisé comme unique preuve réglementaire | Fausse déclaration de conformité | 3 | 3 | 9 | Notice distinguant débit légal et indicateur CO₂ | Revue documentaire |
| R-08 | Centrale incompatible avec les volets variables | Surpression, bruit, mauvais débits | 3 | 3 | 9 | Préconditions d'installation, mesure pression/débit, centrale à pression compatible | Essais sur site |
| R-09 | Microcontrôleur bloqué | Position figée | 3 | 2 | 6 | Watchdog logiciel et matériel, repli 10 V sous tension | Test de blocage |
| R-10 | Coupure totale | Volets immobilisés | 2 | 2 | 4 | Salle réputée inoccupée ; aucune fonction de sécurité revendiquée | Exigence documentée |
| R-11 | Sortie 0–10 V endommagée | Mauvaise position de tous les volets | 3 | 2 | 6 | Protection, mesure de retour tension, alarme | Court-circuit et surcharge |
| R-12 | Accès Wi-Fi non autorisé | Modification des réglages | 3 | 3 | 9 | Secret unique, mode service limité, aucune interface ouverte par défaut | Test d'intrusion ciblé |
| R-13 | Mise à jour interrompue | Produit inutilisable | 3 | 2 | 6 | Image signée, double partition, rollback | Coupure pendant mise à jour |
| R-14 | Mot de passe perdu sans récupération | Produit non maintenable | 2 | 3 | 6 | Procédure physique locale de récupération | Essai de remise à zéro |
| R-15 | Mesure ΔP hors plage ou tubes inversés | Débit faux | 2 | 3 | 6 | Diagnostic, détrompage, zéro et plage configurés | Essais de raccordement |
| R-16 | Condensation/poussière sur la sonde | Dérive ou panne | 3 | 2 | 6 | Probe adaptée, filtre/implantation, maintenance | Essais environnementaux |
| R-17 | Produit utilisé sur clapet incendie | Fonction de sécurité compromise | 4 | 2 | 8 | Exclusion visible dans notice et marquage | Revue documentaire |
| R-18 | Composant obsolète | Arrêt de production | 2 | 3 | 6 | Composants pérennes, seconde source, suivi PCN | Revue fournisseurs |
| R-19 | Données ou identifiants exposés | Risque cyber et réputation | 3 | 2 | 6 | Minimisation, stockage protégé, pas de cloud par défaut | Audit logiciel |
| R-20 | Absence de support de sécurité | Vulnérabilités non corrigées | 3 | 3 | 9 | Politique de support, canal de signalement, mises à jour signées | Audit CRA/RED |

## Risques prioritaires du jalon 1

Les risques R-01, R-03, R-04, R-06, R-07, R-08, R-12 et R-20 doivent influencer la conception avant le choix définitif de la carte et du coffret.

