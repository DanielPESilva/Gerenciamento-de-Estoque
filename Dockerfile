# ========================================
# DressFy - Dockerfile OTIMIZADO
# ========================================

# Imagem base do Node.js (Alpine para ser mais leve)
FROM node:18-alpine

# Instalar dependências do sistema
RUN apk add --no-cache wget curl

# Definir diretório de trabalho
WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copiar arquivos de dependências primeiro (cache do Docker)
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Gerar Prisma Client
RUN npx prisma generate

# Copiar código fonte
COPY --chown=nodejs:nodejs . .

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar
CMD ["npm", "start"]