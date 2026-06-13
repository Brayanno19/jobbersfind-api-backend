# Guide de Lancement - API WorkPlace (NestJS)

Ce document décrit pas à pas la procédure de configuration et de démarrage de l'API afin d'éviter les erreurs d'initialisation, ainsi que le rôle des fichiers clés et des commandes à exécuter au début.

---

## 1. Prérequis
- **Node.js** (v18 ou supérieur de préférence)
- **npm** (inclus avec Node.js)
- **PostgreSQL** (en local ou via Docker)

---

## 2. Étapes de Démarrage (Dans l'ordre)

### Étape 1 : Configuration de l'environnement
Assurez-vous d'avoir configuré le fichier [.env](file:///d:/jobbersfind-api-backend/jobbersfind-api/.env) à la racine du projet avec les bonnes variables d'environnement, en particulier l'accès à la base de données :
```properties
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobbersfind?schema=public"
JWT_SECRET="votre_cle_secrete_jwt"
PORT=5000
```

### Étape 2 : Démarrage du serveur de base de données
La base de données doit être active. Si vous utilisez Docker, vous pouvez lancer les conteneurs PostgreSQL et Redis définis dans [docker-compose.yml](file:///d:/jobbersfind-api-backend/jobbersfind-api/docker-compose.yml) avec la commande :
```bash
docker-compose up -d
```

### Étape 3 : Synchronisation du Schéma (Prisma Push)
Avant de lancer l'application pour la première fois (ou après une modification du schéma), vous devez pousser les tables définies dans [prisma/schema.prisma](file:///d:/jobbersfind-api-backend/jobbersfind-api/prisma/schema.prisma) vers PostgreSQL. Cette commande va créer la base de données (si elle n'existe pas) et y injecter toutes les tables :
```bash
npx prisma db push
```

### Étape 4 : Initialisation des données (Seeding)
Pour que la recherche intelligente fonctionne, la base de données doit posséder les métiers standards (`JobDomain`) et le dictionnaire NLP de mots-clés (`SearchKeyword`). Exécutez le script défini dans [prisma/seed.ts](file:///d:/jobbersfind-api-backend/jobbersfind-api/prisma/seed.ts) avec :
```bash
npx prisma db seed
```
> [!NOTE]
> Cette commande s'appuie sur la configuration `"prisma": { "seed": "ts-node prisma/seed.ts" }` présente dans [package.json](file:///d:/jobbersfind-api-backend/jobbersfind-api/package.json).

### Étape 5 : Lancement de l'API
Une fois la base configurée et peuplée, vous pouvez démarrer l'API NestJS :
- **Mode Développement (Hot-Reload)** :
  ```bash
  npm run start:dev
  ```
- **Mode Standard** :
  ```bash
  npm run start
  ```

---

## 3. Rôles des Fichiers Clés

| Fichier | Rôle dans l'application |
| :--- | :--- |
| [.env](file:///d:/jobbersfind-api-backend/jobbersfind-api/.env) | Contient les variables d'environnement, identifiants BDD, secrets de jetons JWT et configurations Cloudinary. |
| [package.json](file:///d:/jobbersfind-api-backend/jobbersfind-api/package.json) | Gère les scripts de build, de test et de démarrage, ainsi que les dépendances et la configuration de commande de seeding. |
| [prisma/schema.prisma](file:///d:/jobbersfind-api-backend/jobbersfind-api/prisma/schema.prisma) | Définit le schéma de données (modèles Admin, ClientUser, ArtisanUser, Report, Notification, etc.) pour l'ORM Prisma. |
| [prisma/seed.ts](file:///d:/jobbersfind-api-backend/jobbersfind-api/prisma/seed.ts) | Script contenant les métiers de base et mots-clés de traitement de langage naturel associés pour alimenter la recherche. |
| [docker-compose.yml](file:///d:/jobbersfind-api-backend/jobbersfind-api/docker-compose.yml) | Permet de lancer rapidement une instance PostgreSQL (avec extension PostGIS) et Redis en local via conteneur. |

---

## 4. Commandes Utiles de Diagnostic

- **Tester le projet** : Pour s'assurer que toutes les fonctionnalités et injections NestJS fonctionnent :
  ```bash
  npm test
  ```
- **Vérifier le build de production** :
  ```bash
  npm run build
  ```
- **Regénérer le client Prisma** (après modification de schema.prisma) :
  ```bash
  npx prisma generate
  ```
