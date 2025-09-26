export default {
  "/compras": {
    "get": {
      "tags": ["Compras"],
      "summary": "Listar compras",
      "description": "Lista todas as compras com filtros opcionais e paginação",
      "parameters": [
        {
          "in": "query",
          "name": "page",
          "schema": {
            "type": "integer",
            "minimum": 1,
            "default": 1
          },
          "description": "Número da página"
        },
        {
          "in": "query",
          "name": "limit",
          "schema": {
            "type": "integer",
            "minimum": 1,
            "maximum": 100,
            "default": 10
          },
          "description": "Itens por página"
        },
        {
          "in": "query",
          "name": "fornecedor",
          "schema": {
            "type": "string"
          },
          "description": "Filtrar por nome do fornecedor"
        },
        {
          "in": "query",
          "name": "data_inicio",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data inicial para filtro (YYYY-MM-DD)"
        },
        {
          "in": "query",
          "name": "data_fim",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data final para filtro (YYYY-MM-DD)"
        },
        {
          "in": "query",
          "name": "valor_min",
          "schema": {
            "type": "number",
            "minimum": 0
          },
          "description": "Valor mínimo da compra"
        },
        {
          "in": "query",
          "name": "valor_max",
          "schema": {
            "type": "number",
            "minimum": 0
          },
          "description": "Valor máximo da compra"
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de compras retornada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compras listadas com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/CompraCompleta"
                        }
                      },
                      "total": {
                        "type": "integer",
                        "example": 50
                      },
                      "page": {
                        "type": "integer",
                        "example": 1
                      },
                      "limit": {
                        "type": "integer",
                        "example": 10
                      },
                      "totalPages": {
                        "type": "integer",
                        "example": 5
                      },
                      "hasNext": {
                        "type": "boolean",
                        "example": true
                      },
                      "hasPrev": {
                        "type": "boolean",
                        "example": false
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "Erro interno do servidor"
                  }
                }
              }
            }
          }
        }
      }
    },
    "post": {
      "tags": ["Compras"],
      "summary": "Criar nova compra",
      "description": "Cria uma nova compra com itens. Os itens podem ser adicionados por ID existente ou por nome.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CompraCreate"
            },
            "examples": {
              "compra_com_id": {
                "summary": "Compra com item por ID",
                "value": {
                  "forma_pgto": "Pix",
                  "valor_pago": 150.00,
                  "fornecendor": "Fornecedor ABC Ltda",
                  "telefone_forncedor": "(11) 98765-4321",
                  "itens": [
                    {
                      "roupas_id": 1,
                      "quantidade": 5,
                      "valor_peca": 30.00
                    }
                  ]
                }
              },
              "compra_com_nome": {
                "summary": "Compra com item por nome",
                "value": {
                  "forma_pgto": "Dinheiro",
                  "valor_pago": 280.00,
                  "fornecendor": "Fornecedor XYZ",
                  "itens": [
                    {
                      "nome_item": "Camiseta Polo",
                      "quantidade": 10,
                      "valor_peca": 28.00
                    }
                  ]
                }
              },
              "compra_multipla": {
                "summary": "Compra com múltiplos itens",
                "value": {
                  "forma_pgto": "Cartão de Crédito",
                  "valor_pago": 485.00,
                  "fornecendor": "Fornecedor Misto",
                  "itens": [
                    {
                      "roupas_id": 1,
                      "quantidade": 3,
                      "valor_peca": 35.00
                    },
                    {
                      "nome_item": "Vestido Floral",
                      "quantidade": 4,
                      "valor_peca": 95.00
                    }
                  ]
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Compra criada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra criada com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraCompleta"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "Dados inválidos"
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object"
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/estatisticas": {
    "get": {
      "tags": ["Compras"],
      "summary": "Obter estatísticas de compras",
      "description": "Retorna estatísticas gerais das compras com filtros opcionais por período",
      "parameters": [
        {
          "in": "query",
          "name": "data_inicio", 
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data inicial para filtro das estatísticas"
        },
        {
          "in": "query",
          "name": "data_fim",
          "schema": {
            "type": "string", 
            "format": "date"
          },
          "description": "Data final para filtro das estatísticas"
        }
      ],
      "responses": {
        "200": {
          "description": "Estatísticas obtidas com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Estatísticas obtidas com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "total_compras": {
                        "type": "integer",
                        "example": 25,
                        "description": "Total de compras no período"
                      },
                      "valor_total_gasto": {
                        "type": "number",
                        "example": 4250.00,
                        "description": "Valor total gasto em compras"
                      },
                      "valor_medio_compra": {
                        "type": "number",
                        "example": 170.00,
                        "description": "Valor médio por compra"
                      },
                      "total_itens_comprados": {
                        "type": "integer",
                        "example": 127,
                        "description": "Total de itens comprados"
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/relatorio": {
    "get": {
      "tags": ["Compras"],
      "summary": "Gerar relatório de compras por período",
      "description": "Gera relatório detalhado das compras em um período específico",
      "parameters": [
        {
          "in": "query",
          "name": "data_inicio",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data inicial do relatório (obrigatório)"
        },
        {
          "in": "query",
          "name": "data_fim",
          "required": true,
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data final do relatório (obrigatório)"
        }
      ],
      "responses": {
        "200": {
          "description": "Relatório gerado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Relatório gerado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraRelatorio"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Parâmetros obrigatórios não informados",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "É necessário informar data_inicio e data_fim"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/{id}": {
    "get": {
      "tags": ["Compras"],
      "summary": "Buscar compra por ID",
      "description": "Retorna uma compra específica com todos os seus itens",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "responses": {
        "200": {
          "description": "Compra encontrada",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra encontrada"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraCompleta"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Compra não encontrada",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra não encontrada"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    },
    "put": {
      "tags": ["Compras"],
      "summary": "Atualizar compra",
      "description": "Atualiza os dados gerais de uma compra (não inclui itens)",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CompraUpdate"
            },
            "examples": {
              "atualizar_basico": {
                "summary": "Atualizar dados básicos",
                "value": {
                  "fornecendor": "Novo Fornecedor Ltda",
                  "telefone_forncedor": "(11) 99999-8888"
                }
              },
              "atualizar_pagamento": {
                "summary": "Atualizar forma de pagamento e valor",
                "value": {
                  "forma_pgto": "Cartão de Débito",
                  "valor_pago": 425.00
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Compra atualizada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra atualizada com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraCompleta"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos"
        },
        "404": {
          "description": "Compra não encontrada"
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    },
    "delete": {
      "tags": ["Compras"],
      "summary": "Deletar compra",
      "description": "Remove uma compra e todos os seus itens do sistema",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "responses": {
        "200": {
          "description": "Compra deletada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra deletada com sucesso"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Compra não encontrada"
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/{id}/itens": {
    "get": {
      "tags": ["Compras"],
      "summary": "Listar itens da compra",
      "description": "Lista todos os itens de uma compra específica",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de itens da compra",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Itens listados com sucesso"
                  },
                  "data": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/CompraItem"
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    },
    "post": {
      "tags": ["Compras"],
      "summary": "Adicionar item à compra",
      "description": "Adiciona um novo item a uma compra existente. Se o item já existir, aumenta a quantidade.",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CompraAdicionarItem"
            },
            "examples": {
              "adicionar_por_id": {
                "summary": "Adicionar item por ID",
                "value": {
                  "roupas_id": 1,
                  "quantidade": 3,
                  "valor_peca": 25.50
                }
              },
              "adicionar_por_nome": {
                "summary": "Adicionar item por nome",
                "value": {
                  "nome_item": "Vestido Floral",
                  "quantidade": 2,
                  "valor_peca": 89.90
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Item adicionado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Item adicionado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraItem"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos"
        },
        "404": {
          "description": "Compra ou item não encontrado"
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/itens/{itemId}": {
    "put": {
      "tags": ["Compras"],
      "summary": "Atualizar item da compra",
      "description": "Atualiza quantidade ou preço de um item específico da compra",
      "parameters": [
        {
          "in": "path",
          "name": "itemId",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do item da compra"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CompraAtualizarItem"
            },
            "examples": {
              "atualizar_quantidade": {
                "summary": "Atualizar apenas quantidade",
                "value": {
                  "quantidade": 8
                }
              },
              "atualizar_preco": {
                "summary": "Atualizar apenas preço",
                "value": {
                  "valor_peca": 32.50
                }
              },
              "atualizar_ambos": {
                "summary": "Atualizar quantidade e preço",
                "value": {
                  "quantidade": 6,
                  "valor_peca": 28.75
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Item atualizado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Item atualizado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraItem"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos"
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    },
    "delete": {
      "tags": ["Compras"],
      "summary": "Remover item da compra",
      "description": "Remove completamente um item específico de uma compra",
      "parameters": [
        {
          "in": "path",
          "name": "itemId",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do item da compra"
        }
      ],
      "responses": {
        "200": {
          "description": "Item removido com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Item removido com sucesso"
                  }
                }
              }
            }
          }
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  },
  "/compras/{id}/finalizar": {
    "post": {
      "tags": ["Compras"],
      "summary": "Finalizar compra",
      "description": "Finaliza a compra e adiciona automaticamente todos os itens ao estoque do sistema",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID da compra"
        }
      ],
      "requestBody": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "properties": {
                "observacoes": {
                  "type": "string",
                  "description": "Observações sobre a finalização da compra",
                  "example": "Todos os itens recebidos em perfeito estado"
                }
              }
            },
            "examples": {
              "finalizar_simples": {
                "summary": "Finalizar sem observações",
                "value": {}
              },
              "finalizar_com_observacoes": {
                "summary": "Finalizar com observações",
                "value": {
                  "observacoes": "Mercadoria conferida e aprovada. Qualidade excelente."
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Compra finalizada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "message": {
                    "type": "string",
                    "example": "Compra finalizada com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CompraFinalizacaoResposta"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados inválidos"
        },
        "404": {
          "description": "Compra não encontrada ou sem itens para finalizar"
        },
        "500": {
          "description": "Erro interno do servidor"
        }
      }
    }
  }
};