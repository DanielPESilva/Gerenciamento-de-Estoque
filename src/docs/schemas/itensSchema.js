const itensSchema = {
  Item: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
        description: 'ID único do item'
      },
      nome: {
        type: 'string',
        example: 'Camiseta Básica',
        description: 'Nome do item'
      },
      descricao: {
        type: 'string',
        example: 'Camiseta básica de algodão',
        description: 'Descrição detalhada do item'
      },
      tipo: {
        type: 'string',
        example: 'Camiseta',
        description: 'Tipo da roupa'
      },
      tamanho: {
        type: 'string',
        example: 'M',
        description: 'Tamanho da roupa'
      },
      cor: {
        type: 'string',
        example: 'Branco',
        description: 'Cor da roupa'
      },
      preco: {
        type: 'number',
        format: 'float',
        example: 35.99,
        description: 'Preço do item'
      },
      quantidade: {
        type: 'integer',
        example: 10,
        description: 'Quantidade em estoque'
      },
      usuarios_id: {
        type: 'integer',
        example: 1,
        description: 'ID do usuário responsável'
      },
      criado_em: {
        type: 'string',
        format: 'date-time',
        example: '2025-09-24T10:30:00.000Z',
        description: 'Data de criação do item'
      }
    }
  },

  CreateItemRequest: {
    type: 'object',
    required: ['nome', 'tipo', 'tamanho', 'cor', 'preco', 'usuarios_id'],
    properties: {
      nome: {
        type: 'string',
        minLength: 3,
        example: 'Camiseta Básica',
        description: 'Nome do item (mínimo 3 caracteres)'
      },
      descricao: {
        type: 'string',
        example: 'Camiseta básica de algodão',
        description: 'Descrição detalhada do item (opcional)'
      },
      tipo: {
        type: 'string',
        minLength: 2,
        example: 'Camiseta',
        description: 'Tipo da roupa (mínimo 2 caracteres)'
      },
      tamanho: {
        type: 'string',
        minLength: 1,
        example: 'M',
        description: 'Tamanho da roupa'
      },
      cor: {
        type: 'string',
        minLength: 2,
        example: 'Branco',
        description: 'Cor da roupa (mínimo 2 caracteres)'
      },
      preco: {
        type: 'number',
        format: 'float',
        minimum: 0.01,
        example: 35.99,
        description: 'Preço do item (deve ser positivo)'
      },
      quantidade: {
        type: 'integer',
        minimum: 0,
        default: 0,
        example: 10,
        description: 'Quantidade inicial em estoque'
      },
      usuarios_id: {
        type: 'integer',
        minimum: 1,
        example: 1,
        description: 'ID do usuário responsável'
      }
    }
  },

  UpdateItemRequest: {
    type: 'object',
    properties: {
      nome: {
        type: 'string',
        minLength: 3,
        example: 'Camiseta Premium',
        description: 'Nome do item'
      },
      descricao: {
        type: 'string',
        example: 'Camiseta premium de algodão orgânico',
        description: 'Descrição detalhada do item'
      },
      tipo: {
        type: 'string',
        minLength: 2,
        example: 'Camiseta',
        description: 'Tipo da roupa'
      },
      tamanho: {
        type: 'string',
        minLength: 1,
        example: 'G',
        description: 'Tamanho da roupa'
      },
      cor: {
        type: 'string',
        minLength: 2,
        example: 'Azul',
        description: 'Cor da roupa'
      },
      preco: {
        type: 'number',
        format: 'float',
        minimum: 0.01,
        example: 45.99,
        description: 'Preço do item'
      },
      quantidade: {
        type: 'integer',
        minimum: 0,
        example: 15,
        description: 'Quantidade em estoque'
      },
      usuarios_id: {
        type: 'integer',
        minimum: 1,
        example: 1,
        description: 'ID do usuário responsável'
      }
    }
  },

  QuantityRequest: {
    type: 'object',
    required: ['quantidade'],
    properties: {
      quantidade: {
        type: 'integer',
        minimum: 1,
        example: 5,
        description: 'Quantidade a ser adicionada ou removida do estoque'
      }
    }
  },

  SearchRequest: {
    type: 'object',
    properties: {
      q: {
        type: 'string',
        minLength: 1,
        example: 'Camiseta',
        description: 'Termo de busca'
      },
      nome: {
        type: 'string',
        minLength: 1,
        example: 'Camiseta',
        description: 'Nome específico para buscar'
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10,
        example: 10,
        description: 'Limite de resultados (máximo 50)'
      }
    }
  }
};

export default itensSchema;