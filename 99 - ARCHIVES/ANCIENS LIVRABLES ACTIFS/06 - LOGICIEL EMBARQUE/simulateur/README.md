# Simulateur de régulation CO₂

Modèle exécutable sans ESP32 ni matériel. Il sert à tester la logique avant son portage en C++ embarqué.

## Fonctions couvertes

- cible CO₂ de 1 000 ppm ;
- sortie minimale réglable ;
- filtre de mesure ;
- régulation PI lente ;
- limitation de vitesse de commande ;
- démarrage ouvert ;
- ouverture 100 % sur défaut capteur, dépassement persistant ou commande forcée ;
- anti-saturation de l'intégrale.

## Exécution

```powershell
node --test --test-isolation=none test/controller.test.js
node src/scenario.js
```

Le fichier `resultats/scenario_reunion.csv` contient un scénario de deux heures.

Sous l'environnement de travail actuel, `--test-isolation=none` évite la création de processus enfants interdite par le bac à sable.

## Limites

- coefficients provisoires à régler sur le banc ;
- dynamique réelle du CO₂ et du réseau non encore modélisée ;
- pas encore de capteur de débit ;
- pas encore de pilotes SCD41/DFR0971 ;
- le modèle sera porté vers le firmware ESP32 après identification exacte de la carte.
