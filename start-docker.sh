#!/bin/bash

# ========================================
# DressFy - Script de Inicialização Docker
# ========================================

echo "🚀 Iniciando DressFy com Docker..."
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado!"
    echo "   Instale Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Verificar se Docker Compose está disponível
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose não encontrado!"
    echo "   Instale Docker Compose ou use Docker Desktop"
    exit 1
fi

echo "✅ Docker verificado com sucesso"
echo ""

# Parar containers existentes se houver
echo "🧹 Limpando containers anteriores..."
docker-compose down --remove-orphans 2>/dev/null || true

# Construir e iniciar os serviços
echo "🔨 Construindo e iniciando serviços..."
echo "   Isso pode levar alguns minutos na primeira vez..."
echo ""

# Usar docker compose (novo) ou docker-compose (antigo)
if docker compose version &> /dev/null 2>&1; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DressFy iniciado com sucesso!"
    echo ""
    echo "📍 ACESSOS:"
    echo "   🌐 API Principal: http://localhost:3000"
    echo "   📚 Documentação: http://localhost:3000/api-docs"
    echo "   ❤️  Health Check: http://localhost:3000/health"
    echo "   🗄️  MySQL: localhost:3306"
    echo ""
    echo "⏱️  Aguarde 30-60 segundos para inicialização completa"
    echo ""
    echo "🔍 Para ver logs: docker-compose logs -f"
    echo "🛑 Para parar: docker-compose down"
    echo ""
    
    # Aguardar serviços ficarem saudáveis
    echo "⏳ Aguardando serviços ficarem prontos..."
    sleep 10
    
    # Verificar se a API está respondendo
    for i in {1..12}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo "✅ API está respondendo!"
            echo ""
            echo "🎯 TESTE RÁPIDO:"
            echo "   curl http://localhost:3000/health"
            break
        else
            echo "   Tentativa $i/12 - aguardando API..."
            sleep 5
        fi
    done
    
else
    echo ""
    echo "❌ Erro ao iniciar DressFy"
    echo "   Verifique os logs: docker-compose logs"
    exit 1
fi