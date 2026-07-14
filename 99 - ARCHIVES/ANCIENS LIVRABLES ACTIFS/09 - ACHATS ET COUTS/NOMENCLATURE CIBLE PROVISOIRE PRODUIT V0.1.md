# Nomenclature cible provisoire du produit v0.1

**Date :** 21 juin 2026  
**Statut :** architecture de coût et de sourcing ; aucune référence non validée ne doit être commandée sur cette base.

## 1. Différence entre le banc et le produit

Le premier banc utilise une Wemos, un SEN0536 et un DFR0971 pour réduire le risque rapidement. Le produit commercialisable ne doit pas être une juxtaposition de cartes de développement. Il devra réunir les fonctions sur un ensemble reproductible, protégé, traçable et testable.

## 2. Nomenclature fonctionnelle cible

| Bloc | Qté | Solution cible provisoire | Exigences principales | Seconde source/risque | Maturité |
|---|---:|---|---|---|---|
| Microcontrôleur radio | 1 | Module radio certifié de famille ESP32-C3 | Wi-Fi local, BLE éventuel, secure boot, chiffrement flash, 4 Mo minimum à confirmer | Variante ou fabricant à figer après mesure mémoire/RF | Basse |
| Mesure CO₂ | 1 | SCD4x sur tête remplaçable | Mesure NDIR, flux d'air maîtrisé, connecteur détrompé, identification et calibration | SCD40/SCD41 à qualifier | Moyenne |
| Sortie analogique | 2 voies | DAC + adaptation 0–10 V intégrés | État sûr au boot, limitation/protection, diagnostic, précision suffisante | Architecture analogique à concevoir | Basse |
| Départs actionneurs | 6 | Borniers 24 V + 0 V + Y, protégés et repérés | Six moteurs, charge cumulée vérifiée, protections par groupes ou branches | Courants moteurs inconnus | Basse |
| Alimentation puissance | 1 | 230 V AC vers 24 V DC, industrielle | Puissance selon six moteurs, déclassement thermique, protections, conformité | 60 W seulement hypothétique | Basse |
| Alimentation logique | 1 | 24 V vers 5/3,3 V | Rendement, protections, marge, CEM | Plusieurs topologies possibles | Basse |
| Entrée secteur | 1 | Bornier, protection, filtrage et coupure adaptés | Séparation, PE si nécessaire, distances, repérage, maintenance sûre | Étude sécurité détaillée requise | Basse |
| Bouton service | 1 | Bouton accessible ou membrane | Appui 3 s, anti-rebond, pas d'accès au secteur | Référence mécanique à choisir | Moyenne |
| Indication locale | 1 | Voyant multicolore ; afficheur optionnel | États sans divulguer de secret ; URL/IP dans notice | Afficheur non requis pour QR | Moyenne |
| QR de mise en service | 1 | Gravure laser unique sur plastique | Lisibilité, contraste, identifiant Wi-Fi seulement, aucun secret administrateur | Process de sérialisation à créer | Moyenne |
| Stockage local | 1 | Flash du module + partitionnement robuste | Historique, configuration redondante, OTA A/B, récupération | Capacité réelle à mesurer | Moyenne |
| Horloge | 1 | RTC ou stratégie de temps à définir | Horodatage hors Internet, tenue après coupure selon besoin | Besoin non encore figé | Basse |
| Interface future GTB | réserve | Empreinte/réserve RS-485 ou extension | BACnet/Modbus reportés, isolation à étudier | Ne pas peupler en V1 sans décision | Basse |
| PCB principal | 1 | Circuit imprimé industriel | DFT, points de test, séparation secteur/TBTS, traçabilité | Après validation du banc | Non commencé |
| Tête capteur/PCB secondaire | 1 | Carte remplaçable et câble adapté | Détrompage, longueur, CEM, condensation, maintenance | À prototyper | Non commencé |
| Boîtier | 1 | ABS/PC mural et/ou rail DIN | IP/IK à définir, ventilation capteur, séparation, QR gravable | Architecture mécanique ouverte | Basse |
| Connectique | 1 lot | Borniers débrochables/détrompés | Section conducteurs, repérage, anti-erreur | Fournisseur à qualifier | Basse |
| Logiciel embarqué | 1 | Firmware signé, journalisé et récupérable | Repli 100 %, watchdog, OTA, comptes, diagnostics | Tests matériels manquants | Moyenne en simulation |
| Interface utilisateur | 1 | Web locale adaptative embarquée | Sans cloud, Android/iPhone, rôles et récupération | Tests appareils manquants | Moyenne en prototype |

## 3. Objectifs de coût à établir

Le coût cible produit n'a pas encore été fixé par Jules et ne doit pas être inventé. La prochaine estimation devra distinguer :

- coût matière électronique ;
- alimentation et protections ;
- boîtier, gravure et étiquetage ;
- assemblage et test ;
- licences/outils ;
- emballage et documentation ;
- provision de garantie/SAV ;
- amortissement développement, essais et conformité.

Une marge commerciale ne pourra être calculée qu'après mesure de ces postes et définition du canal de vente.

## 4. Critères de gel de la nomenclature

Une ligne ne devient « figée » qu'après :

1. fiche technique fabricant archivée ou référencée ;
2. compatibilité électrique et fonctionnelle démontrée ;
3. disponibilité et seconde source analysées ;
4. coût réel obtenu pour les volumes visés ;
5. risques sécurité/CEM/cybersécurité traités ;
6. essais de réception et durée de vie définis ;
7. référence, révision et statut d'approvisionnement traçables.

## 5. Conclusion

Cette nomenclature empêche de confondre la preuve de concept et le produit vendu. Elle donne une place explicite aux protections, à la fabrication, au test, à la traçabilité et au cycle de vie, qui n'apparaissent pas dans le panier du lot 1.
