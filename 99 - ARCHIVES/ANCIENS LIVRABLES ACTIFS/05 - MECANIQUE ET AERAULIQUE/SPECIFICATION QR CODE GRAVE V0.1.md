# Spécification du QR code gravé v0.1

## 1. Fonction

Le QR code gravé sur le boîtier permet au téléphone de rejoindre directement le point d'accès Wi-Fi temporaire. Le portail captif ouvre ensuite l'interface Web locale.

Le QR code ne contient pas de mot de passe administrateur et ne donne aucun accès lorsque le Wi-Fi de service est désactivé.

Rejoindre le Wi-Fi grâce au QR donne seulement accès aux informations de consultation. Toute modification ou commande exige encore une session installateur distincte.

## 2. Contenu proposé

Format Wi-Fi standard :

```text
WIFI:T:WPA;S:VENT-CO2-XXXX;P:SECRET_UNIQUE;;
```

- `XXXX` : suffixe unique dérivé du numéro de série ou de l'identifiant radio ;
- `SECRET_UNIQUE` : secret Wi-Fi propre à chaque boîtier ;
- l'adresse de secours `http://192.168.4.1` est gravée en clair à proximité ;
- le numéro de série est gravé séparément pour la maintenance.

Les caractères `\`, `;`, `,`, `:` et `"` devront être évités dans les secrets ou correctement échappés afin de préserver la compatibilité des lecteurs de QR.

## 3. Dimensions et contraste

- dimension cible minimale : 25 × 25 mm ;
- module élémentaire recommandé : au moins 0,5 mm ;
- zone calme : au moins 4 modules sur les quatre côtés ;
- correction d'erreur : niveau Q ou H à tester ;
- contraste sombre/clair élevé ;
- aucune vis, courbure, texture ou bord de découpe dans la zone calme ;
- gravure superficielle ne traversant pas la paroi et ne dégradant pas l'indice IP.

Un plastique dont la couleur change au laser, ou un insert bicouche gravable, est préférable. Une simple gravure peu contrastée sur ABS noir peut être illisible et devra être refusée lors du contrôle de fabrication.

## 4. Sécurité et maintenance

- Wi-Fi activé uniquement après appui physique de 3 secondes ;
- durée maximale initiale : 15 minutes ;
- mot de passe Wi-Fi différent du compte installateur ;
- identifiants uniques, jamais un secret commun à toute la série ;
- secret stocké dans une zone protégée du contrôleur ;
- en cas de remplacement de la carte, reprovisionner les identifiants gravés ou remplacer l'étiquette/façade ;
- aucune donnée personnelle dans le QR code.

## 5. Procédure de fabrication

1. Attribuer numéro de série, SSID et secret uniques.
2. Programmer les mêmes valeurs dans le contrôleur.
3. Générer le QR sans interpolation et avec la zone calme.
4. Graver le boîtier ou l'insert.
5. Scanner le QR avec au moins un Android et un iPhone.
6. Activer le Wi-Fi et vérifier la connexion réelle.
7. Vérifier l'ouverture du portail et l'adresse de secours.
8. Enregistrer le résultat dans la fiche de production.

## 6. Essais de qualification

- distance de lecture : 20, 40 et 80 cm ;
- éclairage faible, bureau et lampe directe ;
- lecture après nettoyage et rayure légère représentative ;
- lecture à travers une éventuelle façade transparente ;
- dix scans consécutifs sans ambiguïté ;
- contrôle après vieillissement UV et produits de nettoyage prévus ;
- vérification qu'un boîtier voisin ne partage pas les mêmes identifiants.

## 7. Solution de secours

Si la gravure directe n'offre pas assez de contraste, utiliser :

1. un insert plastique bicouche gravable ;
2. une étiquette industrielle résistante et remplaçable ;
3. le SSID et l'URL affichés sur l'écran du boîtier.
