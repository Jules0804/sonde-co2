# Machine d'états fonctionnelle v0.1

## 1. États principaux

Pour l'implémentation, le service Wi-Fi est une machine d'états **orthogonale** à la régulation. L'activation radio ne remplace donc jamais l'état `AUTO`, `DEGRADE_DEBIT` ou `DEFAUT_CRITIQUE`. Le tableau ci-dessous reste une vue fonctionnelle destinée à l'utilisateur ; le logiciel sépare les états de commande des volets et les états `OFF/STARTING/ACTIVE/STOPPING/FAULT` de la radio.

| État | Fonction | Sortie volets | Wi-Fi |
|---|---|---|---|
| HORS_TENSION | Aucun fonctionnement | Non garantie | Inactif |
| DEMARRAGE | Autotest, chargement des paramètres | 100 % provisoire ou valeur sûre à confirmer | Inactif |
| AUTO | Régulation CO₂ normale | Minimum à 100 % | Inactif par défaut |
| SERVICE | Mise en service et diagnostic | Régulation maintenue sauf test explicite | Actif temporairement |
| TEST_ACTIONNEURS | Test manuel contrôlé | Consigne de test | Actif |
| FORCE_OUVERT | Commande manuelle ou défaut | 100 % | Selon contexte |
| DEGRADE_DEBIT | Capteur débit indisponible | Régulation CO₂ avec minimum en pourcentage | Inactif |
| DEFAUT_CRITIQUE | Sonde CO₂ ou logique invalide | 100 % | Disponible pour diagnostic si sûr |
| MISE_A_JOUR | Installation d'un firmware | Position sûre définie avant mise à jour | Actif |
| RECUPERATION | Firmware principal invalide | 100 % si le chemin matériel fonctionne | Actif local limité |

## 2. Transitions essentielles

```text
HORS_TENSION -> DEMARRAGE
DEMARRAGE -> AUTO                 si autotest valide
DEMARRAGE -> DEFAUT_CRITIQUE      si sonde/paramètres critiques invalides
AUTO + WIFI_OFF -> AUTO + WIFI_ACTIVE       sur action physique locale validée
WIFI_ACTIVE -> WIFI_OFF                      à expiration ou fermeture volontaire
AUTO + WIFI_ACTIVE -> TEST_ACTIONNEURS       après authentification et confirmation locale
TEST_ACTIONNEURS -> AUTO                     fin du test ou temporisation, quel que soit l'état radio
AUTO -> FORCE_OUVERT              commande autorisée
AUTO -> DEGRADE_DEBIT             perte capteur débit seulement
AUTO -> DEFAUT_CRITIQUE           perte CO₂, watchdog ou incohérence critique
DEGRADE_DEBIT -> AUTO             capteur rétabli et validé
DEFAUT_CRITIQUE -> AUTO           défaut disparu + temporisation + validation
SERVICE -> MISE_A_JOUR            fichier authentique et préconditions valides
MISE_A_JOUR -> DEMARRAGE          succès
MISE_A_JOUR -> RECUPERATION       échec du nouveau firmware
RECUPERATION -> DEMARRAGE         rollback réussi
```

## 3. Priorité des commandes

Ordre de priorité, de la plus forte à la plus faible :

1. repli matériel indépendant ;
2. défaut critique ;
3. mode récupération/mise à jour ;
4. ouverture forcée ;
5. test actionneurs temporisé ;
6. régulation automatique ;
7. demandes GTB futures.

Une commande future de GTB ne pourra donc jamais annuler silencieusement un défaut critique ou le minimum hygiénique.

## 4. Classification initiale des défauts

### Critiques — ouverture 100 %

- sonde CO₂ absente, incohérente ou figée ;
- paramètres de sécurité invalides sans copie saine ;
- blocage logiciel détecté par watchdog ;
- CO₂ supérieur au seuil d'alarme pendant la durée définie ;
- impossibilité de calculer une consigne sûre.

### Non critiques — fonctionnement dégradé

- capteur de débit absent ou défaillant ;
- historique plein ou indisponible ;
- afficheur en panne ;
- Wi-Fi indisponible hors mise en service ;
- perte de retour de position optionnel.

## 5. Règles de test manuel

- durée maximale proposée : 10 minutes ;
- retour automatique en AUTO ;
- affichage clair du mode test ;
- impossibilité de laisser involontairement un volet fermé après déconnexion du téléphone ;
- journalisation du début, de la consigne et de la fin du test.

## 6. Paramètres à figer par essais

- durée d'autotest ;
- position pendant démarrage et mise à jour ;
- temporisation de défaut sonde ;
- seuil et durée de CO₂ élevé ;
- vitesse maximale de variation des volets ;
- durée du mode service et du test ;
- conditions de retour automatique après défaut.
