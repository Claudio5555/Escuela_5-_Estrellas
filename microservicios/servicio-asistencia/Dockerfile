FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar OpenSSL para compatibilidad con el motor de Prisma en Alpine
RUN apk add --no-cache openssl

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del codigo fuente
COPY . .

EXPOSE 3002

# Script de inicio: sincroniza la BD y luego arranca la app en produccion
CMD sh -c "npx prisma db push && npm run build && npm start"
