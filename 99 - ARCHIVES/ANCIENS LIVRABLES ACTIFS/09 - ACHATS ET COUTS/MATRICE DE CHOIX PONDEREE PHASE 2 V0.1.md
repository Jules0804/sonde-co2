# Matrice de choix pondérée — phase 2 v0.1

**Date :** 21 juin 2026  
**Objet :** rendre les choix du premier banc traçables sans transformer les choix de prototype en composants définitivement industrialisés.

## 1. Méthode

Chaque solution admissible reçoit une note de 0 à 5. Le score final sur 100 est la somme de `note / 5 × poids`.

| Critère | Poids | Règle de notation |
|---|---:|---|
| Sécurité et comportement en défaut | 20 | 0 = risque non maîtrisé ; 5 = état sûr démontrable |
| Compatibilité fonctionnelle | 20 | 0 = incompatible ; 5 = répond directement au besoin |
| Fiabilité et qualité documentaire | 15 | 0 = inconnue ; 5 = industriel, documenté et traçable |
| Coût total installé | 15 | 0 = prohibitif ; 5 = avantage clair sur l'ensemble installé |
| Disponibilité et seconde source | 10 | 0 = indisponible ; 5 = plusieurs sources pérennes |
| Simplicité de mise en œuvre et maintenance | 10 | 0 = complexe ; 5 = simple à installer/remplacer |
| Industrialisation et conformité | 10 | 0 = impasse probable ; 5 = bonne base produit |

Une solution est éliminée indépendamment de son score si une tension, une interface, une fonction de repli ou une preuve de documentation critique manque.

## 2. Sonde CO₂ du premier banc

Les notes s'appuient sur `COMPARAISON CAPTEURS CO2 V0.1.md`. Le produit final devra réévaluer l'intégration mécanique, la représentativité dans la gaine et la remplaçabilité.

| Solution | Sécurité 20 | Fonction 20 | Documentation 15 | Coût 15 | Disponibilité 10 | Mise en œuvre 10 | Industrialisation 10 | Score /100 | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| SCD41 / SEN0536 | 4 | 5 | 4 | 4 | 4 | 5 | 4 | **86** | Retenu pour le banc |
| SCD40 | 4 | 4 | 4 | 4 | 4 | 5 | 4 | **82** | Seconde source fonctionnelle à étudier |
| SCD30 | 4 | 4 | 5 | 2 | 4 | 3 | 3 | **73** | Non retenu pour le banc ; utile comme comparaison |

## 3. Architecture d'actionnement

| Solution | Sécurité 20 | Fonction 20 | Documentation 15 | Coût 15 | Disponibilité 10 | Mise en œuvre 10 | Industrialisation 10 | Score /100 | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 24 V, proportionnel 0/2–10 V | 5 | 5 | 5 | 4 | 4 | 5 | 5 | **95** | Architecture V1 retenue provisoirement |
| 230 V, proportionnel 0/2–10 V | 2 | 5 | 4 | 2 | 2 | 2 | 2 | **58** | Écarté pour la V1 standard ; variante chantier possible |
| 24 V, commande trois points | 4 | 3 | 4 | 4 | 4 | 3 | 3 | **72** | Non retenu pour la régulation proportionnelle V1 |

Le score 24 V ne valide pas encore une référence moteur particulière. Il valide l'architecture d'alimentation et de commande à poursuivre.

## 4. Références de servomoteur 5 Nm

| Solution | Sécurité 20 | Fonction 20 | Documentation 15 | Coût 15 | Disponibilité 10 | Mise en œuvre 10 | Industrialisation 10 | Score /100 | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Siemens GDB161.1E | 5 | 5 | 5 | 3 | 3 | 5 | 5 | **90** | Référence de comparaison et candidat banc |
| Belimo LM24A-SR | 5 | 5 | 5 | 2 | 4 | 5 | 5 | **89** | Candidat préféré si tarif professionnel compétitif |
| Gruner 227CS-024-05 | 5 | 5 | 3 | 2 | 2 | 5 | 3 | **75** | Non retenu : plus cher publiquement et version fabricant signalée ancienne |
| Nenutec NACM 5 Nm | — | — | — | — | — | — | — | **Non classé** | Fonction compatible ; prix, variante exacte et disponibilité France à obtenir |
| Moteur « économique » non référencé | — | — | — | — | — | — | — | **Non admissible** | Fiche fabricant, prix, disponibilité et conformité manquants |

La différence d'un point entre Siemens et Belimo reste faible, mais le relevé public du 21 juin 2026 place le Siemens au coût le plus bas des références documentées disponibles. Le détail et les sources sont dans `COMPARAISON ACTIONNEURS ET DIMENSIONNEMENT LOT 2 V0.2.md`. Aucun achat moteur n'est autorisé sur cette seule matrice.

## 5. Génération de la consigne analogique

| Solution | Sécurité 20 | Fonction 20 | Documentation 15 | Coût 15 | Disponibilité 10 | Mise en œuvre 10 | Industrialisation 10 | Score /100 | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| DFR0971, double DAC 0–10 V | 4 | 5 | 4 | 4 | 4 | 5 | 2 | **82** | Retenu pour le banc uniquement |
| PWM + filtre + amplificateur | 2 | 3 | 3 | 5 | 5 | 2 | 3 | **64** | Écarté pour le banc ; bruit et défauts à caractériser |
| Sortie analogique industrielle externe | 5 | 5 | 5 | 1 | 4 | 4 | 4 | **82** | Alternative de validation, trop chère pour le lot 1 |

Le DFR0971 est un accélérateur de prototype. Le produit cible devra intégrer une sortie 0–10 V protégée et testable sur le PCB, avec état au démarrage démontré.

## 6. Mesure de débit

| Solution | Sécurité 20 | Fonction 20 | Documentation 15 | Coût 15 | Disponibilité 10 | Mise en œuvre 10 | Industrialisation 10 | Score /100 | Décision |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Pression différentielle + organe K connu | 4 | 5 | 4 | 4 | 4 | 3 | 4 | **82** | Voie prioritaire après validation CO₂/volets |
| Capteur de vitesse ponctuel | 3 | 3 | 3 | 3 | 4 | 4 | 3 | **64** | Réserve ; représentativité à démontrer |
| Transmetteur de débit industriel complet | 5 | 5 | 5 | 1 | 4 | 4 | 4 | **82** | Référence de comparaison/étalonnage |

Le score identique des deux meilleures voies traduit un compromis coût/intégration, pas une égalité métrologique. La décision finale appartient à la phase 7 après étalonnage.

## 7. Alimentation de six moteurs

Règle de dimensionnement provisoire :

```text
P_alimentation ≥ 1,25 × (somme des puissances maximales simultanées des 6 moteurs
                         + contrôleur
                         + pertes des convertisseurs
                         + auxiliaires)
```

Le calcul vérifiable du lot 2 retient le pire candidat admissible à 2 VA par moteur, un convertisseur logique de 15 W à 80 % de rendement minimal, 1 W d'auxiliaires et 25 % de marge. Il aboutit à 39,69 W et 1,65 A. Le HDR-60-24 de 60 W / 2,5 A est donc suffisant sur papier. Le courant de démarrage, le déclassement thermique et la chute de tension restent à mesurer avec la référence réellement achetée.

## 8. Conclusion

Les choix suffisamment établis pour le lot 1 sont : SCD41/SEN0536, DFR0971 et Wemos ESP32-C3 déjà possédée. L'architecture V1 poursuit des moteurs 24 V proportionnels. Les moteurs, l'alimentation de puissance, le coffret, les protections et la mesure de débit restent soumis à leurs preuves et jalons dédiés.
