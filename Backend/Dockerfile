# /backend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o código fonte
COPY . .

# Expõe a porta que mudamos (5001)
EXPOSE 5001

# Comando para iniciar
CMD ["node", "server.js"]