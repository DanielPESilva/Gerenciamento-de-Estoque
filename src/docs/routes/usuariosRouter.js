import commonResponses from '../utils/commonResponses.js';

const usuariosRouter = {
  '/api/usuarios': {
    get: {
      tags: ['Usuários'],
      summary: 'Listar todos os usuários',
      description: 'Retorna uma lista paginada de todos os usuários cadastrados',
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
          description: 'Número de usuários por página',
          required: false,
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10,
            example: 10
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
      tags: ['Usuários'],
      summary: 'Criar novo usuário',
      description: 'Cria um novo usuário no sistema',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/CreateUsuarioRequest'
            },
            examples: {
              usuario1: {
                summary: 'Exemplo de Usuário',
                value: {
                  nome: 'João Silva',
                  email: 'joao@exemplo.com',
                  senha: 'minhasenha123'
                }
              },
              usuario2: {
                summary: 'Usuário Admin',
                value: {
                  nome: 'Admin Sistema',
                  email: 'admin@dressfy.com',
                  senha: 'admin123456'
                }
              }
            }
          }
        }
      },
      responses: {
        '201': commonResponses.Created201,
        '400': commonResponses.BadRequest400,
        '422': commonResponses.UnprocessableEntity422,
        '500': commonResponses.InternalServerError500
      }
    }
  },

  '/api/usuarios/me': {
    get: {
      tags: ['Usuários'],
      summary: 'Obter perfil do usuário atual',
      description: 'Retorna os dados do usuário logado (funcionalidade para futura autenticação)',
      responses: {
        '200': commonResponses.Success200,
        '401': {
          description: 'Não autorizado - Token de acesso inválido ou expirado',
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
                        path: { type: 'string', example: 'auth' },
                        message: { type: 'string', example: 'Token de acesso inválido' }
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

  '/api/usuarios/{id}': {
    get: {
      tags: ['Usuários'],
      summary: 'Buscar usuário por ID',
      description: 'Retorna os detalhes de um usuário específico pelo seu ID',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do usuário',
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
      tags: ['Usuários'],
      summary: 'Atualizar usuário',
      description: 'Atualiza os dados de um usuário existente',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do usuário',
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
              $ref: '#/components/schemas/UpdateUsuarioRequest'
            },
            example: {
              nome: 'João Santos Silva',
              email: 'joao.santos@exemplo.com'
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
    },
    delete: {
      tags: ['Usuários'],
      summary: 'Deletar usuário',
      description: 'Remove um usuário do sistema',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID do usuário',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1,
            example: 1
          }
        }
      ],
      responses: {
        '204': {
          description: 'Usuário deletado com sucesso (sem conteúdo retornado)',
          content: {}
        },
        '404': commonResponses.NotFound404,
        '422': {
          description: 'Erro de lógica - Usuário possui itens vinculados',
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
                        path: { type: 'string', example: 'usuario' },
                        message: { type: 'string', example: 'Usuário possui itens vinculados e não pode ser removido' }
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
  }
};

export default usuariosRouter;