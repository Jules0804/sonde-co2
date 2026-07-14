# Spécification du stockage de configuration v0.1

## 1. Objectif de sûreté

Les réglages doivent survivre à une coupure, mais une configuration corrompue ne doit jamais réduire silencieusement le débit minimal ou empêcher le repli à 100 %. Le stockage utilise donc deux copies indépendantes, un schéma versionné, une génération et un CRC32 applicatif en plus des contrôles internes de NVS.

## 2. Paramètres couverts par le schéma 1

| Paramètre | Encodage | Valeur usine | Bornes |
|---|---:|---:|---:|
| Consigne CO₂ | `uint16`, ppm | 1000 | 800–1400 |
| Sortie minimale | `uint16`, dixième de % | 20,0 % | 0,0–80,0 |
| Sortie maximale | `uint16`, dixième de % | 100,0 % | 50,0–100,0 |
| Alarme CO₂ | `uint16`, ppm | 1500 | 1200–2500 et > consigne |
| Délai d'alarme | `uint16`, secondes | 60 | 10–600 |
| Durée maximale d'un test | `uint16`, secondes | 600 | 30–600 |
| Période d'historique | `uint16`, secondes | 60 | 10–300 |

Les paramètres de calibration capteur/débit, les comptes et les secrets auront des enregistrements séparés. Ils ne doivent pas être ajoutés implicitement au schéma 1.

## 3. Format binaire — 32 octets little-endian

| Offset | Taille | Champ | Règle |
|---:|---:|---|---|
| 0 | 4 | Magie ASCII | `VCO2` |
| 4 | 2 | Version de schéma | `1` |
| 6 | 2 | Taille charge utile | `20` |
| 8 | 4 | Génération | compteur série `uint32` |
| 12 | 2 | Consigne CO₂ | ppm |
| 14 | 2 | Minimum | dixième de % |
| 16 | 2 | Maximum | dixième de % |
| 18 | 2 | Alarme CO₂ | ppm |
| 20 | 2 | Délai alarme | s |
| 22 | 2 | Durée test | s |
| 24 | 2 | Période historique | s |
| 26 | 2 | Réservé/flags | doit valoir zéro |
| 28 | 4 | CRC32 IEEE | octets 0 à 27 |

Vecteur binaire de référence pour la génération 42 et la configuration d'essai documentée dans les tests :

```text
56434f32010014002a000000b603ff008403aa055a002c011e000000a9d64f0d
```

Le CRC est stocké little-endian. Toute différence entre JavaScript et C++ sur ce vecteur interdit le portage.

## 4. Organisation NVS

- espace de noms : `vent_cfg` ;
- clé copie A : `cfg_a` ;
- clé copie B : `cfg_b` ;
- chaque clé contient exactement un blob du format ci-dessus ;
- aucun pointeur « copie active » séparé n'est nécessaire : la génération valide la plus récente gagne ;
- l'arithmétique série 32 bits gère le retour de `0xFFFFFFFF` à `0` ;
- une distance exactement égale à `2^31` est ambiguë et doit produire un défaut.

## 5. Lecture au démarrage

| Situation | Configuration utilisée | AUTO autorisé | Diagnostic |
|---|---|---:|---|
| Deux clés absentes | Valeurs usine | Oui | `FACTORY_DEFAULTS`, première mise en service |
| Deux copies valides | Génération la plus récente | Oui | `OK` ou `REDUNDANT` |
| Une copie valide | Copie valide | Oui | `BACKUP_DEGRADED`, réparation planifiée |
| Aucune copie valide mais mémoire non vierge | Valeurs usine seulement pour affichage | **Non** | `CONFIG_CORRUPT`, sortie 100 % |
| Même génération, contenus différents | Valeurs usine seulement pour affichage | **Non** | `GENERATION_CONFLICT`, sortie 100 % |
| Schéma inconnu | Ne pas écraser automatiquement | **Non** | Mise à jour/rollback ou migration nécessaire |

Les valeurs usine ne transforment donc pas une corruption en fonctionnement apparemment normal.

## 6. Écriture transactionnelle

1. Authentifier et autoriser l'opération.
2. Exiger la révision lue (`If-Match`) afin d'éviter un écrasement concurrent.
3. Valider toutes les bornes et relations.
4. Ne rien écrire si les deux copies sont saines et les valeurs inchangées.
5. Choisir la copie absente, invalide ou la plus ancienne.
6. Encoder la génération suivante.
7. Écrire et committer uniquement cette copie.
8. Relire le blob, vérifier longueur, schéma, CRC, valeurs et génération.
9. Considérer l'écriture réussie seulement après cette relecture.
10. Réparer plus tard la seconde copie si elle était absente/invalide ; ne jamais écrire périodiquement dans la boucle de régulation.

Une récupération après conflit/corruption complète exige une action installateur explicite et doit être journalisée.

## 7. Coupures et endurance

Le modèle simule une coupure après chaque octet de la nouvelle copie. Tant que les 32 octets ne sont pas valides, l'ancienne copie reste sélectionnée. Sur matériel, les essais devront couper réellement l'alimentation pendant `nvs_set_blob`/`nvs_commit`, puis répéter sur de nombreux cycles.

L'usure est limitée par :

- aucune écriture si les valeurs ne changent pas ;
- écriture uniquement après validation utilisateur ;
- alternance A/B ;
- historique stocké dans une zone et une stratégie distinctes ;
- compteurs fréquents conservés en RAM puis agrégés.

## 8. Sécurité et confidentialité

La configuration de ventilation n'est pas un secret, mais son intégrité est critique. Le chiffrement NVS proposé dans `sdkconfig.defaults` doit être réellement provisionné et testé avant production. Les mots de passe, clés de signature et secrets Wi-Fi utilisent des espaces/objets séparés et ne sont jamais exportés avec cette configuration.

## 9. État de réalisation

Le modèle `simulateur/src/config-store.js` et onze tests prouvent l'encodage, les bornes, la sélection A/B, les coupures partielles, l'usure évitée, la réparation de copie, le retour de génération, le conflit et le rejeu des vecteurs firmware. Le portage C++/NVS, la compilation ESP-IDF et les coupures électriques réelles restent à réaliser.
