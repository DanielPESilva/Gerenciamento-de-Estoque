#!/bin/bash

# ========================================
# DressFy - Script de Instalação Automática
# ========================================

echo "🚀 Iniciando configuração do DressFy..."
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 18+ primeiro."
    echo "   Download: https://nodejs.org"
    exit 1
fi

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale npm primeiro."
    exit 1
fi

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL não encontrado. Certifique-se de que está instalado e rodando."
    echo "   Download: https://dev.mysql.com/downloads/"
    echo ""
fi

echo "✅ Verificações básicas concluídas"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

# Configurar arquivo .env
if [ ! -f ".env" ]; then
    echo "⚙️  Criando arquivo de configuração..."
    cp .env.example .env
    echo "✅ Arquivo .env criado a partir do .env.example"
    echo ""
    echo "🔧 IMPORTANTE: Edite o arquivo .env com suas configurações de banco de dados!"
    echo "   Arquivo: .env"
    echo "   Linha para editar: DATABASE_URL"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Edite o arquivo .env com suas configurações de MySQL"
echo "2. Crie o banco: CREATE DATABASE dressfy_db;"
echo "3. Execute: npx prisma db push"
echo "4. Execute: npm run dev"
echo "5. Acesse: http://localhost:3000/api-docs"
echo ""
echo "📝 Para mais detalhes, consulte o README.MD"
echo ""
echo "✅ Configuração inicial concluída!"