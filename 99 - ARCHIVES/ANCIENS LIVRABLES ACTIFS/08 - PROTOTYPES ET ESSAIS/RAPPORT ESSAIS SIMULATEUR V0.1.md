# Rapport d'essais du simulateur v0.1

**Date :** 21 juin 2026  
**Résultat :** réussi

## Tests automatisés

Commande globale :

```powershell
node --test --test-isolation=none test/controller.test.js test/firmware-vectors.test.js test/hardware-contracts.test.js test/service-access.test.js
```

Résultat :

- 54 tests exécutés ;
- 54 réussis ;
- 0 échec.

Cas couverts :

1. démarrage ouvert puis passage en AUTO ;
2. retour progressif au minimum avec CO₂ bas ;
3. augmentation de la ventilation avec CO₂ élevé ;
4. ouverture immédiate sur mesure hors plage ;
5. ouverture sur absence prolongée de sonde ;
6. priorité de l'ouverture forcée ;
7. ouverture et défaut après dépassement CO₂ persistant.

## Scénario de réunion

- durée simulée : 7 200 secondes ;
- pas : 5 secondes ;
- 1 441 échantillons ;
- sortie minimale observée : 20 % ;
- sortie maximale observée : 100 % ;
- états observés : STARTUP, AUTO ;
- aucun défaut injecté dans ce scénario nominal ;
- sortie finale : 20 % après retour à faible CO₂.

Fichier produit : `06 - LOGICIEL EMBARQUE/simulateur/resultats/scenario_reunion.csv`.

## Limites

Ces essais prouvent la cohérence logicielle du modèle, pas le comportement aéraulique réel. Les coefficients devront être réglés après mesure du SCD41 et des volets.

## Vecteurs de parité firmware

Les vecteurs de régulation, de service, de stockage et de journaux sont maintenant générés dans `06 - LOGICIEL EMBARQUE\firmware-esp32\test\vectors`. Les essais incluent aussi les conversions DFR0971, les trames des deux voies, la classification des pannes SCD41, le cycle Wi-Fi, le stockage A/B et la capacité historique : **54 tests JavaScript réussis sur 54**. Le rejeu par le noyau C++ reste à faire lorsque le compilateur sera disponible.

## Configuration persistante

Onze tests couvrent le format binaire de 32 octets, le CRC32, les sept paramètres bornés, les valeurs usine, la sélection de génération, une copie dégradée, chaque coupure partielle, l'absence d'écriture inutile, la réparation d'une copie, le retour du compteur 32 bits, les conflits et les vecteurs destinés au C++.

## Historique et événements

Huit tests couvrent les formats 24/32 octets, CRC16, écrasement circulaire, redémarrage, agrégation anti-flood, interdiction de données sensibles, capacité de sept jours et vecteurs firmware.

## Mode service Wi-Fi

Le modèle vérifie : appui continu 3 s, fenêtre de 15 min après démarrage radio confirmé, fermeture volontaire, invalidation des sessions, un seul réessai après panne Wi-Fi, arrêt inattendu et absence d'effet sur la sortie de régulation.
