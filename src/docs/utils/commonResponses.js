const commonResponses = {
  Success200: {
    description: 'Operação realizada com sucesso',
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
              type: 'object',
              description: 'Dados retornados pela operação'
            },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso'
            }
          }
        }
      }
    }
  },

  SuccessWithPagination200: {
    description: 'Lista paginada retornada com sucesso',
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
                type: 'object'
              }
            },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 50 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 5 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false }
              }
            }
          }
        }
      }
    }
  },

  Created201: {
    description: 'Recurso criado com sucesso',
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
              type: 'object',
              description: 'Dados do recurso criado'
            },
            message: {
              type: 'string',
              example: 'Recurso criado com sucesso'
            }
          }
        }
      }
    }
  },

  BadRequest400: {
    description: 'Erro de validação ou requisição inválida',
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
                    example: 'nome'
                  },
                  message: {
                    type: 'string',
                    example: 'Nome deve ter pelo menos 3 caracteres'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  NotFound404: {
    description: 'Recurso não encontrado',
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
                    example: 'item'
                  },
                  message: {
                    type: 'string',
                    example: 'Item não encontrado'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  InternalServerError500: {
    description: 'Erro interno do servidor',
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
                    example: 'server'
                  },
                  message: {
                    type: 'string',
                    example: 'Erro interno do servidor'
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  UnprocessableEntity422: {
    description: 'Erro de lógica de negócio',
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
                    example: 'estoque'
                  },
                  message: {
                    type: 'string',
                    example: 'Estoque insuficiente para realizar a operação'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default commonResponses;