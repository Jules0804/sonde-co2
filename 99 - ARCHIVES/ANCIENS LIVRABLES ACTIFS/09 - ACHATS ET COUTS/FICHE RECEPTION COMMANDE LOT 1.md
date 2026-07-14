# Fiche réception commande lot 1

## Objet

Tracer la réception physique de la commande GoTronic du lot 1 avant tout câblage. Cette fiche complète le protocole d'essai : elle vérifie d'abord que le colis, les références et les preuves d'achat sont corrects.

## 1. Commande attendue

| Qté | Référence | Désignation | Prix observé |
|---:|---|---|---:|
| 1 | DFRobot SEN0536 | Module CO₂ / température / humidité SCD41 Gravity | 49,90 € TTC |
| 1 | DFRobot DFR0971 | Module DAC I²C deux sorties 0-10 V | 14,60 € TTC |

Articles à refuser ou mettre de côté s'ils apparaissent par erreur dans le lot 1 :

- écran ;
- moteur ;
- alimentation 24 V ;
- coffret ;
- registre ;
- débitmètre ;
- accessoire secteur.

## 2. Preuves à conserver

Créer, au moment de la réception, un dossier :

`08 - PROTOTYPES ET ESSAIS\PHOTOS LOT 1`

Photos minimales :

| Photo | Nom conseillé |
|---|---|
| Colis fermé | `LOT1_COLIS_FERME.jpg` |
| Étiquette transport | `LOT1_ETIQUETTE_TRANSPORT.jpg` |
| Contenu complet | `LOT1_CONTENU_COMPLET.jpg` |
| SEN0536 recto | `LOT1_SEN0536_RECTO.jpg` |
| SEN0536 verso | `LOT1_SEN0536_VERSO.jpg` |
| DFR0971 recto | `LOT1_DFR0971_RECTO.jpg` |
| DFR0971 verso | `LOT1_DFR0971_VERSO.jpg` |
| Câbles / accessoires fournis | `LOT1_ACCESSOIRES.jpg` |

Conserver aussi :

- facture PDF ;
- confirmation de commande ;
- date de réception ;
- éventuel bon de livraison.

Les documents commerciaux peuvent rester dans `09 - ACHATS ET COUTS` avec un nom clair, par exemple :

`FACTURE GOTRONIC LOT 1 AAAA-MM-JJ.pdf`

## 3. Contrôle visuel avant mise sous tension

| Point | Critère | Verdict |
|---|---|---|
| Référence SEN0536 présente | Marquage ou emballage cohérent | À statuer |
| Référence DFR0971 présente | Marquage ou emballage cohérent | À statuer |
| PCB fissuré | Aucun | À statuer |
| Connecteur arraché ou tordu | Aucun | À statuer |
| Composant déplacé | Aucun | À statuer |
| Traces de choc / humidité | Aucune | À statuer |
| Câbles fournis | Présents si annoncés | À statuer |
| Corps étranger sur capteur SCD41 | Aucun | À statuer |

Ne pas alimenter un module si un défaut physique est visible.

## 4. Informations à reporter dans le rapport de réception

Ces champs devront être recopiés dans :

`08 - PROTOTYPES ET ESSAIS\MODELE RAPPORT RECEPTION LOT 1.md`

| Champ | Valeur |
|---|---|
| Date réception | À renseigner |
| Fournisseur | GoTronic |
| N° commande | À renseigner |
| N° facture | À renseigner |
| Montant total TTC | À renseigner |
| SEN0536 reçu | Oui / Non |
| DFR0971 reçu | Oui / Non |
| Écart colis | Aucun / décrire |
| Décision colis | Conforme / Sous réserve / Refusé |

## 5. Décision de réception colis

- [ ] `CONFORME` — les deux références sont présentes, intactes et documentées ;
- [ ] `SOUS RÉSERVE` — colis reçu mais preuve, marquage ou accessoire à clarifier ;
- [ ] `REFUSÉ` — mauvaise référence, module endommagé ou doute de sécurité.

Décision motivée : à renseigner.

Nom et date : à renseigner.

## 6. Suite autorisée

Si la réception colis est `CONFORME`, passer à :

`08 - PROTOTYPES ET ESSAIS\PLAN PREMIER ALLUMAGE LOT 1 V0.1.md`

Si la réception est `SOUS RÉSERVE`, ne pas câbler avant analyse de l'écart.
