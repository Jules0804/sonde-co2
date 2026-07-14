# Architecture logiciel embarqué v0.1

## 1. Objectif

Définir l'organisation du futur firmware ESP32 avant le branchement du lot 1. Le simulateur JavaScript reste la référence de comportement pour la régulation ; le firmware devra reproduire les mêmes règles et passer les mêmes scénarios.

## 2. Blocs logiciels

| Bloc | Responsabilité | Période indicative |
|---|---|---:|
| `sensor_co2` | Lecture SCD41, horodatage, contrôle de plage et diagnostic I²C | 5 s |
| `regulation` | Filtrage, PI, limites, rampes et consigne de sécurité | 1 s |
| `output_0_10v` | Conversion pour le DFR0971, saturation et test de cohérence | 1 s |
| `state_machine` | Priorités, modes AUTO/SERVICE/TEST/DÉFAUT et temporisations | 100 ms |
| `config_store` | Paramètres persistants versionnés, CRC et copie de secours | À la modification |
| `history` | Échantillonnage CO₂, consigne, état et défauts | 60 s + événements |
| `local_api` | API HTTP locale authentifiée pour l'application | À la demande |
| `wifi_service` | Point d'accès temporaire, arrêt automatique et reconnexion locale | À la demande |
| `watchdog` | Surveillance des tâches critiques et redémarrage contrôlé | Continu |

## 3. Règles de sûreté

- La sortie demandée est 100 % au démarrage jusqu'à validation des paramètres et de la sonde.
- Une lecture absente, hors plage ou trop ancienne provoque l'état de défaut critique et une demande d'ouverture à 100 %.
- La perte du Wi-Fi, de l'historique ou de l'application ne perturbe pas la régulation locale.
- Un test manuel est temporisé à 10 minutes maximum puis retourne automatiquement en AUTO.
- Les paramètres critiques sont bornés avant enregistrement et relus après écriture.
- Le watchdog ne doit jamais dépendre du serveur web.

## 4. Données persistantes

| Paramètre | Défaut initial | Bornes proposées |
|---|---:|---:|
| Consigne CO₂ | 1000 ppm | 800–1400 ppm |
| Sortie minimale | 20 % | 0–80 % |
| Sortie maximale | 100 % | 50–100 % |
| Alarme CO₂ | 1500 ppm | 1200–2500 ppm |
| Temporisation alarme | 60 s | 10–600 s |
| Temporisation test | 600 s | 30–600 s |
| Période historique | 60 s | 10–300 s |

Les bornes sont provisoires et seront figées après essais aérauliques et essais sur site.

La rétention, les formats compacts, l'horodatage hors Internet et le journal d'événements sont définis dans `SPECIFICATION HISTORIQUE ET JOURNAL V0.1.md`.

Le format, l'alternance des deux copies et les comportements de corruption sont définis dans `SPECIFICATION STOCKAGE CONFIGURATION V0.1.md`. La révision retournée par l'API correspondra à la génération persistante ; une écriture fondée sur une ancienne révision est refusée.

## 5. Contrat matériel du lot 1

### SCD41

- bus I²C ;
- adresse attendue `0x62` ;
- période nominale de mesure : 5 s ;
- mesure valide provisoire : 350 à 5000 ppm ;
- chaque échantillon transporte un compteur ou un horodatage de fraîcheur indépendant de la valeur mesurée.

### DFR0971

- bus I²C partagé ;
- plage configurée à 0–10 V ;
- voie 0 utilisée pour la consigne principale ;
- voie 1 réservée au banc, à une mesure redondante ou à une seconde zone ;
- saturation logicielle stricte entre 0 et 100 %.

## 6. Séquence de démarrage

1. Initialiser le watchdog et imposer la demande de sécurité.
2. Charger les copies A/B ; utiliser la génération valide la plus récente, ou rester ouvert à 100 % si aucune copie non vierge n'est saine.
3. Initialiser I²C, détecter le SCD41 et le DFR0971.
4. Vérifier plusieurs mesures CO₂ valides pendant au moins 15 secondes.
5. Passer en AUTO ou rester en défaut critique.
6. Activer le Wi-Fi uniquement sur demande locale ou pendant la mise en service.

## 7. Stratégie de tests

- tests unitaires de la régulation avec les scénarios du simulateur ;
- tests de pilotes avec doublures logicielles avant réception du matériel ;
- essais de défaut : sonde débranchée, I²C bloqué, valeur hors plage, redémarrage et paramètres corrompus ;
- mesure réelle de 0, 2, 5, 8 et 10 V au multimètre ;
- endurance minimale de 24 h avant passage au lot suivant.

## 8. Décisions encore ouvertes

- carte ESP32 exacte et brochage ;
- environnement de compilation final ;
- mécanisme de mise à jour locale signé ;
- capacité et support de stockage de l'historique ;
- besoin réel de retour de position des volets.
