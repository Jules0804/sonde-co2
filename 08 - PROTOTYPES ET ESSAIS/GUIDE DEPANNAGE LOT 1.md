# Guide dépannage lot 1

## Objet

Aider à diagnostiquer les problèmes courants pendant les essais du lot 1 :

- Wemos ESP32-C3 ;
- SEN0536 / SCD41 ;
- DFR0971 ;
- capture série CSV ;
- mesures au multimètre.

Rappel : pendant tout le lot 1, **aucun moteur** et **aucun 24 V** ne doivent être raccordés.

## 1. Aucun port COM visible

| Vérification | Action |
|---|---|
| Wemos branchée | Débrancher/rebrancher l'USB |
| Câble USB | Essayer un câble USB données, pas seulement charge |
| Script de listage | Lancer `.\lister-ports-serie.ps1` |
| Gestionnaire de périphériques | Vérifier si un périphérique apparaît avec erreur |
| Bouton BOOT | Selon la Wemos, maintenir BOOT pendant branchement si nécessaire |
| Pilote USB | Installer le pilote adapté si la carte utilise un pont USB-série |

Point d'arrêt : ne pas câbler les modules tant que la Wemos seule n'est pas visible et programmable.

## 2. Le sketch ne téléverse pas

| Symptôme | Piste |
|---|---|
| Port occupé | Fermer moniteur série, capture PowerShell ou autre IDE |
| Mauvaise carte | Vérifier sélection ESP32-C3 dans Arduino IDE |
| Erreur bootloader | Essayer BOOT + RESET selon la carte |
| Téléversement instable | Changer câble ou port USB |
| Carte inconnue | Remplir la fiche Wemos avant de poursuivre |

Point d'arrêt : ne pas modifier les GPIO SDA/SCL au hasard pour compenser un problème de téléversement.

## 3. Scan I²C : aucune adresse

| Vérification | Attendu |
|---|---|
| GND commun | Wemos, SEN0536 et/ou DFR0971 reliés au même GND |
| Alimentation module | 3,0 à 3,6 V pour le premier essai |
| SDA/SCL | Pas inversés |
| Broches carte | Cohérentes avec la Wemos exacte |
| Bus court | Fils courts, contacts fermes |
| Un seul module | Tester SEN0536 seul, puis DFR0971 seul |

Point d'arrêt : si SDA ou SCL dépasse 3,6 V, couper immédiatement.

## 4. Scan I²C : mauvaise adresse ou adresse instable

| Cas | Action |
|---|---|
| Adresse attendue absente | Revenir à un seul module |
| Adresse inconnue | Photographier le câblage, noter l'adresse, ne pas poursuivre |
| Adresse intermittente | Vérifier fils, breadboard, alimentation 3,3 V |
| DFR0971 pas à `0x5F` | Vérifier configuration d'adresse du module |
| SCD41 pas à `0x62` | Vérifier référence reçue et câblage |

Critère : le passage à l'essai CO₂/DAC exige `0x62` et/ou `0x5F` stables sur le banc actuel.

## 5. Lecture SCD41 : pas de données ou erreurs CRC

| Symptôme | Piste |
|---|---|
| `read_ok` toujours 0 | Capteur absent, commande refusée ou timing incorrect |
| `crc_co2` / `crc_temperature` / `crc_humidity` | Bus bruité, fil trop long, alimentation instable |
| Valeurs figées | Capteur pas en mesure périodique ou lecture trop tôt |
| Valeurs absurdes | Vérifier CSV, câblage, condensation, exposition directe |
| Redémarrage Wemos | Alimentation USB ou court-circuit intermittent |

Action : revenir au scan I²C, puis refaire l'essai court 30 min avant l'essai 24 h.

## 6. DAC DFR0971 : tension incorrecte

| Symptôme | Piste |
|---|---|
| 0 V partout | Module non détecté, plage 10 V non configurée, GND multimètre absent |
| Tension non monotone | Erreur de mesure, mauvais canal, câblage instable |
| Tension > 10,20 V | Classer `REFUSÉ`, ne pas raccorder de moteur |
| CH0 OK mais CH1 KO | Répéter sur l'autre canal, vérifier bornier |
| Tension lente ou instable | Attendre stabilisation, vérifier alimentation et multimètre |

Rappel : VOUT0/VOUT1 vont uniquement vers le multimètre pendant cet essai.

## 7. Capture CSV vide

| Vérification | Action |
|---|---|
| Bon port COM | Lancer `.\lister-ports-serie.ps1` |
| Moniteur série fermé | Fermer Arduino Serial Monitor |
| Baudrate | 115200 |
| Sketch chargé | Vérifier que le sketch imprime bien un en-tête |
| Durée | Utiliser au moins quelques minutes |
| Fichier ouvert dans Excel | Fermer Excel pendant la capture |

Point d'arrêt : ne pas valider un essai si le fichier CSV est vide ou sans en-tête.

## 8. Analyseur refuse le CSV

| Message probable | Cause |
|---|---|
| Colonnes absentes | Mauvais sketch ou fichier modifié |
| Pas assez de mesures | Durée trop courte |
| Taux invalide trop haut | Défaut lecture ou câblage |
| DAC non accepté | Mesures manquantes ou erreur > 0,10 V |

Action : conserver le CSV brut, créer une copie de travail, puis documenter l'écart dans le rapport.

## 9. Quand arrêter immédiatement

Arrêter l'essai si :

- odeur ;
- échauffement anormal ;
- fumée ;
- tension I²C > 3,6 V ;
- VOUT > 10,20 V ;
- redémarrages répétés ;
- composant ou câble abîmé ;
- doute sur le câblage.

## 10. Preuves à conserver

À chaque problème :

- photo du câblage ;
- capture du message série ;
- fichier CSV brut ;
- mesure multimètre ;
- action corrective ;
- décision `corrigé`, `sous réserve` ou `bloquant`.

Reporter les écarts dans :

`08 - PROTOTYPES ET ESSAIS\MODELE RAPPORT RECEPTION LOT 1.md`
