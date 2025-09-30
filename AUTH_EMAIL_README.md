# 🔐📧 Sistema de Autenticação e Email - DressFy API

## ✅ **Implementação Completa**

Sistema de autenticação JWT e envio de emails totalmente implementado e documentado no Swagger!

## 🚀 **Como Configurar e Testar**

### 1. **Configuração das Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_URL="mysql://root:dressfy@localhost:5002/dressfy_db"

# Server
PORT=3000

# JWT Configuration
JWT_SECRET=sua-chave-secreta-jwt-muito-segura-com-pelo-menos-32-caracteres
JWT_EXPIRES_IN=1h

# Email Configuration (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-aplicativo-do-gmail

# Email Configuration (Compatibility)
HOST=seu-email@gmail.com
PASS=sua-senha-de-aplicativo-do-gmail
```

### 2. **Configuração do Gmail para Envio de Emails**

1. Acesse sua conta do Gmail
2. Vá em **Configurações** → **Segurança**
3. Ative a **Verificação em duas etapas**
4. Gere uma **Senha de aplicativo** específica
5. Use essa senha no campo `EMAIL_PASS` e `PASS`

### 3. **Iniciar o Servidor**

```bash
# Instalar dependências (se não instaladas)
npm install

# Executar migrações do banco
npx prisma migrate dev

# Iniciar servidor
npm start
```

### 4. **Acessar a Documentação Swagger**

Abra no navegador: **http://localhost:3000/api-docs**

## 📋 **Como Testar na Documentação Swagger**

### **Passo 1: Registrar ou Fazer Login**

1. **Registrar novo usuário:**
   - Vá na seção **🔐 Autenticação**
   - Abra `POST /auth/register`
   - Clique em **"Try it out"**
   - Preencha os dados:
     ```json
     {
       "nome": "Seu Nome",
       "email": "seu.email@example.com",
       "senha": "sua-senha-123"
     }
     ```
   - Clique em **Execute**
   - **Copie o `accessToken` da resposta**

2. **Ou fazer login (se já tem conta):**
   - Vá em `POST /auth/login`
   - Use email e senha existentes
   - **Copie o `accessToken` da resposta**

### **Passo 2: Configurar Autenticação no Swagger**

1. **Clique no botão "🔒 Authorize" no topo da página**
2. **Digite:** `Bearer {seu-accessToken-aqui}`
   - Exemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Clique em "Authorize"**
4. **Feche o modal**

### **Passo 3: Testar Envio de Emails**

Agora você pode testar qualquer endpoint da seção **📧 Email**:

1. **Teste simples:**
   - Vá em `POST /email/test`
   - Clique em **"Try it out"**
   - Digite seu email no campo `to`
   - Clique em **Execute**

2. **Email personalizado:**
   - Vá em `POST /email/send`
   - Preencha os campos:
     ```json
     {
       "to": "destinatario@example.com",
       "subject": "Teste do Sistema",
       "message": "Esta é uma mensagem de teste!",
       "isHtml": false
     }
     ```

3. **Notificação de venda:**
   - Vá em `POST /email/sale-notification`
   - Preencha com dados de exemplo de uma venda

## 🔧 **Endpoints Disponíveis**

### **🔐 Autenticação**
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Fazer login
- `POST /auth/forgot-password` - Esqueci minha senha
- `POST /auth/reset-password` - Redefinir senha com código
- `POST /auth/refresh` - Renovar token

### **Email (Requer Autenticação)**
- `POST /email/send` - Enviar email personalizado
- `POST /email/sale-notification` - Notificação de venda

## 🎯 **Exemplos de Uso via cURL**

### **1. Registrar usuário:**
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "senha": "minhasenha123"
  }'
```

### **2. Fazer login:**
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "minhasenha123"
  }'
```

### **3. Enviar email (com token):**
```bash
curl -X POST "http://localhost:3000/api/email/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "to": "teste@example.com",
    "subject": "Teste",
    "message": "Email de teste"
  }'
```

## 🛠️ **Solução de Problemas**

### **Erro 500 (Servidor Interno)**
- Verifique se o arquivo `.env` está configurado corretamente
- Verifique se o banco de dados está rodando
- Execute `npx prisma migrate dev` para aplicar migrações

### **Erro de Email**
- Verifique as credenciais do Gmail no `.env`
- Certifique-se de usar senha de aplicativo, não a senha normal
- Verifique se a verificação em duas etapas está ativa

### **Erro de Autenticação**
- Verifique se o `JWT_SECRET` está definido no `.env`
- Certifique-se de que o token está sendo enviado corretamente
- Verifique se o token não expirou (padrão: 1 hora)

## 🎉 **Funcionalidades Implementadas**

- ✅ **Sistema de autenticação JWT completo**
- ✅ **Registro e login de usuários**
- ✅ **Recuperação de senha por email**
- ✅ **Refresh tokens**
- ✅ **2 tipos diferentes de emails**
- ✅ **Validação Zod em todos os endpoints**
- ✅ **Documentação Swagger completa**
- ✅ **Autenticação integrada no Swagger**
- ✅ **Templates HTML para emails**
- ✅ **Middleware de autenticação**
- ✅ **Hash de senhas com bcrypt**
- ✅ **Códigos de recuperação de senha**

**Sistema 100% funcional e pronto para uso! 🚀**