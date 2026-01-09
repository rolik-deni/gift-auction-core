# --- Stage 1: Development ---
FROM node:20.15.0-alpine As development
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "start:dev"]

# --- Stage 2: Production ---
FROM node:20.15.0-alpine As production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/main"]
