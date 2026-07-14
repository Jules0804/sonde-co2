# Cible Wemos S2 Mini v0.1

## Choix du prototype

La carte physiquement disponible est une **Wemos S2 Mini V1.0.0** observée sur la photo fournie par Jules le 28 juin 2026. La cible logicielle du prototype devient donc `esp32s2`.

Cette décision concerne uniquement le prototype sur table. Pour une version industrialisée, la carte de développement sera remplacée par une carte dédiée ou un module radio choisi plus tard.

## Marquages observés sur la carte

| Élément | Relevé actuel |
|---|---|
| Marque | WEMOS.CC |
| Modèle imprimé | S2 Mini |
| Version imprimée | V1.0.0 |
| Famille MCU | ESP32-S2 |
| Connecteur | USB-C à confirmer physiquement côté face avant |
| Broches sérigraphiées visibles | `1/EN`, `2/3`, `4/5`, `6/7`, `8/9`, `10/11`, `13/12`, `14/3V3`, `VBUS/15`, `GND/GND`, `16/17`, `18/21`, `33/34`, `35/36`, `37/38`, `39/40` |

## Compatibilité fonctionnelle initiale

| Besoin | Interface | Faisabilité initiale |
|---|---|---|
| SCD41 / SEN0536 | I²C | Oui, après choix et test SDA/SCL |
| DFR0971 | I²C partagé | Oui, adresse distincte à vérifier par scan |
| Bouton service | Entrée numérique | Oui, GPIO à choisir après essai de démarrage |
| Voyant état | LED intégrée ou sortie dédiée | À identifier sur la carte |
| Wi-Fi point d'accès local | Radio intégrée | Oui |
| Historique et PWA | Flash carte à mesurer | Taille réelle à confirmer avec `esptool.py flash_id` |

## Points critiques avant câblage

- ne plus utiliser les hypothèses ESP32-C3 pour le brochage ;
- ne figer aucun GPIO tant que la carte n'a pas été testée seule ;
- confirmer la taille de flash réelle ;
- confirmer les broches I²C utilisables avec un scan Wemos seule puis modules raccordés ;
- vérifier que les lignes I²C restent à 3,3 V ;
- garder le 24 V et les moteurs hors banc pendant le lot 1.

## Cible logicielle provisoire

```powershell
idf.py set-target esp32s2
```

Le plan de partitions 4 Mo reste provisoire. Il n'est pas encore une preuve que la carte possède exactement 4 Mo utilisables ni que la PWA finale tiendra dans l'image firmware.

## Critère de validation de cette cible

La cible Wemos S2 Mini sera considérée comme validée pour le prototype seulement quand :

1. le port série Windows est identifié ;
2. `esptool.py chip_id` confirme ESP32-S2 ;
3. `esptool.py flash_id` relève la flash réelle ;
4. le scan I²C Wemos seule ne remonte aucune adresse inattendue ;
5. les broches SDA/SCL choisies détectent ensuite `0x62` pour le SCD41 et `0x58` pour le DFR0971.

Aucun numéro GPIO n'est figé avant cette identification.
