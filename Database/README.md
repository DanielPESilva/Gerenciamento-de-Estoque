# Database Management - DressFy

Este diretório contém o sistema de gerenciamento do banco de dados do projeto DressFy.

## Arquivos Principais

### `seed-master.js` 
Arquivo consolidado que substitui todos os scripts separados de seed/update/reset. Contém todas as funcionalidades necessárias para gerenciar o banco de dados.

### `banco.sql` 
Script SQL com a estrutura completa do banco de dados.

### `seed.sql`
Script SQL com dados de exemplo (alternativa ao seed-master.js).

### `backup-old-seeds/`
Pasta com backup dos arquivos JS antigos que foram consolidados.

## Como Usar o seed-master.js

### Comandos Disponíveis

```bash
# Mostrar ajuda com todos os comandos
node Database/seed-master.js

# Limpar o banco de dados (remove todos os dados)
node Database/seed-master.js clear

# Popular apenas dados básicos (usuários, clientes, itens, vendas básicas)
node Database/seed-master.js basic

# Popular apenas dados de permuta
node Database/seed-master.js permuta

# Popular dados completos (básicos + permuta)
node Database/seed-master.js full

# Reset completo (limpar + popular dados completos)
node Database/seed-master.js reset

# Mostrar estatísticas do banco
node Database/seed-master.js stats

# Corrigir vendas antigas de "Escambo" para "Permuta"
node Database/seed-master.js fix-escambo
```

### Exemplos de Uso

```bash
# Para desenvolvimento - reset completo do banco
npm run db:reset
# ou
node Database/seed-master.js reset

# Para ver o estado atual do banco
node Database/seed-master.js stats

# Para adicionar apenas dados de permuta em um banco existente
node Database/seed-master.js permuta
```

## Dados Criados

### Usuários (3)
- Admin Dressfy (admin@dressfy.com)
- Vendedora Ana (ana@dressfy.com) 
- Vendedora Maria (maria@dressfy.com)

### Clientes (5)
- Gilberto Silva, Maria Oliveira, João Santos, Ana Costa, Pedro Lima

### Itens/Roupas (10)
- Vestido Floral, Camisa Social, Calça Jeans, Blusa de Seda, Jaqueta Jeans
- Saia Plissada, Blazer Feminino, Camiseta Básica, Short Jeans, Casaco de Lã

### Vendas (11)
- **6 vendas básicas** com diferentes formas de pagamento:
  - Pix, Dinheiro, Cartão de Crédito, Cartão de Débito, Boleto, Cheque
- **5 vendas de permuta** com descrições detalhadas de trocas

### Formas de Pagamento Suportadas
- Pix
- Dinheiro  
- Cartão de Crédito
- Cartão de Débito
- Boleto
- Cheque
- **Permuta** (com campo `descricao_permuta` para detalhar a troca)

## Scripts NPM

Adicione estes scripts ao seu `package.json`:

```json
{
  "scripts": {
    "db:reset": "node Database/seed-master.js reset",
    "db:stats": "node Database/seed-master.js stats",
    "db:clear": "node Database/seed-master.js clear",
    "db:seed": "node Database/seed-master.js full"
  }
}
```

## Vantagens da Consolidação

✅ **Organização**: Um único arquivo ao invés de 9 arquivos separados  
✅ **Performance**: Funcões otimizadas e sem duplicação de código  
✅ **Manutenção**: Mais fácil de manter e atualizar  
✅ **Flexibilidade**: Comandos específicos para diferentes necessidades  
✅ **Consistência**: Dados padronizados e validados  
✅ **Facilidade**: Interface CLI intuitiva e documentada  

## Troubleshooting

### Erro de Foreign Key
Se houver erro de chave estrangeira, use:
```bash
node Database/seed-master.js clear
node Database/seed-master.js reset
```

### Dados Inconsistentes
Para limpar e recriar tudo:
```bash
node Database/seed-master.js reset
```

### Verificar Estado do Banco
```bash
node Database/seed-master.js stats
```
