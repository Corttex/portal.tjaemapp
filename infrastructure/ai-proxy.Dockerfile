FROM node:20-alpine

WORKDIR /app

# Instalar dependências
COPY package.json ./
RUN npm install --production

# Copiar proxy server
COPY app_build/proxy-server.js ./

# Porta
EXPOSE 3000

# Iniciar
CMD ["node", "proxy-server.js"]
