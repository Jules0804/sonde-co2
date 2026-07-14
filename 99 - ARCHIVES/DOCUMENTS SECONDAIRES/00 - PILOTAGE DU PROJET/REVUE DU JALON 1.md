# Revue du jalon 1 — Réglementation et architecture

## Conclusion

Le jalon 1 est approuvé par Jules avec un amendement à J1-D1. Les obligations critiques connues ont été prises en compte à un niveau suffisant pour commencer la comparaison détaillée des composants, sans acheter de matériel.

La conformité commerciale n'est évidemment pas encore démontrée : elle nécessitera le produit figé, des essais, les normes applicables confirmées et des rapports de laboratoire.

## Contrôle des livrables

| Critère du plan directeur | Preuve | Résultat |
|---|---|---|
| Textes applicables à la ventilation identifiés | Matrice réglementaire + sources officielles | Satisfait pour le premier pilote en entreprise |
| Stratégie CO₂ définie | Cahier mis à jour + architecture §6 | Satisfait provisoirement ; validation par essais requise |
| Sécurité électrique, CEM, radio et cybersécurité étudiées | Matrice réglementaire | Satisfait au niveau architecture |
| Prototype distingué du produit vendu | Plan directeur + matrice | Satisfait |
| Architectures comparées | Comparaison des architectures v0.1 | Satisfait |
| États de panne définis | Cahier + architecture + risques | Satisfait au niveau préliminaire |
| Interfaces spécifiées | Spécification des interfaces v0.1 | Satisfait |
| Analyse préliminaire des risques | Analyse de risques v0.1 | Satisfait |
| Traçabilité des exigences | Matrice de traçabilité v0.1 | Satisfait |

## Décisions structurantes proposées

### J1-D1 — Architecture générale — validée avec amendement

Retenir un boîtier tout-en-un avec arrivée 230 V, six départs moteurs et une consigne 0–10 V commune. Comparer en phase 2 les moteurs alimentés en 24 V et ceux alimentés en 230 V avant de figer leur alimentation.

### J1-D2 — Téléphone — validée

Retenir un point d'accès Wi-Fi local et une interface Web sans cloud. Ne pas promettre une application PWA installable avant les tests sur téléphone.

### J1-D3 — Régulation — validée

Retenir 1 000 ppm comme cible usine initiale modifiable, tout en maintenant en permanence le débit minimal défini lors de la mise en service.

### J1-D4 — Débit minimal — validée

- sans mesure de débit : réglage par pourcentage d'ouverture et contrôle au balomètre/anémomètre lors de l'équilibrage ;
- avec mesure de débit : réglage en m³/h et procédure de calibration.

### J1-D5 — Récupération — validée

Ajouter un bouton de service encastré, peu coûteux et inaccessible en utilisation normale, uniquement pour appairage/récupération/réinitialisation sécurisés.

### J1-D6 — Compatibilité aéraulique — validée

Inscrire comme condition d'installation que la centrale et le réseau doivent supporter les volets variables, avec régulation de pression, bypass ou stratégie équivalente selon le chantier.

## Points non bloquants reportés à la phase 2

- référence de la sonde CO₂ ;
- référence des servomoteurs ;
- dimensionnement exact de l'alimentation ;
- capteur de pression différentielle et organes de mesure ;
- afficheur local ;
- coffret et indice IP ;
- composants du repli matériel 10 V ;
- coût réel du banc et du produit.

## Passage au jalon suivant

La phase 2 est autorisée : comparaison des composants, nomenclature du banc, schéma de principe chiffré et budget. Aucun achat ne sera effectué sans validation de la liste et du coût.
