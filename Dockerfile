# Stage 1: Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend
FROM node:18-alpine
WORKDIR /app

COPY backend/package*.json ./
RUN npm install --production

COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist ./public

RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "src/server.js"]
