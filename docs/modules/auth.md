# Module : Authentification (Phase 3)

## 1. Analyse Métier & Objectifs
Le module d'authentification est le point d'entrée de l'application WorkPlace. Il doit garantir une séparation absolue et stricte entre les trois types d'utilisateurs (Admin, Client, Artisan), conformément à la règle métier majeure du projet. 

Il doit fournir un système basé sur des tokens (JWT et Refresh Token) sécurisé, et gérer l'envoi d'OTP (via SMTP Brevo avec fallback dans la console pour les tests) lors de l'inscription.

## 2. Cas d'Utilisation (Use Cases)

### Pour le Client :
- S'inscrire avec un email (optionnel) et un numéro de téléphone (obligatoire).
- Se connecter avec son numéro de téléphone ou son email, et son mot de passe.
- Se déconnecter.
- Rafraîchir son token de session.

### Pour l'Artisan :
- S'inscrire avec ses informations de base.
- Se connecter avec son numéro de téléphone ou son email, et son mot de passe.
- Se déconnecter.
- Rafraîchir son token de session.

### Pour l'Admin :
- Se connecter avec un email et un mot de passe (les admins sont créés par la base de données, pas d'inscription publique).
- Se déconnecter.

## 3. Architecture du Module

La complexité vient de la séparation des tables. Nous allons adopter une structure avec des contrôleurs et services séparés pour chaque type d'utilisateur au sein du module Auth, afin de respecter le principe de responsabilité unique (SOLID).

```text
src/auth/
 ├── auth.module.ts
 ├── controllers/
 │    ├── auth-admin.controller.ts
 │    ├── auth-client.controller.ts
 │    └── auth-artisan.controller.ts
 ├── services/
 │    ├── auth-admin.service.ts
 │    ├── auth-client.service.ts
 │    ├── auth-artisan.service.ts
 │    └── token.service.ts
 ├── dto/
 │    ├── register-client.dto.ts
 │    ├── register-artisan.dto.ts
 │    ├── login.dto.ts
 │    └── token.dto.ts
 ├── strategies/
 │    ├── jwt-admin.strategy.ts
 │    ├── jwt-client.strategy.ts
 │    └── jwt-artisan.strategy.ts
 └── guards/
      ├── jwt-admin.guard.ts
      ├── jwt-client.guard.ts
      └── jwt-artisan.guard.ts
```

## 4. Modèle de Données (Prisma)
*(Déjà défini dans la Phase 1)*
- Table `Admin`
- Table `ClientUser`
- Table `ArtisanUser`

## 5. Sécurité et JWT
Les payloads JWT contiendront le `sub` (ID de l'utilisateur) et un type `role` explicite (`ADMIN`, `CLIENT`, `ARTISAN`) pour éviter qu'un token client ne soit utilisé sur une route admin.

- **Access Token** : Durée de vie courte (ex: 15 minutes).
- **Refresh Token** : Durée de vie longue (ex: 7 jours). Stocké (en hash) en base de données ou vérifié via JWT.

## 6. Plan d'Action (Développement)

1. **Setup JWT** : Installer `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`.
2. **Génération du module** : Créer l'architecture des dossiers listée ci-dessus.
3. **Token Service** : Coder le service responsable de générer et vérifier les paires de clés JWT.
4. **Services Auth** : Implémenter le hachage de mot de passe (Bcrypt) et les méthodes `login` et `register` pour chaque entité.
5. **Stratégies & Guards** : Implémenter les stratégies Passport pour sécuriser les routes.
6. **Contrôleurs** : Créer les endpoints exposés pour le front-end.
7. **Tests** : Rédiger les tests unitaires pour les services.
