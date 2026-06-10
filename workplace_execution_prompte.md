# WORKPLACE - DOCUMENT DIRECTEUR DE DÉVELOPPEMENT

## Version

1.0

## Nom du Projet

**WorkPlace**

## Type de Projet

Plateforme mobile et web de mise en relation entre artisans qualifiés et clients.

---

# 1. VISION DU PROJET

WorkPlace est une plateforme numérique conçue pour résoudre un problème majeur rencontré en Afrique et particulièrement au Cameroun : la difficulté à trouver rapidement un artisan ou un professionnel compétent, fiable, vérifié et géographiquement proche.

La plateforme doit permettre :

* Aux clients de trouver rapidement une solution à leurs problèmes.
* Aux artisans de développer leur visibilité professionnelle.
* Aux administrateurs de contrôler la qualité globale du système.
* Aux vérificateurs de garantir l'authenticité des profils.

Le système doit être conçu comme une solution durable, évolutive et capable d'accueillir plusieurs centaines de milliers d'utilisateurs.

---

# 2. OBJECTIF PRINCIPAL

Permettre à un utilisateur confronté à un problème de trouver rapidement un artisan compétent, vérifié et proche de sa position géographique.

La confiance constitue le pilier principal de l'application.

Toutes les décisions techniques, fonctionnelles et ergonomiques doivent contribuer à renforcer cette confiance.

---

# 3. PRINCIPES D'ARCHITECTURE

L'application doit respecter les principes suivants :

## Modularité

Chaque fonctionnalité doit être isolée dans son propre module.

## Maintenabilité

Le code doit être facilement compréhensible par un nouveau développeur.

## Évolutivité

L'ajout de nouvelles fonctionnalités ne doit pas nécessiter une refonte complète du système.

## Réutilisabilité

Le code doit favoriser la réutilisation des composants.

## Sécurité

Toutes les données doivent être protégées.

## Performance

Les performances doivent être prises en compte dès la conception.

---

# 4. TYPES D'UTILISATEURS

## Client

Personne recherchant un service.

Fonctionnalités :

* Création de compte
* Recherche métier
* Recherche problème
* Consultation des profils
* Consultation des vidéos
* Consultation des avis
* Notation
* Commentaires
* Signalements
* Contact WhatsApp
* Contact téléphonique

---

## Artisan

Professionnel proposant ses services.

Fonctionnalités :

* Création de compte
* Gestion du profil
* Téléchargement des documents
* Vidéo de présentation
* Publication de vidéos
* Gestion de disponibilité
* Consultation des avis

---

## Vérificateur

Responsable de la validation des artisans.

Fonctionnalités :

* Vérification des documents
* Validation des profils
* Suspension des comptes

---

## Administrateur

Responsable de l'ensemble de la plateforme.

Fonctionnalités :

* Gestion des utilisateurs
* Gestion des artisans
* Gestion des signalements
* Gestion des statistiques
* Gestion des abonnements

---

# 5. RÈGLE MÉTIER MAJEURE

Les administrateurs ne doivent jamais être stockés dans les mêmes structures que les utilisateurs métier.

Interdiction :

```text
User
 ├── Admin
 ├── Client
 └── Artisan
```

Architecture attendue :

```text
Admin
ClientUser
ArtisanUser
```

Les administrateurs doivent posséder :

* leurs propres tables ;
* leur propre authentification ;
* leurs propres permissions ;
* leur propre espace d'administration.

---

# 6. PÉRIMÈTRE FONCTIONNEL DE LA VERSION 1

## Fonctionnalités Incluses

### Authentification

* Inscription
* Connexion
* OTP
* JWT
* Refresh Token

### Gestion des profils

* Profil Client
* Profil Artisan

### Vérification Artisan

* Validation
* Rejet
* Suspension

### Recherche

* Recherche métier
* Recherche problème

### Géolocalisation

* Recherche à proximité
* Classement géographique

### Publications Vidéo

* Vidéo de présentation
* Vidéos professionnelles

### Réseau Social Léger

* Fil d'actualité
* Consultation des publications

### Réputation

* Notation
* Commentaires

### Signalement

* Faux profil
* Fraude
* Mauvaise prestation

### Abonnement

* Période d'essai
* Gestion abonnement artisan

---

# 7. FONCTIONNALITÉS EXCLUES DE LA VERSION 1

Les fonctionnalités suivantes doivent être préparées architecturalement mais ne doivent pas être développées :

* Messagerie interne
* Chat temps réel
* Mobile Money
* Paiement en ligne
* Réservation
* Devis
* Appels audio
* Appels vidéo
* IA avancée
* Microservices

---

# 8. RECHERCHE INTELLIGENTE

La recherche constitue le cœur métier de WorkPlace.

Elle doit être développée comme un module indépendant.

## Recherche Métier

Exemples :

* Plombier
* Électricien
* Frigoriste
* Mécanicien

## Recherche Problème

Exemples :

* Mon congélateur ne refroidit plus
* J'ai une fuite d'eau
* Ma télévision ne s'allume plus
* Mon portail électrique est bloqué

## Processus

### Étape 1

Normalisation du texte.

### Étape 2

Suppression des accents.

### Étape 3

Tokenisation.

### Étape 4

Détection des mots-clés.

### Étape 5

Association aux catégories métiers.

### Étape 6

Calcul du score de pertinence.

### Étape 7

Classement géographique.

### Étape 8

Classement qualité.

### Étape 9

Retour des résultats.

## Critères de Classement

* 40% pertinence métier
* 30% distance
* 20% note moyenne
* 10% activité récente

---

# 9. GÉOLOCALISATION

Technologie :

PostGIS

Chaque artisan doit posséder :

* Latitude
* Longitude
* Ville
* Quartier

Rayons de recherche :

* 5 km
* 10 km
* 20 km
* 50 km
* 100 km

---

# 10. CONTACT ENTRE CLIENT ET ARTISAN

Aucune messagerie interne.

## WhatsApp

Si disponible :

```text
wa.me/237XXXXXXXXX
```

Bouton :

```text
Contacter sur WhatsApp
```

## Téléphone

Si WhatsApp indisponible :

```text
tel:+237XXXXXXXXX
```

Bouton :

```text
Appeler
```

---

# 11. STACK TECHNOLOGIQUE OFFICIELLE

## Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* PostGIS
* Redis
* JWT
* Refresh Tokens

## Stockage

* Cloudinary

## Notifications

* Firebase Cloud Messaging

## Mobile

* Flutter
* Bloc Pattern
* Repository Pattern
* Dio
* GoRouter

## Administration

* Next.js
* TypeScript
* TailwindCSS
* Shadcn UI

## Infrastructure

* Docker
* Nginx

---

# 12. ARCHITECTURE GLOBALE

```text
Flutter Mobile (Client + Artisan)
                |
                v
          NestJS API
                |
                v
      PostgreSQL + PostGIS
                |
     -------------------
     |        |        |
     v        v        v
 Redis  Cloudinary  Firebase
                |
                v
          NextJS Admin
```

---

# 13. STRUCTURE BACKEND ATTENDUE

```text
src/

auth/
admins/
clients/
artisans/
verification/
categories/
search/
videos/
reviews/
reports/
subscriptions/
notifications/

database/
common/
config/
shared/
```

---

# 14. STANDARDS DE CODE

## Obligatoires

* SOLID
* DRY
* Clean Code
* Clean Architecture

## Interdits

Variables ambiguës :

```typescript
const x = ...
const data = ...
const item = ...
```

Préférer :

```typescript
const artisanProfile = ...
const verificationRequest = ...
const artisanSubscription = ...
```

---

# 15. DÉVELOPPEMENT INCRÉMENTAL OBLIGATOIRE

Le développement doit être effectué étape par étape.

Aucun module ne doit être commencé avant validation du précédent.

---

# PHASE 1

Architecture Backend

* NestJS
* Prisma
* PostgreSQL
* Redis
* Docker
* Sécurité

---

# PHASE 2

Base de données

* Modélisation Prisma
* Relations
* Migrations

---

# PHASE 3

Authentification

* Client
* Artisan
* Admin

---

# PHASE 4

Profils

* Client
* Artisan

---

# PHASE 5
Développemnt des modules/fonctions backend 

# PHASE 12

Interface Artisan Flutter

---

# PHASE 13

Interface Client Flutter

---

# PHASE 14

Interface Administration NextJS

---

# 16. LIVRABLES ATTENDUS POUR CHAQUE MODULE

Pour chaque module développé :

1. Analyse métier
2. Cas d'utilisation
3. Architecture du module
4. Modèle Prisma
5. DTO
6. Services
7. Contrôleurs
8. Gestion d'erreurs
9. Tests
10. Documentation API

---

# 17. OBJECTIF FINAL

Construire une plateforme professionnelle, robuste, sécurisée, évolutive et maintenable permettant de devenir la référence africaine de mise en relation entre artisans qualifiés et clients, tout en garantissant une architecture capable d'accueillir les futures évolutions sans refonte majeure du système.
