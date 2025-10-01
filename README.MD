# 🛍️ DressFy - Sistema de Gerenciamento de Estoque

API completa com autenticação JWT, envio de emails e documentação Swagger.

## 🚀 Instalação RÁPIDA - Docker (Recomendado)

```bash
git clone https://github.com/DanielPESilva/Gerenciamento-de-Estoque.git
cd Gerenciamento-de-Estoque
./start-docker.sh
```
**Pronto!** API em: http://localhost:3000

## 💻 Instalação Manual

**Pré-requisitos:** Node.js 18+, MySQL

```bash
git clone [repositório]
cd Gerenciamento-de-Estoque
cp .env.example .env
# Edite .env com suas credenciais MySQL
npm install
npx prisma db push
npm run dev
```

## 🌐 Acessos

- **API**: http://localhost:3000
- **Documentação**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## � Configurações (.env)

```env
# Ajuste conforme seu MySQL
DATABASE_URL="mysql://usuario:senha@localhost:3306/dressfy_db"

# Exemplos:
# XAMPP: "mysql://root:@localhost:3306/dressfy_db"
# Docker: "mysql://dressfy_user:dressfy_pass@localhost:3306/dressfy_db"
```

## � Scripts

```bash
npm run dev    # Desenvolvimento
npm start      # Produção
```

## 🚨 Problemas?

- **Banco**: Verifique se MySQL está rodando e credenciais no `.env`
- **Porta**: Mude `PORT=8000` no `.env` se 3000 estiver ocupada
- **Dependências**: `npm install`

---

## 🎯 Recursos Principais

✅ **CRUD completo** - Clientes, Itens, Vendas, etc.  
✅ **Autenticação JWT** - Login/Register seguro  
✅ **Envio de Email** - Notificações automáticas  
✅ **Documentação Swagger** - Interface interativa  
✅ **Dockerizado** - Funciona em qualquer máquina  

**Desenvolvido para controle de estoque de lojas de roupas**

