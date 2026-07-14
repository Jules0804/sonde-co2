# Plan de tests hôte C++ v0.1

## Objectif

Prouver que le noyau C++ du firmware reproduit la logique de référence avant de le connecter aux pilotes matériels.

## Vecteurs de référence

Le fichier `vectors/controller_vectors.json` est généré par le simulateur JavaScript et contient, pour chaque pas de temps :

- les entrées CO₂, horodatage et ouverture forcée ;
- l'état attendu ;
- le défaut attendu ;
- la sortie attendue ;
- la mesure filtrée attendue.

Scénarios obligatoires :

1. démarrage puis passage en AUTO ;
2. montée du CO₂ et augmentation de la sortie ;
3. perte prolongée de la sonde ;
4. valeur hors plage ;
5. ouverture forcée ;
6. alarme CO₂ élevé temporisée.

Le composant `service_mode` devra aussi couvrir :

7. aucun déclenchement avant 3 000 ms d'appui continu ;
8. une seule demande d'activation par appui jusqu'au relâchement ;
9. fenêtre active de 15 minutes sans prolongation implicite ;
10. invalidation de la génération de session à la désactivation ;
11. horodatage décroissant sans déclenchement intempestif ;
12. indépendance entre mode service et noyau de régulation.

## Critère de réussite futur

Un exécutable de test C++ devra charger ces vecteurs et obtenir :

- égalité exacte des états et défauts ;
- écart de sortie inférieur ou égal à 0,01 point de pourcentage ;
- écart de filtre inférieur ou égal à 0,1 ppm ;
- aucun dépassement mémoire détecté par les outils hôte ;
- aucune dépendance ESP-IDF dans le composant `control_core`.

## État actuel

Les vecteurs de régulation sont générés et verrouillés par les tests JavaScript. Le modèle JavaScript du mode service vérifie également son cycle radio complet. Leur rejeu par le C++ reste à réaliser dès qu'un compilateur C++ ou ESP-IDF est disponible ; aucune réussite C++ n'est revendiquée avant cette compilation.
