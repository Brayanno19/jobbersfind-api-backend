# Étape 1 : Build de l'application
FROM node:22.2-alpine AS builder

# Créer le répertoire de l'application
WORKDIR /usr/src/app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY prisma ./prisma/

# Installer toutes les dépendances (y compris devDependencies pour le build)
RUN npm ci

# Générer le client Prisma
RUN npx prisma generate

# Copier le reste du code source
COPY . .

# Construire l'application NestJS
RUN npm run build

# Étape 2 : Image de production
FROM node:22.2-alpine AS production

WORKDIR /usr/src/app

# Définir l'environnement de production
ENV NODE_ENV=production

# Copier uniquement les dépendances nécessaires pour la production
COPY package*.json ./
RUN npm ci --only=production

# Copier le client Prisma généré et le dossier build depuis l'étape 1
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /usr/src/app/dist ./dist

# Exposer le port (par défaut 3000 pour NestJS, peut être défini via .env)
EXPOSE 3000

# Commande pour démarrer l'application (assurez-vous d'avoir prisma db push ou migrate deploy lors de l'init si besoin)
CMD ["node", "dist/src/main"]

