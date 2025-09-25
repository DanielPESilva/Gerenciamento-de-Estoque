const swaggerHead = {
  openapi: '3.0.0',
  info: {
    title: 'DressFy - API de Gerenciamento de Estoque',
    version: '1.0.0',
    description: `
      API RESTful para gerenciamento de estoque de roupas com funcionalidades completas de CRUD, 
      vendas híbridas (por ID ou nome), controle de cliente e sistema de permuta.
      
      ## Funcionalidades Principais
      - 👕 **Gerenciamento de Itens/Roupas** - CRUD completo com controle de estoque
      - 👤 **Gerenciamento de Usuários** - Cadastro e controle de usuários
      - 💰 **Sistema de Vendas Híbrido** - Aceita vendas por ID ou nome do item
      - 🔄 **Sistema de Permuta** - Troca direta de bens/serviços
      - 📞 **Controle de Clientes** - Nome e telefone opcionais nas vendas
      - 📦 **Controle de Estoque** - Subtração automática e gerenciamento manual
      
      ## Autenticação
      Esta API não requer autenticação no momento.
      
      ## Formatos de Resposta
      Todas as respostas seguem o padrão:
      - **Sucesso**: \`{ "success": true, "data": {...}, "message": "..." }\`
      - **Erro**: \`{ "success": false, "errors": [...] }\`
    `,
    contact: {
      name: 'DressFy Team',
      email: 'contato@dressfy.com'
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Servidor de Desenvolvimento',
    },
    {
      url: 'https://api.dressfy.com',
      description: 'Servidor de Produção',
    },
  ],
  tags: [
    {
      name: 'Itens',
      description: 'Operações relacionadas ao gerenciamento de itens/roupas'
    },
    {
      name: 'Usuários',
      description: 'Operações relacionadas ao gerenciamento de usuários'
    },
    {
      name: 'Vendas',
      description: 'Operações relacionadas ao sistema de vendas e permuta'
    }
  ]
};

export default swaggerHead;