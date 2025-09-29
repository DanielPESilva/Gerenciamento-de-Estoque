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
                  usuarios_id: 7
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
                  usuarios_id: 8
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
      description: 'Busca itens pelo nome para funcionalidade de autocomplete. Use "q" ou "nome" para buscar. Ideal para campos de busca em tempo real.',
      parameters: [
        {
          name: 'q',
          in: 'query',
          description: 'Termo de busca geral (busca no nome do item)',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'camiseta'
          }
        },
        {
          name: 'nome',
          in: 'query',
          description: 'Nome específico para buscar (alternativa ao "q")',
          required: false,
          schema: {
            type: 'string',
            minLength: 1,
            example: 'vestido'
          }
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Limite de resultados retornados',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            default: 10,
            example: 5
          }
        }
      ],
      responses: {
        '200': {
          description: 'Busca realizada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          example: 4
                        },
                        nome: {
                          type: 'string',
                          example: 'Camiseta Básica'
                        },
                        tipo: {
                          type: 'string',
                          example: 'Camiseta'
                        },
                        cor: {
                          type: 'string',
                          example: 'Branco'
                        },
                        tamanho: {
                          type: 'string',
                          example: 'M'
                        },
                        preco: {
                          type: 'number',
                          format: 'float',
                          example: 35.99
                        },
                        quantidade: {
                          type: 'integer',
                          example: 10
                        },
                        disponivel: {
                          type: 'boolean',
                          example: true
                        }
                      }
                    }
                  },
                  message: {
                    type: 'string',
                    example: '1 itens encontrados'
                  }
                }
              },
              examples: {
                'busca_por_camiseta': {
                  summary: 'Busca por "camiseta"',
                  value: {
                    success: true,
                    data: [
                      {
                        id: 4,
                        nome: 'Camiseta Básica',
                        tipo: 'Camiseta',
                        cor: 'Branco',
                        tamanho: 'M',
                        preco: 35.99,
                        quantidade: 10,
                        disponivel: true
                      }
                    ],
                    message: '1 itens encontrados'
                  }
                },
                'busca_vazia': {
                  summary: 'Nenhum resultado encontrado',
                  value: {
                    success: true,
                    data: [],
                    message: '0 itens encontrados'
                  }
                }
              }
            }
          }
        },
        '400': {
          description: 'Parâmetros inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  message: {
                    type: 'string',
                    example: 'Erro de validação'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          example: 'validation'
                        },
                        message: {
                          type: 'string',
                          example: 'Deve informar \'q\' ou \'nome\' para buscar'
                        }
                      }
                    }
                  }
                }
              },
              examples: {
                'parametros_obrigatorios': {
                  summary: 'Faltam parâmetros de busca',
                  value: {
                    success: false,
                    message: 'Erro de validação',
                    errors: [
                      {
                        path: 'validation',
                        message: 'Deve informar \'q\' ou \'nome\' para buscar'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
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
      description: 'Remove um item do sistema. Retorna status 204 (No Content) quando bem-sucedido.',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do item a ser deletado',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 3
          }
        }
      ],
      responses: {
        '204': {
          description: 'Item deletado com sucesso (sem conteúdo retornado)',
          content: {}
        },
        '404': {
          description: 'Item não encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          example: 'ID'
                        },
                        message: {
                          type: 'string',
                          example: 'Item não encontrado com o ID informado'
                        }
                      }
                    }
                  }
                }
              },
              example: {
                success: false,
                errors: [
                  {
                    path: 'ID',
                    message: 'Item não encontrado com o ID informado'
                  }
                ]
              }
            }
          }
        },
        '400': {
          description: 'Parâmetros inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: false
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        path: {
                          type: 'string',
                          example: 'id'
                        },
                        message: {
                          type: 'string',
                          example: 'Expected number, received string'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
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