# Module : Clients (Phase 4)

## 1. Analyse Métier & Objectifs
Le module `clients` est responsable de la gestion des données relatives aux utilisateurs de type "Client" inscrits sur WorkPlace. Ce module prend le relais de l'authentification : une fois le client connecté, il lui permet de consulter, de modifier et de paramétrer son profil. 

L'accès à toutes les routes de ce module doit être strictement protégé par le `ClientGuard` et le `JwtAuthGuard`.

## 2. Cas d'Utilisation (Use Cases)
- **Consulter son profil** : Un client connecté récupère ses informations personnelles.
- **Mettre à jour son profil** : Un client peut modifier son prénom, nom, email. (Le numéro de téléphone peut nécessiter une validation OTP, qui sera ajoutée dans un second temps).
- **Mettre à jour son avatar** : (Préparation) Le client pourra envoyer une image qui sera stockée via Cloudinary.
- **Désactiver son compte** : Le client peut demander la désactivation de son compte (Soft delete).

## 3. Architecture du Module
```text
src/clients/
 ├── clients.module.ts
 ├── clients.controller.ts
 ├── clients.service.ts
 └── dto/
      ├── update-client.dto.ts
```

## 4. Sécurité
Toutes les routes exposées dans `clients.controller.ts` utiliseront le décorateur `@UseGuards(JwtAuthGuard, ClientGuard)`. Le service récupèrera systématiquement l'ID du client depuis `req.user.id` pour empêcher un client d'en modifier un autre (IDOR).

## 5. Plan d'Implémentation
1. Générer le module `clients` via Nest CLI.
2. Créer le `UpdateClientDto`.
3. Implémenter le `ClientsService` pour interagir avec Prisma (`clientUser`).
4. Implémenter le `ClientsController` avec les endpoints GET `/clients/me` et PATCH `/clients/me`.
