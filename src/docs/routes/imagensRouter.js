import commonResponses from '../utils/commonResponses.js';

const imagensRouter = {
  '/api/imagens': {
    post: {
      tags: ['Imagens'],
      summary: 'Upload de imagens',
      description: 'Faz upload de uma ou múltiplas imagens para um item específico. Suporta formatos JPEG, JPG, PNG, GIF, WEBP e BMP com tamanho máximo de 10MB por arquivo.',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                item_id: {
                  type: 'integer',
                  description: 'ID do item ao qual as imagens serão associadas',
                  example: 1
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'Arquivos de imagem (máximo 5 arquivos)',
                  maxItems: 5
                }
              },
              required: ['item_id', 'images']
            },
            examples: {
              'single-image': {
                summary: 'Upload de uma imagem',
                description: 'Exemplo de upload de uma única imagem'
              },
              'multiple-images': {
                summary: 'Upload de múltiplas imagens',
                description: 'Exemplo de upload de até 5 imagens simultaneamente'
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Imagens enviadas com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Imagens enviadas com sucesso'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Imagem'
                    }
                  }
                }
              },
              examples: {
                'upload-success': {
                  summary: 'Upload bem-sucedido',
                  value: {
                    success: true,
                    message: 'Imagens enviadas com sucesso',
                    data: [
                      {
                        id: 1,
                        item_id: 1,
                        nome_arquivo: 'camiseta-azul.jpg',
                        nome_original: 'IMG_20240929_143022.jpg',
                        caminho: 'uploads/imagens/camiseta-azul.jpg',
                        url: '/api/imagens/1/camiseta-azul.jpg',
                        tamanho: 2048576,
                        tipo: 'image/jpeg',
                        criado_em: '2024-09-29T17:30:22.000Z'
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Erro de validação ou formato de arquivo',
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
                    example: 'Formato de arquivo não suportado'
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'string'
                    },
                    example: ['Apenas arquivos JPEG, JPG, PNG, GIF, WEBP e BMP são permitidos']
                  }
                }
              }
            }
          }
        },
        404: {
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
                  message: {
                    type: 'string',
                    example: 'Item não encontrado'
                  }
                }
              }
            }
          }
        },
        413: {
          description: 'Arquivo muito grande',
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
                    example: 'Arquivo muito grande. Tamanho máximo: 10MB'
                  }
                }
              }
            }
          }
        },
        ...commonResponses.serverError
      }
    },
    get: {
      tags: ['Imagens'],
      summary: 'Listar imagens de um item',
      description: 'Retorna todas as imagens associadas a um item específico',
      parameters: [
        {
          name: 'item_id',
          in: 'query',
          description: 'ID do item para listar as imagens',
          required: true,
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        200: {
          description: 'Lista de imagens retornada com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Imagens encontradas'
                  },
                  data: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Imagem'
                    }
                  }
                }
              },
              examples: {
                'images-found': {
                  summary: 'Imagens encontradas',
                  value: {
                    success: true,
                    message: 'Imagens encontradas',
                    data: [
                      {
                        id: 1,
                        item_id: 1,
                        nome_arquivo: 'camiseta-azul.jpg',
                        nome_original: 'IMG_20240929_143022.jpg',
                        caminho: 'uploads/imagens/camiseta-azul.jpg',
                        url: '/api/imagens/1/camiseta-azul.jpg',
                        tamanho: 2048576,
                        tipo: 'image/jpeg',
                        criado_em: '2024-09-29T17:30:22.000Z'
                      },
                      {
                        id: 2,
                        item_id: 1,
                        nome_arquivo: 'camiseta-azul-detalhe.jpg',
                        nome_original: 'IMG_20240929_143045.jpg',
                        caminho: 'uploads/imagens/camiseta-azul-detalhe.jpg',
                        url: '/api/imagens/1/camiseta-azul-detalhe.jpg',
                        tamanho: 1856432,
                        tipo: 'image/jpeg',
                        criado_em: '2024-09-29T17:31:10.000Z'
                      }
                    ]
                  }
                },
                'no-images': {
                  summary: 'Nenhuma imagem encontrada',
                  value: {
                    success: true,
                    message: 'Nenhuma imagem encontrada para este item',
                    data: []
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Parâmetro item_id obrigatório',
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
                    example: 'item_id é obrigatório'
                  }
                }
              }
            }
          }
        },
        ...commonResponses.serverError
      }
    }
  },
  '/api/imagens/{itemId}/{filename}': {
    get: {
      tags: ['Imagens'],
      summary: 'Visualizar/baixar imagem',
      description: 'Retorna o arquivo de imagem para visualização ou download',
      parameters: [
        {
          name: 'itemId',
          in: 'path',
          description: 'ID do item proprietário da imagem',
          required: true,
          schema: {
            type: 'integer',
            example: 1
          }
        },
        {
          name: 'filename',
          in: 'path',
          description: 'Nome do arquivo da imagem',
          required: true,
          schema: {
            type: 'string',
            example: 'camiseta-azul.jpg'
          }
        }
      ],
      responses: {
        200: {
          description: 'Imagem retornada com sucesso',
          content: {
            'image/jpeg': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'image/png': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'image/gif': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'image/webp': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            },
            'image/bmp': {
              schema: {
                type: 'string',
                format: 'binary'
              }
            }
          }
        },
        404: {
          description: 'Imagem não encontrada',
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
                    example: 'Imagem não encontrada'
                  }
                }
              }
            }
          }
        },
        ...commonResponses.serverError
      }
    }
  },
  '/api/imagens/{id}': {
    delete: {
      tags: ['Imagens'],
      summary: 'Excluir imagem',
      description: 'Remove uma imagem específica do sistema e do banco de dados',
      parameters: [
        {
          name: 'id',
          in: 'path',
          description: 'ID da imagem a ser excluída',
          required: true,
          schema: {
            type: 'integer',
            example: 1
          }
        }
      ],
      responses: {
        200: {
          description: 'Imagem excluída com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: {
                    type: 'boolean',
                    example: true
                  },
                  message: {
                    type: 'string',
                    example: 'Imagem excluída com sucesso'
                  }
                }
              },
              examples: {
                'delete-success': {
                  summary: 'Exclusão bem-sucedida',
                  value: {
                    success: true,
                    message: 'Imagem excluída com sucesso'
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'Imagem não encontrada',
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
                    example: 'Imagem não encontrada'
                  }
                }
              }
            }
          }
        },
        ...commonResponses.serverError
      }
    }
  }
};

export default imagensRouter;