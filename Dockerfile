FROM node:20-alpine

WORKDIR /app

# Копируем зависимости backend
COPY backend/package*.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем весь backend
COPY backend/ .

# Копируем frontend в /app/frontend (рядом с backend)
COPY frontend/ /app/frontend/

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]