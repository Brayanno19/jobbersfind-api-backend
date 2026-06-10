# Documentation Modulaire de WorkPlace

Ce dossier contient la documentation détaillée de chaque module du projet WorkPlace, conformément à la méthodologie de développement incrémental adoptée.

## Pourquoi une documentation par module ?

- **Clarté technique** : Permet de comprendre instantanément les responsabilités d'un module sans lire le code.
- **Architectures respectées** : Assure que chaque module est bien découpé selon les principes Clean Architecture.
- **Onboarding facilité** : Les nouveaux développeurs peuvent se familiariser rapidement avec la base de code.

## Liste des Modules (Prévus)

- `auth` : Authentification, JWT, OTP, séparation stricte Admin/Client/Artisan.
- `database` : Connexion Prisma, configuration globale des modèles de données.
- `admins` : Gestion spécifique pour les administrateurs (BackOffice).
- `clients` : Gestion des profils clients.
- `artisans` : Gestion des profils artisans, portfolio, disponibilité.
- `search` : Moteur de recherche multicritère (métier, problème, distance, note).
- `verification` : Système de validation de l'identité et des qualifications des artisans.

---
*Ce document sera mis à jour à mesure que de nouveaux modules seront créés.*
