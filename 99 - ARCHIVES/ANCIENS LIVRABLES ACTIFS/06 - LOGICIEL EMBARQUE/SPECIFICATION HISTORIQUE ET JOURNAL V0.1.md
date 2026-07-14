# Spécification de l'historique et du journal v0.1

## 1. Objectifs

Le produit conserve localement :

- les mesures utiles au diagnostic et aux courbes ;
- les changements d'état et défauts ;
- les actions de mise en service et de sécurité ;
- les versions/résultats de mise à jour futurs.

La perte du stockage reste un défaut non critique : elle est signalée en RAM mais ne perturbe jamais la régulation CO₂.

## 2. Politique initiale de rétention

| Donnée | Cadence/capacité | Rétention initiale | Accès |
|---|---:|---:|---|
| Mesures CO₂/ouverture/état | 60 s configurable 10–300 s | 7 jours proposés | Consultation locale ; export |
| Événements techniques | 512 enregistrements | Circulaire | Installateur + |
| Coredump | Partition dédiée | Dernier incident selon ESP-IDF | Maintenance contrôlée |

Les sept jours restent une valeur de conception provisoire à valider avec Jules et les essais de capacité. L'utilisateur doit pouvoir effacer l'historique local via une action administrateur confirmée ; cette fonction n'est pas encore implémentée.

## 3. Horodatage sans Internet

Chaque enregistrement contient obligatoirement :

- un numéro de séquence ;
- un `bootId` persistant ;
- l'uptime depuis ce démarrage ;
- un temps Unix uniquement lorsqu'une source de temps a été acceptée ;
- un indicateur `TIME_SYNCED`.

Si l'heure civile est inconnue, `epochSeconds = 0`. Les données restent ordonnables par `bootId + uptime`, mais l'interface ne doit pas inventer une date. Une heure fournie par le téléphone sera considérée comme non fiable tant que la session n'est pas authentifiée ; sa mise à jour et les retours arrière devront être journalisés. Un RTC matériel reste optionnel.

## 4. Échantillon de mesure — 24 octets little-endian

| Offset | Taille | Champ |
|---:|---:|---|
| 0 | 4 | séquence `uint32` |
| 4 | 4 | temps Unix, zéro si inconnu |
| 8 | 4 | uptime secondes |
| 12 | 2 | `bootId` |
| 14 | 2 | CO₂ ppm, `0xFFFF` si invalide |
| 16 | 2 | ouverture en dixième de % |
| 18 | 1 | état énuméré |
| 19 | 1 | défaut énuméré |
| 20 | 2 | drapeaux |
| 22 | 2 | CRC16-CCITT des octets 0–21 |

Vecteur de référence :

```text
2a00000080e14e68d20400000700db035901010003001c22
```

## 5. Événement — 32 octets little-endian

| Offset | Taille | Champ |
|---:|---:|---|
| 0 | 4 | séquence |
| 4 | 4 | temps Unix ou zéro |
| 8 | 4 | uptime |
| 12 | 2 | `bootId` |
| 14 | 2 | code d'événement stable |
| 16 | 1 | gravité |
| 17 | 1 | source (`SYSTEM`, `PHYSICAL`, `INSTALLER`, `ADMIN`, `GTB`) |
| 18 | 2 | compteur d'occurrences |
| 20 | 4 | détail numérique 0 |
| 24 | 4 | détail numérique 1 |
| 28 | 2 | réservé, zéro |
| 30 | 2 | CRC16-CCITT des octets 0–29 |

Vecteur de référence :

```text
090000008ae14e68dc040000070002000002010029000000feffffff0000aecd
```

Les codes et la signification des deux détails sont versionnés. Aucun texte libre, nom d'utilisateur, mot de passe, secret Wi-Fi, jeton, adresse MAC ou donnée personnelle n'est autorisé dans le journal persistant.

Pour `TEST_STOPPED`, `detail0 = 0` désigne un arrêt demandé et `detail0 = 1` une expiration automatique. Dans ce second cas, la source est `SYSTEM`. `detail1` reste nul en v0.1.

## 6. Événements minimaux

- démarrage et raison du redémarrage ;
- défaut levé/retombé ;
- changement/récupération de configuration ;
- ouverture/fermeture du service Wi-Fi ;
- échecs de connexion agrégés ;
- ouverture/fermeture de session sans identité nominative ;
- début/fin/expiration d'un test actionneur ;
- mise à jour, rollback et version ;
- panne du stockage.

Les répétitions identiques non critiques sur moins de 60 secondes sont regroupées avec un compteur pour empêcher le remplissage volontaire du journal. Les événements critiques ne sont jamais regroupés.

## 7. Capacité dans la partition de 384 Kio

| Poste | Calcul | Taille |
|---|---:|---:|
| 7 jours de mesures | 10 080 × 24 octets | 241 920 octets |
| 512 événements | 512 × 32 octets | 16 384 octets |
| Total enregistrements | — | 258 304 octets |
| Partition | 384 × 1024 | 393 216 octets |
| Marge brute | — | **134 912 octets** |

La marge de 34 % doit absorber en-têtes de pages, index, pages incomplètes, effacements et nivellement d'usure. Ce calcul prouve la faisabilité logique, pas encore l'endurance flash. Le format physique par pages et les coupures réelles seront validés sur la Wemos.

## 8. API et confidentialité

- `/history` peut exposer les courbes pendant la fenêtre Wi-Fi physique ; ce choix reste à réévaluer vis-à-vis de l'occupation déduite ;
- `/events` exige une session installateur ;
- la réponse est limitée à 200 événements par requête ;
- l'export ne contient ni compte ni identifiant radio ;
- aucun journal n'est envoyé vers un cloud dans la V1.

## 9. État de réalisation

Le modèle `simulateur/src/history-log.js` vérifie les deux formats, CRC, journal circulaire, redémarrage, agrégation anti-flood, événements critiques, interdiction des secrets et budget mémoire. Le serveur simulé expose déjà `/events` et journalise les connexions, configurations et tests. Le pilote flash, le format de pages, l'effacement administrateur et les essais d'endurance/coupure restent à réaliser.
