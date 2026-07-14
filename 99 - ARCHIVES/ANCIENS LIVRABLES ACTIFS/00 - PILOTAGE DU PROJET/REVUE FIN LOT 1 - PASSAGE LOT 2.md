# Revue fin lot 1 - passage lot 2

## Objet

Décider, après réception et essais du lot 1, si le projet peut préparer le lot 2 moteurs / alimentation 24 V / coffret / protections.

Cette revue ne remplace pas la checklist go/no-go lot 2. Elle clôture seulement la partie **électronique CO₂ + sortie 0-10 V** du lot 1.

L'ordre pratique des essais est défini dans :

`00 - PILOTAGE DU PROJET\ORDRE EXECUTION RECEPTION ET ESSAIS LOT 1.md`

Statut actuel : **À REMPLIR APRÈS ESSAIS**.

## 1. Documents à joindre

| Preuve | Fichier attendu | Statut |
|---|---|---|
| Réception colis | `09 - ACHATS ET COUTS\FICHE RECEPTION COMMANDE LOT 1.md` remplie | À faire |
| Photos lot 1 | `08 - PROTOTYPES ET ESSAIS\PHOTOS LOT 1` | À faire |
| Identification Wemos | `06 - LOGICIEL EMBARQUE\firmware-esp32\FICHE IDENTIFICATION CARTE WEMOS S2 MINI.md` remplie | À faire |
| Rapport réception lot 1 | `08 - PROTOTYPES ET ESSAIS\RAPPORT RECEPTION LOT 1.md` | À faire |
| CSV SCD41 court | `mesures_scd41_30min.csv` | À faire |
| CSV SCD41 24 h | `mesures_scd41_24h.csv` | À faire |
| CSV DAC à vide | `mesures_dac.csv` | À faire |
| CSV charge 10 kΩ | `MODELE ESSAI CHARGE 0-10V SIX ENTREES.csv` complété ou copie datée | À faire |

## 2. Critères de validation lot 1

| Critère | Verdict attendu | Résultat |
|---|---|---|
| Colis conforme | `CONFORME` | À statuer |
| Wemos identifiée | Référence, port COM, broches documentées | À statuer |
| Scan I²C Wemos seule | Aucune adresse inexpliquée | À statuer |
| Scan SCD41 seul | `0x62` | À statuer |
| Scan DFR0971 seul | `0x58` | À statuer |
| Scan deux modules | `0x58` et `0x62` | À statuer |
| Tension 3,3 V | 3,0 à 3,6 V | À statuer |
| SDA/SCL repos | 3,0 à 3,6 V | À statuer |
| Essai CO₂ court | Réaction plausible | À statuer |
| Essai CO₂ 24 h | Analyseur accepté | À statuer |
| DAC à vide | Analyseur accepté | À statuer |
| Charge analogique 10 kΩ | Analyseur accepté | À statuer |
| Aucun échauffement | Oui | À statuer |
| Aucun redémarrage spontané | Oui | À statuer |

## 3. Analyse d'écarts

| ID | Écart | Impact | Décision |
|---|---|---|---|
| L1-E01 | À renseigner ou supprimer | À classer | Corriger / Accepter sous réserve / Bloquant |

## 4. Décision de fin lot 1

- [ ] `PASSAGE LOT 2 AUTORISÉ POUR PRÉPARATION` — le lot 1 est validé, les preuves sont jointes, et le lot 2 peut être chiffré précisément.
- [ ] `PASSAGE LOT 2 SOUS RÉSERVE` — le lot 1 fonctionne, mais un écart doit être corrigé avant achat.
- [ ] `PASSAGE LOT 2 BLOQUÉ` — un défaut de mesure CO₂, de bus I²C, de DAC ou de sécurité empêche de poursuivre vers les moteurs.

Décision motivée : à renseigner.

Nom et date : à renseigner.

## 5. Effet sur la checklist lot 2

Si la décision est `PASSAGE LOT 2 AUTORISÉ POUR PRÉPARATION`, mettre à jour :

`00 - PILOTAGE DU PROJET\CHECKLIST GO NO-GO LOT 2 AVANT ACHAT.md`

Puis suivre :

`00 - PILOTAGE DU PROJET\FEUILLE DE ROUTE POST LOT 1 VERS LOT 2.md`

Les domaines suivants pourront passer de `NO-GO` à `VALIDÉ` ou `GO papier` selon les preuves :

- réception lot 1 ;
- scan I²C ;
- mesure CO₂ ;
- DAC à vide ;
- charge 0-10 V 10 kΩ.

Les domaines suivants resteront bloquants tant qu'ils ne sont pas traités :

- registre réel ;
- couple moteur ;
- prix moteur ;
- coffret et protections ;
- budget lot 2 ;
- validation finale de Jules.
