# Gerenciamento de Estoque - Instruções Iniciais

## 1. Instale as dependências

```bash
npm install
```

## 2. Configure o banco de dados

Crie um arquivo `.env` na raiz do projeto com o conteúdo:

```
DATABASE_URL="mysql://dressfy_user:dressfy_pw@localhost:5002/dressfy_db"
```

Ajuste o usuário, senha, host e porta conforme seu ambiente/Docker.

## 3. Gere o client do Prisma e rode as migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Se quiser popular o banco com dados iniciais, use o SQL fornecido pelo professor.

## 4. Rode o servidor

```bash
npm start
```

Acesse: http://localhost:3000/clientes

## 5. Estrutura de exemplo pronta
- CRUD de clientes já implementado.
- Siga o padrão para criar rotas para as outras tabelas.

*Projeto de gerenciamento de estoque "dressfy" para ajudar no controle do estoque de lojas de roupas.*

