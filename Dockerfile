# Fase base para instalar dependências e construir a aplicação
FROM node:18-alpine AS base

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar apenas os arquivos de dependências para aproveitar o cache
COPY package.json yarn.lock ./

# Configurar DNS alternativo para evitar erros de rede temporários
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf

# Instalar dependências com tentativas de repetição para contornar falhas de rede
RUN for i in 1 2 3; do yarn install --frozen-lockfile && break || sleep 5; done

# Copiar o restante do código da aplicação
COPY . .

# Compilar a aplicação Next.js
RUN yarn build

# Fase de produção para gerar uma imagem otimizada
FROM node:18-alpine AS production

# Definir NODE_ENV como produção
ENV NODE_ENV=production

# Definir o diretório de trabalho no container
WORKDIR /app

# Copiar arquivos essenciais da fase base
COPY --from=base /app/package.json ./
COPY --from=base /app/yarn.lock ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/.env ./
COPY --from=base /app/next.config.mjs ./

# Instalar apenas dependências de produção e limpar o cache
RUN yarn install --production=true --frozen-lockfile && yarn cache clean

# Expor a porta que o Next.js usará
EXPOSE 3000

# Comando para iniciar a aplicação Next.js
CMD ["yarn", "start"]
