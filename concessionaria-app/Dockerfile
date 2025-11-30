# /frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expõe a porta do Vite
EXPOSE 5173

# O "--host" é OBRIGATÓRIO para o Vite funcionar no Docker
CMD ["npm", "run", "dev", "--", "--host"]