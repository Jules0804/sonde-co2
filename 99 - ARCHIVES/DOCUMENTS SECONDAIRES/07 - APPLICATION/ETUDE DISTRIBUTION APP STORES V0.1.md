# Étude de distribution App Store et Google Play v0.1

**Date :** 20 juin 2026  
**Objet :** décider si l'interface du système doit rester une PWA locale ou devenir une application distribuée sur les stores.

## 1. Conclusion

Pour la version commerciale, une application disponible sur l'App Store et Google Play est recommandée. Elle rassurera les clients, facilitera l'installation et donnera accès aux fonctions natives utiles.

Il n'est cependant pas pertinent de réécrire séparément l'application en Swift et en Kotlin. La solution recommandée est :

1. conserver la PWA actuelle comme cœur d'interface partagé ;
2. l'intégrer dans une application hybride iOS/Android ;
3. ajouter une couche native pour l'installation, la découverte du boîtier et la sécurité ;
4. conserver l'interface Web locale comme solution de maintenance et de secours.

## 2. Pourquoi ne pas publier une simple enveloppe Web

La règle 4.2 d'Apple demande qu'une application apporte des fonctionnalités, une interface ou un contenu qui la distinguent d'un simple site Web reconditionné. Une application qui se contente d'afficher la PWA pourrait donc être refusée.

Pour être réellement adaptée aux stores, l'application devra notamment apporter :

- assistant de mise en service ;
- découverte du contrôleur sur le réseau local ;
- lecture d'un QR code d'appairage ;
- stockage sécurisé des identifiants ;
- partage natif des rapports et exports ;
- gestion claire des permissions réseau local ;
- mode de démonstration pour l'examen par les stores ;
- éventuellement Bluetooth pour le provisionnement, si l'étude technique le confirme.

Apple demande également que l'équipe de revue puisse accéder à toutes les fonctions, avec compte de démonstration ou mode de démonstration et, lorsque nécessaire, les ressources matérielles ou un QR code d'essai.

## 3. Comparaison

| Solution | Avantages | Inconvénients | Usage recommandé |
|---|---|---|---|
| PWA locale seule | Simple, sans cloud, aucune installation obligatoire, maintenance directe | Découverte réseau et permissions moins intégrées, visibilité commerciale limitée | Prototype, maintenance et secours |
| Applications Swift + Kotlin séparées | Intégration native maximale | Deux développements, coût et maintenance élevés | Seulement si les besoins natifs deviennent dominants |
| Application hybride avec cœur Web partagé | Un seul cœur d'interface, stores iOS/Android, accès aux fonctions natives | Chaîne de compilation et validation stores à maintenir | **Version commerciale recommandée** |

## 4. Architecture cible

```text
Interface PWA partagée
        |
        +-- navigateur local : maintenance et secours
        |
        +-- conteneur hybride iOS/Android
                |
                +-- découverte réseau local / QR
                +-- stockage sécurisé
                +-- permissions système
                +-- partage et diagnostics

                        API locale HTTPS
                               |
                        Contrôleur ventilation
```

La régulation reste toujours dans le contrôleur. L'application, native ou Web, ne devient jamais nécessaire au maintien de la ventilation.

## 5. Ordre de réalisation recommandé

1. Stabiliser le produit, l'API locale et les essais matériels avec la PWA.
2. Valider l'expérience sur Android et iPhone en navigateur.
3. Prototyper l'appairage et la découverte du boîtier.
4. Choisir le conteneur hybride et créer les projets iOS/Android.
5. Ajouter les fonctions réellement natives.
6. Mettre en place signature, politique de confidentialité et procédures de publication.
7. Réaliser les essais de sécurité et préparer le mode démonstration des stores.
8. Publier une version bêta avant la commercialisation.

## 6. Points à étudier avant décision finale

- besoin de Bluetooth pour le premier appairage ;
- fonctionnement lorsque le téléphone est sur un autre réseau ;
- nécessité réelle de notifications en arrière-plan ;
- modèle sans cloud ou ajout futur d'un service distant ;
- propriété des comptes développeur et continuité de maintenance ;
- politique de confidentialité et données effectivement collectées ;
- coût de développement, de publication et de maintenance annuelle.

## 7. Sources officielles consultées

- [Apple — App Review Guidelines, règle 4.2](https://developer.apple.com/app-store/review/guidelines/)
- [Android Developers — Trusted Web Activities](https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities)

Les règles des stores évoluent : elles devront être revérifiées avant la soumission.
