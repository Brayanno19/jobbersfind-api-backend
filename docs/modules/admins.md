# Module Administration (Admins)

Le module Administration centralise l'ensemble des opérations globales pour les utilisateurs possédant le rôle d'Administrateur sur la plateforme WorkPlace.

## Rôle et Sécurité
Ce module est protégé par deux "Guards" :
- `JwtAuthGuard` : Vérifie la validité du jeton JWT.
- `AdminGuard` : S'assure que l'utilisateur est bien de rôle `ADMIN` ou `SUPER_ADMIN`.

## Architecture
- `AdminsController` : Expose les endpoints d'administration.
- `AdminsService` : Contient la logique pour récupérer les entités globales, sans filtrage de possession.
- Il utilise `PrismaModule` pour interagir directement avec toute la base de données.

## Fonctionnalités Principales (V1)

1. **Tableau de bord et Statistiques (`GET /admins/stats`)**
   - Retourne un objet structuré avec les totaux :
     - Nombre de clients.
     - Nombre d'artisans (total, actifs, suspendus).
     - Nombre de publications (posts) et avis (reviews).
     - Modération : total des signalements, signalements en attente.

2. **Gestion des Clients**
   - `GET /admins/clients` : Liste paginée des clients, ordonnée par date d'inscription.
   - `PATCH /admins/clients/:id/status` : Permet de suspendre (`isActive: false`) ou réactiver (`isActive: true`) un client manuellement.

3. **Gestion des Artisans**
   - `GET /admins/artisans` : Liste paginée des artisans avec indicateurs métiers (`credibilityScore`, `averageRating`, `isVerified`).
   - `PATCH /admins/artisans/:id/status` : Permet de suspendre (`isActive: false`) ou réactiver (`isActive: true`) un artisan manuellement. (Si suspendu, l'artisan ne peut plus se connecter).

## Note sur l'Architecture
Ce module s'occupe de la gestion CRUD des utilisateurs de bout en bout, tandis que la validation de leurs documents d'identité est traitée de manière isolée dans le module `verification/`. Cette séparation des responsabilités permet de déléguer la vérification à des modérateurs spécifiques, et la gestion des comptes aux administrateurs généraux.
