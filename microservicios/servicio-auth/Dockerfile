FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el esquema de Prisma, config y generar el cliente
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN npx prisma generate

# Copiar el resto del código fuente
COPY . .

EXPOSE 3000

# Script de inicio: sincroniza la BD y luego arranca la app
CMD sh -c "npx prisma db push && npm run dev"
