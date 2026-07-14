# Spécification du mode service Wi-Fi v0.1

## 1. But

Le point d'accès Wi-Fi sert uniquement à la mise en service et au diagnostic local. Il ne doit jamais être nécessaire à la boucle CO₂ et ne doit pas rester actif silencieusement.

## 2. Invariants

1. Un appui continu de 3 000 ms est nécessaire ; un appui plus court ne produit aucun effet.
2. Une activation ne peut être déclenchée qu'une fois par appui : le bouton doit être relâché avant une nouvelle demande.
3. Le compte à rebours de 15 minutes commence après confirmation du démarrage réel du Wi-Fi, pas dès l'appui.
4. Un nouvel appui pendant la fenêtre active ne la prolonge pas silencieusement.
5. À expiration ou fermeture volontaire, le firmware demande l'arrêt radio puis attend sa confirmation.
6. L'arrêt du Wi-Fi invalide toutes les sessions applicatives en mémoire.
7. Un arrêt radio inattendu invalide les sessions avant un éventuel réessai.
8. Un seul réessai automatique est autorisé ; deux échecs successifs produisent un défaut Wi-Fi non critique.
9. Un défaut Wi-Fi ne modifie jamais directement la consigne des volets et n'arrête pas la régulation.
10. Une commande de test actionneur reste temporisée par son propre mécanisme, même si le téléphone ou le Wi-Fi disparaît.

## 3. États radio

| État | Description | Action admise |
|---|---|---|
| `OFF` | Radio de service arrêtée | Attendre un appui physique valide |
| `STARTING` | Démarrage demandé, délai 10 s | Accepter `STARTED` ou réessayer une fois |
| `ACTIVE` | AP actif, compte à rebours 15 min | Servir PWA/API et afficher le temps restant |
| `STOPPING` | Arrêt demandé | Attendre `STOPPED`, puis invalider les sessions |
| `FAULT` | Deux démarrages ont échoué | Signaler un défaut non critique, régulation maintenue |

## 4. Actions vers le pilote Wi-Fi

- `START_WIFI` : créer uniquement le SoftAP `VENT-CO2-XXXX`, sans mode routeur ni connexion au réseau du bâtiment ;
- `STOP_WIFI` : fermer l'API, le portail captif et la radio de service ;
- `INVALIDATE_SESSIONS` : détruire tous les jetons et incrémenter une génération de session afin qu'aucun jeton ancien ne redevienne valide.

Le pilote doit confirmer ses transitions. Une commande envoyée n'est pas considérée comme une preuve que la radio a réellement changé d'état.

## 5. Bouton physique

- anti-rebond matériel ou logiciel à définir après identification de la Wemos ;
- GPIO sans fonction de démarrage dangereuse ;
- état sûr si fil coupé ou entrée flottante ;
- appui de 3 s pour ouvrir le service ;
- la procédure future de récupération usine utilisera une séquence distincte et plus difficile à déclencher ;
- aucun appui ne peut désactiver la régulation CO₂.

## 6. Modèle vérifié

Le modèle exécutable est `simulateur/src/service-access.js`. Six essais automatisés couvrent :

- seuil d'appui et verrouillage jusqu'au relâchement ;
- fenêtre de 15 minutes après démarrage confirmé ;
- fermeture et invalidation des sessions ;
- réessai puis défaut ;
- arrêt inattendu ;
- indépendance complète vis-à-vis de la sortie de régulation.

Ce modèle constitue la référence comportementale. Le composant C++ `service_mode` ne couvre encore que le bouton, la durée et la génération de session ; l'intégration aux événements Wi-Fi ESP-IDF restera à tester sur la carte réelle.

## 7. Critères sur matériel

- activation entre 3,0 et 3,3 s d'appui continu ;
- aucun déclenchement sur 100 essais d'appuis inférieurs à 2,5 s ;
- arrêt radio au plus tard 2 s après expiration ;
- ancien jeton refusé après arrêt/redémarrage du service ;
- régulation et watchdog inchangés pendant activation, usage, perte et arrêt Wi-Fi ;
- mémoire récupérée après 20 cycles successifs ;
- aucun redémarrage ESP32 provoqué par portail captif ou requêtes répétées.
