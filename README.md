# sonde-co2

# Régulation ventilation CO2

Projet de prototype puis produit professionnel pour mesurer le CO2 d'une salle de réunion, piloter des volets motorisés et fournir une interface locale sur téléphone.

## État court

- Carte actuelle : Wemos S2 Mini validée, flashable avec PlatformIO.
- Interface embarquée : Wi-Fi AP + page web locale + connexion installateur testés.
- Commande à passer : sonde CO2 DFRobot SEN0536 + DAC 0-10 V DFRobot DFR0971.
- Prochaine étape matérielle : réception, scan I2C, lecture CO2, test DAC au multimètre.
- Wi-Fi cible produit : désactivé par défaut, activé par bouton service.

## Dossiers à lire en priorité

- `00 - PILOTAGE DU PROJET` : suivi, décisions, plan.
- `04 - ELECTRONIQUE ET CABLAGE` : câblage Wemos, sonde et DAC.
- `06 - LOGICIEL EMBARQUE` : firmware, tests PlatformIO, serveur web embarqué.
- `08 - PROTOTYPES ET ESSAIS` : protocoles de réception et dépannage.
- `09 - ACHATS ET COUTS` : panier et budget.

## Règle de lecture

Les documents actifs restent dans les dossiers principaux. Les anciennes études et brouillons sont conservés dans `99 - ARCHIVES` pour ne pas polluer la lecture.

