# ── Etapa 1: Instalar dependencias ──────────────────
FROM node:20-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Etapa 2: Imagen final (liviana) ────────────────
FROM node:20-alpine

WORKDIR /app

# Crear usuario no-root por seguridad
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar dependencias de la etapa anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY package.json ./
COPY src ./src

# Cambiar al usuario no-root
USER appuser

EXPOSE 3000

CMD ["node", "src/server.js"]
