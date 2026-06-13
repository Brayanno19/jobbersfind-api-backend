# Module Publications (Posts)

Le module Publications permet aux artisans de partager des réalisations, des conseils ou des annonces sous forme de "posts" afin d'enrichir leur profil et de communiquer avec les clients.

## Architecture

Le module est construit sur une architecture classique NestJS :
- `PostsController` : Expose les endpoints REST pour la gestion des posts et la récupération du flux (feed).
- `PostsService` : Contient la logique métier (création, mise à jour, suppression, flux par artisan).
- `CreatePostDto` & `UpdatePostDto` : Validation des données entrantes.
- Modèle Prisma `Post` : Représente une publication dans la base de données.

## Modèle de Données (Prisma)

Un `Post` est lié à un `ArtisanUser` :
- `id` (String, UUID)
- `artisanId` (String, relation vers `ArtisanUser`)
- `content` (String) : Texte descriptif de la publication.
- `mediaUrl` (String, optionnel) : Lien vers l'image ou la vidéo uploadée.
- `mediaType` (String, optionnel) : `IMAGE` ou `VIDEO`.
- `createdAt` / `updatedAt` (DateTime)

## Fonctionnalités Principales

1. **Création d'un Post (`POST /posts`)**
   - L'artisan authentifié peut créer un post avec un texte et éventuellement un fichier média.
   - Les vidéos téléchargées sont soumises à une restriction stricte de taille (ex: max 10 Mo) pour éviter la surcharge.

2. **Flux d'un Artisan (`GET /posts/artisan/:artisanId`)**
   - Permet à n'importe quel utilisateur (client, visiteur) de récupérer la liste chronologique des posts d'un artisan spécifique.
   - Supporte la pagination.

3. **Modification et Suppression (`PATCH /posts/:id`, `DELETE /posts/:id`)**
   - L'artisan propriétaire peut modifier ou supprimer ses propres posts.

## Flux de Téléchargement des Médias
Les médias associés aux posts sont gérés en amont (ou conjointement) via le service `UploadsService` (ex: Cloudinary). Lors de la création du post, si un fichier est fourni, l'URL retournée par le service d'upload est stockée dans `mediaUrl`.

## Notes
Dans cette V1 :
- **Pas de système de Likes/Commentaires** sur les posts eux-mêmes. L'interaction principale entre les clients et les artisans reste le système de Notation/Review (`ReviewsModule`).
- L'objectif est d'offrir une vitrine vivante aux artisans sans complexifier outre mesure les interactions sociales.
