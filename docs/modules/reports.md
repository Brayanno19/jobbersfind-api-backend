# Module : Signalements (Reports)

## 1. Analyse Métier & Objectifs
La confiance est le pilier principal de WorkPlace. Pour préserver la qualité globale de la plateforme et assainir la communauté, le module `reports` permet aux utilisateurs de signaler des comportements abusifs, des fraudes, des faux profils ou de mauvaises prestations.

Les administrateurs peuvent ensuite consulter ces signalements depuis leur espace d'administration pour prendre des mesures correctives (avertissement, suspension de compte).

## 2. Cas d'Utilisation (Use Cases)
- **Signaler un utilisateur (Client ou Artisan)** : Tout utilisateur connecté (Client ou Artisan) peut soumettre un signalement détaillé à l'encontre d'un autre utilisateur.
- **Consulter les signalements (Administrateur)** : Seuls les administrateurs peuvent lister tous les signalements reçus (avec filtres par statut ou type).
- **Traiter un signalement (Administrateur)** : Un administrateur peut marquer un signalement comme résolu (`RESOLVED`) ou rejeté (`DISMISSED`), et éventuellement suspendre le compte de l'utilisateur signalé si nécessaire.

## 3. Architecture du Module
```text
src/reports/
 ├── reports.module.ts
 ├── reports.controller.ts
 ├── reports.service.ts
 └── dto/
      ├── create-report.dto.ts
      └── update-report-status.dto.ts
```

## 4. Modèle de Données (Prisma)
Le modèle `Report` sera ajouté au schéma Prisma avec les champs suivants :
- `id` : Identifiant unique (UUID).
- `reporterId` : ID de l'utilisateur qui effectue le signalement.
- `reporterRole` : Rôle du rapporteur (`CLIENT` ou `ARTISAN`).
- `reportedId` : ID de l'utilisateur signalé.
- `reportedRole` : Rôle de l'utilisateur signalé (`CLIENT` ou `ARTISAN`).
- `type` : Type de signalement (`FAKE_PROFILE`, `FRAUD`, `BAD_SERVICE`, `OTHER`).
- `description` : Explication détaillée du motif du signalement.
- `status` : État actuel du traitement (`PENDING`, `RESOLVED`, `DISMISSED`).
- `createdAt` / `updatedAt` : Suivi temporel.

## 5. Sécurité & Contrôle d'Accès
- **Création** : Accessible à tout utilisateur connecté via `@UseGuards(JwtAuthGuard)`. L'ID du rapporteur est automatiquement extrait du token pour éviter toute usurpation.
- **Gestion Admin** : Les endpoints de consultation et de mise à jour du statut des signalements sont strictement réservés aux administrateurs via `@UseGuards(JwtAuthGuard, AdminGuard)`.
