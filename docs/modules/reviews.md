# Module : Avis & Notations (Reviews)

## 1. Objectifs
Ce module gère le système de réputation de la plateforme. Il permet aux clients d'évaluer la qualité des prestations des artisans. Ce module est essentiel car il nourrit directement l'algorithme de recherche en influençant le score de l'artisan.

## 2. Règles Métier
- Seuls les **Clients** peuvent laisser un avis (protégé par `ClientGuard`).
- L'avis cible un **Artisan** spécifique.
- Un client ne peut laisser qu'un seul avis par artisan. S'il interagit à nouveau, il met à jour son avis existant.
- L'avis comprend obligatoirement une **note (rating)** de 1 à 5 étoiles, et optionnellement un **commentaire textuel**.

## 3. Impact sur la Crédibilité et le Profil Artisan
Chaque ajout ou modification d'un avis déclenche une mise à jour sur le profil de l'artisan concerné :
1. **`averageRating`** : Représente la moyenne pure des notes (ex: 4.8 / 5). C'est ce qui est affiché en "étoiles" sur le profil public de l'artisan.
2. **`credibilityScore`** : Score caché utilisé par le moteur de recherche. La pondération sera stricte :
   - Note de 5 : **+10 points**
   - Note de 4 : **+5 points**
   - Note de 3 : **Neutre (0 point)**
   - Note de 2 : **-5 points**
   - Note de 1 : **-15 points** (Pénalité forte pour assainir la plateforme).

## 4. Endpoints Exposés
- `POST /reviews/:artisanId` : Créer un avis.
- `PATCH /reviews/:artisanId` : Mettre à jour son propre avis.
- `GET /reviews/artisan/:artisanId` : Consulter les avis publics d'un artisan (Paginé).
- `GET /reviews/me` : (Client) Voir tous les avis que j'ai laissés.
