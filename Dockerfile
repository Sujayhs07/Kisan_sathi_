# Node.js 20 LTS Base
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

# Install all dependencies
RUN npm --prefix frontend install
RUN npm --prefix server install

# Copy application source
COPY frontend ./frontend
COPY server ./server

# Build production frontend (generates frontend/dist)
RUN npm --prefix frontend run build

# Production Runtime Image
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Copy manifests and dependencies from builder
COPY package.json ./
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/server ./server

EXPOSE 5000

# Start unified server serving API + Frontend static assets
CMD ["npm", "--prefix", "server", "run", "start"]
