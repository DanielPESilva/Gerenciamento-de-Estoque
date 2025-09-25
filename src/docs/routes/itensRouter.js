import commonResponses from '../utils/commonResponses.js';

const itensRouter = {
  '/api/itens': {
    get: {
      tags: ['Itens'],
      summary: 'Listar todos os itens',
      description: 'Retorna uma lista paginada de todos os itens/roupas cadastrados com filtros opcionais',
      parameters: [
        {
          name: 'page',
          in: 'query',
          description: 'Número da página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1,
            example: 1
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Número de itens por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10
          }
        },
        {
          name: 'tipo',
          in: 'query',
          description: 'Filtrar por tipo de roupa',
          required: false,
          schema: {
            type: 'string',
            example: 'Camiseta'
          }
        },
        {
          name: 'cor',
          in: 'query',
          description: 'Filtrar por cor',
          required: false,
          schema: {
            type: 'string',
            example: 'Branco'
          }
        },
        {
          name: 'tamanho',
          in: 'query',
          description: 'Filtrar por tamanho',
          required: false,
          schema: {
            type: 'string',
            example: 'M'
          }
        }
      ],
      responses: {
        '200': commonResponses.SuccessWithPagination200,
        '400': commonResponses.BadRequest400,
        '500': commonResponses.InternalServerError500
      }
    },
    post: {
      tags: ['Itens'],
      summary: 'Criar novo item',
      description: 'Cria um novo item/roupa no sistema',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateItemRequest'
            },
            examples: {
              camiseta: {
                summary: 'Exemplo de Camiseta',
                value: {
                  nome: 'Camiseta Básica',
                  descricao: 'Camiseta básica de algodão',
                  tipo: 'Camiseta',
                  tamanho: 'M',
                  cor: 'Branco',
                  preco: 35.99,
                  quantidade: 10,
                  usuarios_id: 1
                }
              },
              calca: {
                summary: 'Exemplo de Calça',
                value: {
                  nome: 'Calça Jeans',
                  tipo: 'Calça',
                  tamanho: 'G',
                  cor: 'Azul',
                  preco: 89.90,
                  quantidade: 5,
                  usuarios_id: 1
                }
              }
            }
          }
        }
      },
      responses: {
        '201': commonResponses.Created201,
        '400': commonResponses.BadRequest400,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/itens/search': {
    get: {
      tags: ['Itens'],
      summary: 'Buscar itens por nome',
      description: 'Busca itens pelo nome para funcionalidade de autocomplete',
      parameters: [
        {
          name: 'q',
          in: 'query',
          description: 'Termo de busca',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'Camiseta'
          }
        },
        {
          name: 'nome',
          in: 'query',
          description: 'Nome específico para buscar',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'Camiseta Básica'
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Limite de resultados',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
            example: 10
          }
        }
      ],
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/itens/{id}': {
    get: {
      tags: ['Itens'],
      summary: 'Buscar item por ID',
      description: 'Retorna os detalhes de um item específico pelo seu ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    },
    put: {
      tags: ['Itens'],
      summary: 'Atualizar item',
      description: 'Atualiza completamente um item existente',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateItemRequest'
            },
            example: {
              nome: 'Camiseta Premium',
              preco: 45.99,
              quantidade: 15
            }
          }
        }
      },
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    },
    patch: {
      tags: ['Itens'],
      summary: 'Atualizar item parcialmente',
      description: 'Atualiza parcialmente um item existente',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/UpdateItemRequest'
            },
            example: {
              preco: 39.99
            }
          }
        }
      },
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    },
    delete: {
      tags: ['Itens'],
      summary: 'Deletar item',
      description: 'Remove um item do sistema',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      responses: {
        '200': commonResponses.Success200,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/itens/{id}/add-quantidade': {
    post: {
      tags: ['Itens'],
      summary: 'Adicionar quantidade ao estoque',
      description: 'Adiciona uma quantidade específica ao estoque do item',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/QuantityRequest'
            },
            example: {
              quantidade: 10
            }
          }
        }
      },
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/itens/{id}/remove-quantidade': {
    post: {
      tags: ['Itens'],
      summary: 'Remover quantidade do estoque',
      description: 'Remove uma quantidade específica do estoque do item',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/QuantityRequest'
            },
            example: {
              quantidade: 3
            }
          }
        }
      },
      responses: {
        '200': commonResponses.Success200,
        '400': commonResponses.BadRequest400,
        '404': commonResponses.NotFound404,
        '422': commonResponses.UnprocessableEntity422,
        '500': commonResponses.InternalServerError500
      }
    }
  }
};

export default itensRouter;