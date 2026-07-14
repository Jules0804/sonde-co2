# Fiche d'identification de la carte Wemos S2 Mini

## Pourquoi cette fiche est bloquante pour le câblage

La carte réellement disponible est une **Wemos S2 Mini V1.0.0**. Les hypothèses précédentes ESP32-C3 ne doivent plus servir au brochage.

La cible logicielle provisoire devient `esp32s2`, mais aucun GPIO du produit ne doit être figé avant les essais carte seule.

## Relevé visuel

| Champ | Valeur |
|---|---|
| Nom imprimé sur la face visible | S2 Mini |
| Version/révision imprimée | V1.0.0 |
| Marque imprimée | WEMOS.CC |
| Famille MCU | ESP32-S2 |
| Type de connecteur USB | À confirmer physiquement |
| Nombre de broches de chaque côté | À confirmer |
| Présence d'un bouton RESET | À confirmer |
| Présence d'un bouton utilisateur/BOOT | À confirmer |
| LED intégrée et couleur apparente | À confirmer |

Photo source actuelle :

- `WIN_20260628_11_35_22_Pro.jpg`

Photos projet à ajouter si possible, sans recadrer les bords de la carte :

- `WEMOS S2 MINI RECTO.jpg` ;
- `WEMOS S2 MINI VERSO.jpg` ;
- `WEMOS S2 MINI MARQUAGES.jpg` si les inscriptions ne sont pas lisibles sur les deux premières.

## Relevé USB et mémoire

À effectuer carte seule, sans aucun module raccordé :

| Contrôle | Résultat |
|---|---|
| Nom du port série sous Windows | À renseigner |
| VID/PID USB | À renseigner |
| Mode USB natif ou pont USB-série | À déterminer |
| Connexion avec `esptool` | Réussie / Échec |
| Type de puce lu | Doit indiquer ESP32-S2 |
| Taille de flash lue | À relever |
| Adresse MAC relevée | À conserver dans le dossier d'essai, ne pas graver comme secret |

Commandes indicatives une fois l'outil disponible :

```powershell
esptool.py --port COMx chip_id
esptool.py --port COMx flash_id
```

Remplacer `COMx` par le port réellement observé. Ne pas lancer d'effacement de flash pendant l'identification.

## Décision de brochage à prendre après identification

| Signal | GPIO retenu | Vérification exigée |
|---|---:|---|
| SDA | À décider | Broche disponible, pas de conflit USB/démarrage |
| SCL | À décider | Broche disponible, pas de conflit USB/démarrage |
| Bouton service | À décider | Appui 3 s testable, état sûr au démarrage |
| LED état | À décider | Polaritée ou contrôleur LED confirmés |

## Critère de clôture

La carte est considérée comme identifiée uniquement quand les photos recto/verso, la référence exacte, la taille de flash, le port USB et un premier scan I²C Wemos seule ont été relevés.

Le schéma de câblage pourra alors passer de « signaux fonctionnels » à « GPIO vérifiés ».
