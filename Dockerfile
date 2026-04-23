# Usar imagem Node.js leve
FROM node:20-alpine

# Criar e definir o diretório de trabalho da aplicação
WORKDIR /app

# Copiar apenas os ficheiros de dependências primeiro (aproveita cache do Docker)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o resto do código da aplicação
COPY . .

# Compilar o Frontend (React/Vite) para a pasta /dist
RUN npm run build

# Expor a porta 3000
EXPOSE 3000

# Executar o servidor backend usando 'tsx' para lidar com o ficheiro TypeScript nativamente
CMD ["npx", "tsx", "server.ts"]
