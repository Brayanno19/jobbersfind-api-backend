# Module : Recherche Intelligente (Search)

## 1. Objectifs et Rôle
La recherche est le "moteur" de l'application WorkPlace. Contrairement à une simple recherche par mot-clé, ce module est conçu pour être intelligent : il doit comprendre un "problème" (ex: "J'ai une fuite d'eau"), le lier à un "métier" (ex: "Plombier"), puis trouver les artisans les plus pertinents et les plus proches.

Seuls les artisans dont le profil est **vérifié** (`isVerified: true`) et **actif** (`isActive: true`) remonteront dans ces résultats.

## 2. Le Processus NLP (Traitement du Langage)
Avant même de chercher en base de données, la requête de l'utilisateur subit un traitement :
1. **Normalisation** : Passage en minuscules.
2. **Nettoyage** : Suppression des accents (ex: "électricien" -> "electricien").
3. **Extraction** : Détection de mots-clés forts ou de mapping métier (ex: "fuite" -> "Plomberie").

## 3. Les Critères de Classement (Ranking System)
L'algorithme trie les résultats en calculant un **Score Global sur 100 points** pour chaque artisan :
- **Pertinence Métier (40 points)** : Si le mot clé correspond exactement au domaine de l'artisan, il prend le maximum.
- **Proximité Géographique (30 points)** : Calculé via PostGIS (`ST_Distance`). Un artisan à 1km aura 30 points, un artisan à 50km n'en aura que 5.
- **Qualité / Crédibilité (20 points)** : Basé proportionnellement sur le `credibilityScore` de l'artisan.
- **Activité / Fraîcheur (10 points)** : Bonus pour les artisans récemment mis à jour ou actifs.

## 4. Implémentation Technique (PostGIS & Prisma)
Puisque Prisma ne supporte pas nativement toutes les requêtes géospatiales de PostGIS, le module utilisera la fonction `prisma.$queryRaw` pour exécuter du SQL natif ultra-performant.

Exemple de fonctions SQL utilisées :
- `ST_MakePoint(longitude, latitude)`
- `ST_DistanceSphere(point1, point2)`

## 5. Endpoints Exposés
- `GET /search` : Recherche globale combinant texte, filtres (rayon en km) et coordonnées GPS du client.
