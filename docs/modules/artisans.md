# Module : Artisans (Phase 4)

## 1. Analyse Métier & Objectifs
Le module `artisans` gère l'aspect professionnel de l'application. Contrairement aux clients, le profil de l'artisan est son outil de travail principal (sa vitrine). L'artisan doit pouvoir le remplir de manière exhaustive.

L'accès en écriture (mise à jour) de ce module est strictement réservé aux utilisateurs ayant le rôle `ARTISAN`.

## 2. Cas d'Utilisation (Use Cases)
- **Consulter son propre profil (Privé)** : L'artisan voit l'ensemble de ses informations, incluant l'état de sa vérification (`isVerified`).
- **Mettre à jour ses informations de base** : Prénom, Nom, Nom de l'entreprise, Email.
- **Mettre à jour sa position géographique** : L'artisan peut mettre à jour ses coordonnées géographiques (`latitude`, `longitude`, `city`, `neighborhood`) pour être trouvable par les clients.
- **Gestion de l'avatar et bannière** : (Préparation Cloudinary).

## 3. Architecture du Module
```text
src/artisans/
 ├── artisans.module.ts
 ├── artisans.controller.ts
 ├── artisans.service.ts
 └── dto/
      ├── update-artisan.dto.ts
      ├── update-location.dto.ts
```

## 4. Sécurité
- Modification protégée par `@UseGuards(JwtAuthGuard, ArtisanGuard)`.
- Récupération de l'ID via `req.user.id`.
- Certaines routes de *lecture* pourront plus tard être publiques (pour la recherche) ou accessibles aux clients.

## 5. Plan d'Implémentation
1. Générer le module `artisans` via Nest CLI.
2. Créer les DTOs (`UpdateArtisanDto`, `UpdateLocationDto`).
3. Implémenter le `ArtisansService` (mise à jour du modèle Prisma `artisanUser`).
4. Implémenter le `ArtisansController` (endpoints `/artisans/me`, `/artisans/me/location`).
