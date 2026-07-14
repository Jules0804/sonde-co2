# Portage firmware ESP32 — état v0.1

## Réalisé

- structure de projet ESP-IDF ;
- noyau de régulation C++ séparé des pilotes ;
- états démarrage, automatique, ouverture forcée et défaut ;
- défauts sonde absente, valeur hors plage et CO₂ élevé temporisé ;
- filtrage, PI, anti-saturation et rampes ;
- mode service temporisé indépendant, appui 3 s et invalidation de session préparés ;
- préparation OTA A/B, NVS, historique et coredump.
- génération de scénarios de régulation, service, stockage A/B et journaux, contrats matériels et modèles de référence, verrouillés par 54 tests JavaScript réussis.

## Non vérifié

- compilation C++ et ESP-IDF ;
- rejeu des vecteurs de référence par le noyau C++ ;
- compatibilité avec la carte possédée ;
- brochage ;
- consommation mémoire ;
- pilotes SCD41 et DFR0971 ;
- événements Wi-Fi réels, portail captif, serveur HTTP et voyant ;
- signature et chiffrement réels des mises à jour.

## Critère avant premier flash

Le modèle exact de la carte ESP32, sa tension logique, son alimentation et les broches disponibles doivent être relevés. Le firmware doit ensuite compiler sans avertissement bloquant, passer les tests hôte et démarrer avec les sorties déconnectées ou mesurées au multimètre.
