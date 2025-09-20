#!/bin/bash

echo "=== Testando todas as formas de pagamento ==="
echo

echo "1. PIX:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Pix" | jq '.pagination.total'

echo "2. DINHEIRO:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Dinheiro" | jq '.pagination.total'

echo "3. CARTÃO DE CRÉDITO:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Cartão de Crédito" | jq '.pagination.total'

echo "4. CARTÃO DE DÉBITO:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Cartão de Débito" | jq '.pagination.total'

echo "5. BOLETO:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Boleto" | jq '.pagination.total'

echo "6. CHEQUE:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Cheque" | jq '.pagination.total'

echo "7. ESCAMBO:"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Escambo" | jq '.pagination.total'

echo
echo "=== Teste de filtro parcial ==="
echo "Filtrar por 'Cartão' (deve pegar os dois tipos):"
curl -s -X GET "http://localhost:3000/api/vendas?forma_pgto=Cartão" | jq '.pagination.total'
