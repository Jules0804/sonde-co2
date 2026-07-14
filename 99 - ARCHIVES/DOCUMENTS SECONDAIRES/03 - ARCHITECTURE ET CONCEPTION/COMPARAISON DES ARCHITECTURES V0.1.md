# Comparaison des architectures v0.1

## Critères pondérés

Les priorités données par Jules sont utilisées dans cet ordre : simplicité, fiabilité, prix. La conformité et l'évolutivité sont ajoutées car le produit doit être commercialisable.

| Critère | Poids |
|---|---:|
| Simplicité d'installation et d'usage | 30 % |
| Fiabilité | 25 % |
| Prix cible | 20 % |
| Préparation à la conformité | 15 % |
| Évolutivité | 10 % |

Notation de 1 (mauvais) à 5 (très bon). Les notes devront être révisées après devis et essais.

## Variante A — Boîtier autonome tout-en-un

### Description

- 230 V directement dans le boîtier.
- Alimentation logique isolée interne et alimentation moteurs 24 V ou distribution 230 V à départager.
- Contrôleur et radio dans le boîtier.
- Tête CO₂ déportée.
- Six départs moteurs et une consigne 0–10 V commune.
- Interface Web Wi-Fi locale.

### Avantages

- un seul boîtier à fixer et à alimenter ;
- conforme au besoin plug-and-play ;
- pas de passerelle ni de serveur ;
- coût de pose réduit ;
- fonctionnement entièrement autonome.

### Inconvénients

- présence du 230 V et de la radio dans le même produit ;
- contraintes CEM et sécurité plus exigeantes ;
- boîtier plus volumineux à cause de l'alimentation des six moteurs.

| Simplicité | Fiabilité | Prix | Conformité | Évolutivité | Total pondéré |
|---:|---:|---:|---:|---:|---:|
| 5 | 4 | 4 | 3 | 4 | **4,20 / 5** |

## Variante B — Contrôleur 24 V avec alimentation externe

### Description

- contrôleur alimenté en 24 V TBTS ;
- alimentation secteur séparée, installée dans un tableau ou un coffret ;
- fonctions de régulation et de communication identiques à la variante A.

### Avantages

- contrôleur plus petit ;
- sécurité électrique et thermique simplifiée ;
- alimentation remplaçable par un composant industriel standard ;
- séparation plus favorable à la conformité.

### Inconvénients

- installation moins plug-and-play ;
- deuxième équipement à choisir, fixer et câbler ;
- risque de mauvais dimensionnement par l'installateur ;
- ne respecte pas la préférence actuelle d'une arrivée 230 V unique au boîtier.

| Simplicité | Fiabilité | Prix | Conformité | Évolutivité | Total pondéré |
|---:|---:|---:|---:|---:|---:|
| 3 | 5 | 3 | 5 | 4 | **3,90 / 5** |

## Variante C — Réseau de modules distribués

### Description

- un contrôleur central ou une passerelle ;
- plusieurs modules de volets communicants ;
- sonde et modules reliés par bus ;
- possibilité de commander séparément chaque volet.

### Avantages

- très évolutif ;
- diagnostic individuel ;
- câblage adapté aux grandes installations ;
- architecture favorable à de nombreuses zones.

### Inconvénients

- coût et complexité élevés ;
- adressage et mise en service plus difficiles ;
- davantage de cartes et de références à fabriquer ;
- surdimensionné pour un boîtier par salle avec volets parallèles.

| Simplicité | Fiabilité | Prix | Conformité | Évolutivité | Total pondéré |
|---:|---:|---:|---:|---:|---:|
| 2 | 3 | 2 | 3 | 5 | **2,70 / 5** |

## Recommandation

Retenir la **variante A** comme architecture produit de référence. Elle correspond le mieux au besoin d'un boîtier autonome, économique et plug-and-play.

Utiliser une approche hybride pendant le prototype : une alimentation industrielle certifiée et protégée peut être montée dans le coffret de banc afin de réduire le risque avant la conception de l'alimentation intégrée définitive.

Conserver la variante B comme éventuelle déclinaison professionnelle 24 V si certains chantiers disposent déjà d'une alimentation TBTS centralisée.

## Comparaison des interfaces moteurs

| Solution | Simplicité | Compatibilité | Diagnostic | Coût | Décision |
|---|---:|---:|---:|---:|---|
| 0–10 V proportionnel | Très bonne | Très répandue en CVC | Retour optionnel | Modéré | **Référence version 1** |
| Commande trois points | Moyenne | Répandue | Position calculée, dérive possible | Faible | Variante future éventuelle |
| Tout-ou-rien | Bonne | Répandue | Très limité | Faible | Ne permet pas la régulation demandée |
| Bus propriétaire de motoriste | Faible | Limitée à une gamme | Excellent | Plus élevé | Écarté de la version 1 |

## Comparaison de la connexion téléphone

| Solution | Avantages | Limites | Décision |
|---|---|---|---|
| Wi-Fi local + interface Web | Aucun cloud, interface riche, compatible téléphone | Sécurisation et parcours d'appairage à concevoir | **Référence version 1** |
| Bluetooth + application native | Appairage local, faible consommation | Deux applications à maintenir, publication dans les stores | Écarté pour la première version |
| Wi-Fi du bâtiment/cloud | Supervision distante | Dépendance réseau, cybersécurité et support plus lourds | Écarté du cœur autonome |
| Câble USB/service | Simple pour le développement | Nécessite un ordinateur ou adaptateur | Réservé au développement et secours |

## Comparaison de la liaison tête CO₂

| Solution | Robustesse câble | Coût | Maintenance | Décision |
|---|---:|---:|---:|---|
| I²C direct | Faible sur plusieurs mètres | Très faible | Simple sur banc | Prototype court uniquement |
| 0–10 V depuis sonde industrielle | Bonne | Sonde plus coûteuse | Très standard CVC | Candidat de comparaison |
| Modbus/RS-485 | Très bonne | Modéré | Diagnostic riche | **Référence produit recommandée** |
| UART différentiel propriétaire | Très bonne | Faible à modéré | Dépend du protocole maison | Candidat si la tête est fabriquée sur mesure |

## Décisions issues de la comparaison

1. Architecture A retenue comme base du jalon 1.
2. Commande 0–10 V commune retenue ; tension moteurs 24 V ou 230 V renvoyée à la comparaison chiffrée de phase 2.
3. Wi-Fi local et interface Web retenus comme base, sans cloud.
4. Liaison courte de développement autorisée pour la sonde du banc ; liaison différentielle exigée pour le produit.
5. Variante 24 V externe conservée dans la feuille de route, sans ralentir la version principale.
