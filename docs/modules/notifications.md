# Module : Notifications (FCM)

## 1. Analyse Métier & Objectifs
Le module `notifications` permet de maintenir l'engagement des utilisateurs en temps réel. Il sert à envoyer des notifications push (via Firebase Cloud Messaging) lors d'événements clés :
- Validation ou rejet d'un profil artisan par un vérificateur.
- Réception d'un nouvel avis/note pour un artisan.
- Action administrative sur un compte.

Pour cette phase, nous mettons en place l'architecture du module, le stockage en base de données de l'historique et des jetons FCM, ainsi qu'un service d'envoi mockable pour les tests.

## 2. Cas d'Utilisation (Use Cases)
- **Enregistrer le jeton FCM de l'appareil** : Un client ou artisan connecté peut associer le jeton FCM de son téléphone à son compte.
- **Récupérer l'historique de ses notifications** : L'utilisateur peut lister les notifications qu'il a reçues.
- **Marquer une notification comme lue** : L'utilisateur peut mettre à jour le statut d'une notification reçue.

## 3. Architecture du Module
```text
src/notifications/
 ├── notifications.module.ts
 ├── notifications.controller.ts
 ├── notifications.service.ts
 └── dto/
      └── register-token.dto.ts
```

## 4. Modèle de Données (Prisma)
Pour stocker l'historique et lier les jetons d'appareil, nous ajoutons :
- Un champ `fcmToken String?` sur les modèles `ClientUser` et `ArtisanUser`.
- Un modèle `Notification` pour l'historique :
  - `id` : UUID.
  - `userId` : ID du destinataire.
  - `userRole` : Rôle du destinataire (`CLIENT` ou `ARTISAN`).
  - `title` : Titre de la notification.
  - `body` : Corps du message.
  - `isRead` : Statut de lecture (`Boolean`, par défaut `false`).
  - `createdAt` : Horodatage.

## 5. Endpoints REST Exposés
- `POST /notifications/fcm-token` : Enregistrer/Mettre à jour le jeton FCM de l'utilisateur connecté.
- `GET /notifications/me` : Liste des notifications de l'utilisateur (triées par date décroissante).
- `PATCH /notifications/:id/read` : Marquer une notification comme lue.
