# Comparaison de la mesure de débit v0.1

**Statut :** option du prototype complet, achat reporté après validation CO₂/volets

**Complément du 21 juin 2026 :** la recherche multi-fabricants détaillée est disponible dans `RECHERCHE SONDES DEBIT AIR - INFORMATION V0.1.md`. Elle confirme la pression différentielle avec organe multipoint/station calibrée comme branche prioritaire, mais montre qu'une seule plage 50–2 000 m³/h serait techniquement trompeuse. Le choix devra être fait par familles de diamètres et de débits.

## 1. Solutions comparées

### A — Pression différentielle + organe à coefficient K

Principe : mesurer la différence de pression sur un diaphragme, une croix de mesure, un registre iris ou un élément calibré, puis calculer :

```text
Q = K × √ΔP
```

Avantages : méthode CVC connue, adaptable aux diamètres 125–400 mm, électronique commune à plusieurs tailles.

Limites : exige un organe avec coefficient K connu et une plage de pression adaptée ; les tubes doivent rester propres et correctement branchés.

**Décision recommandée : solution de référence.**

### B — Capteur de vitesse dans la gaine

Avantages : montage potentiellement simple.

Limites : profil de vitesse non uniforme, besoin de longueurs droites, sensibilité à l'encrassement et conversion vitesse/débit dépendante de la section.

**Décision : écartée comme solution principale ; utile pour essais ponctuels.**

### C — Volet/VAV avec mesure intégrée

Avantages : mesure et régulation fournies par un produit industriel complet.

Limites : coût élevé, dépendance au fournisseur, concurrence directe avec la fonction que le projet cherche à créer.

**Décision : référence de comparaison, pas la version économique.**

### D — Mesure au balomètre uniquement lors de la mise en service

Avantages : aucun coût capteur permanent.

Limites : aucune valeur en temps réel dans l'application et aucun diagnostic continu.

**Décision : mode économique sans option débit.**

## 2. Capteur différentiel candidat

### Sensirion SDP810-500Pa

- plage différentielle : environ -500 à +500 Pa ;
- sortie numérique I²C ;
- résolution 16 bits selon la distribution ;
- deux embouts pour tubes ;
- prix observé : environ 26,54 € chez Mouser, 28,66 € HT chez Farnell, 39,73 € TTC environ chez RS selon affichage ;
- stock/délais à revérifier avant commande.

Sources :

- [Mouser — SDP810-500Pa](https://www.mouser.fr/ProductDetail/Sensirion/SDP810-500PA)
- [Farnell — SDP810-500Pa](https://fr.farnell.com/sensirion/sdp810-500pa/capteur-pression-numerique-500pa/dp/2886666)

## 3. Plage de pression

Une plage ±500 Pa est polyvalente pour le banc, mais peut perdre de la finesse aux très faibles débits si l'organe ne génère que quelques pascals. La phase d'essai devra comparer :

- un capteur faible plage pour la précision à bas débit ;
- le SDP810-500Pa pour la robustesse et les débits plus élevés ;
- éventuellement deux gammes produit selon les applications.

## 4. Budget de l'option débit

| Élément | Estimation TTC |
|---|---:|
| SDP810-500Pa | 32–48 € selon fournisseur/taxes/port |
| Tubes et raccords | 10–20 € |
| Organe de mesure avec K connu ou fabrication pilote | 50–200 € |
| Petites fournitures et support | 10–30 € |

**Enveloppe option débit : 100 à 300 € TTC.**

## 5. Recommandation

1. Ne pas inclure l'option débit dans le premier lot d'achat.
2. Valider d'abord SCD41 + DAC + un moteur.
3. Comparer ensuite un capteur faible plage, le SDP810-500Pa et un transmetteur HVAC avec une station multipoint ; ne retenir la plage qu'après calcul du Δp minimal et maximal.
4. Enregistrer simultanément ΔP, débit calculé, ouverture et CO₂.
5. Établir des coefficients par diamètre/organe, sans prétendre à une mesure universelle non calibrée.
