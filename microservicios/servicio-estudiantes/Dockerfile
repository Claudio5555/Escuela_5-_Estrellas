FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar dependencias e instalar
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

EXPOSE 3001

# Script de inicio: sincroniza la BD y luego arranca la app
CMD sh -c "npx prisma db push && npm run dev"
