export default {
  "/condicionais": {
    "get": {
      "tags": ["Condicionais"],
      "summary": "Listar condicionais",
      "description": "Lista todos os condicionais com filtros e paginação",
      "parameters": [
        {
          "in": "query",
          "name": "cliente_id",
          "schema": {
            "type": "integer"
          },
          "description": "ID do cliente para filtrar"
        },
        {
          "in": "query",
          "name": "devolvido",
          "schema": {
            "type": "boolean"
          },
          "description": "Status de devolução (true/false)"
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
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de condicionais",
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
                    "example": "Condicionais listados com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "data": {
                        "type": "array",
                        "items": {
                          "$ref": "#/components/schemas/CondicionalCompleto"
                        }
                      },
                      "total": {
                        "type": "integer",
                        "example": 25
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
                        "example": 3
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
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    },
    "post": {
      "tags": ["Condicionais"],
      "summary": "Criar novo condicional",
      "description": "Cria um novo condicional com itens especificados por ID ou nome",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CondicionalCreate"
            },
            "examples": {
              "por_id": {
                "summary": "Seleção de itens por ID",
                "value": {
                  "cliente_id": 1,
                  "data_devolucao": "2025-12-15T23:59:59.000Z",
                  "itens": [
                    {
                      "roupas_id": 5,
                      "quantidade": 2
                    },
                    {
                      "roupas_id": 8,
                      "quantidade": 1
                    }
                  ]
                }
              },
              "por_nome": {
                "summary": "Seleção de itens por nome",
                "value": {
                  "cliente_id": 2,
                  "data_devolucao": "2025-12-20T23:59:59.000Z",
                  "itens": [
                    {
                      "nome_item": "Vestido Floral",
                      "quantidade": 1
                    },
                    {
                      "nome_item": "Bolsa Preta",
                      "quantidade": 1
                    }
                  ]
                }
              },
              "misto": {
                "summary": "Seleção mista (ID e nome)",
                "value": {
                  "cliente_id": 3,
                  "data_devolucao": "2025-12-18T23:59:59.000Z",
                  "itens": [
                    {
                      "roupas_id": 10,
                      "quantidade": 1
                    },
                    {
                      "nome_item": "Sapato Social",
                      "quantidade": 2
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
          "description": "Condicional criado com sucesso",
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
                    "example": "Condicional criado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CondicionalCompleto"
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "404": {
          "description": "Cliente ou item não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "example": {
                "success": false,
                "message": "Cliente com ID 999 não encontrado",
                "code": "CLIENT_NOT_FOUND"
              }
            }
          }
        },
        "409": {
          "description": "Estoque insuficiente",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "example": {
                "success": false,
                "message": "Estoque insuficiente para Vestido Azul. Disponível: 1, Solicitado: 3",
                "code": "INSUFFICIENT_STOCK"
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/estatisticas": {
    "get": {
      "tags": ["Condicionais"],
      "summary": "Obter estatísticas de condicionais",
      "description": "Retorna estatísticas sobre condicionais (total, ativos, devolvidos)",
      "parameters": [
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
        }
      ],
      "responses": {
        "200": {
          "description": "Estatísticas dos condicionais",
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
                    "$ref": "#/components/schemas/CondicionalEstatisticas"
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/{id}": {
    "get": {
      "tags": ["Condicionais"],
      "summary": "Buscar condicional por ID",
      "description": "Retorna um condicional específico com todos os itens e informações do cliente",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "responses": {
        "200": {
          "description": "Condicional encontrado",
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
                    "example": "Condicional encontrado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CondicionalCompleto"
                  }
                }
              }
            }
          }
        },
        "404": {
          "$ref": "#/components/responses/NotFound"
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    },
    "put": {
      "tags": ["Condicionais"],
      "summary": "Atualizar condicional",
      "description": "Atualiza informações de um condicional existente (cliente ou data de devolução)",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CondicionalUpdate"
            },
            "examples": {
              "atualizar_cliente": {
                "summary": "Alterar cliente",
                "value": {
                  "cliente_id": 5
                }
              },
              "atualizar_data": {
                "summary": "Alterar data de devolução",
                "value": {
                  "data_devolucao": "2026-03-01T23:59:59.000Z"
                }
              },
              "atualizar_ambos": {
                "summary": "Alterar cliente e data",
                "value": {
                  "cliente_id": 3,
                  "data_devolucao": "2025-12-25T23:59:59.000Z"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Condicional atualizado com sucesso",
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
                    "example": "Condicional atualizado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CondicionalCompleto"
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "404": {
          "$ref": "#/components/responses/NotFound"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    },
    "delete": {
      "tags": ["Condicionais"],
      "summary": "Deletar condicional",
      "description": "Deleta um condicional e retorna todos os itens ao estoque",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "responses": {
        "200": {
          "description": "Condicional deletado com sucesso",
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
                    "example": "Condicional deletado com sucesso. Estoque foi restaurado"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "id": {
                        "type": "integer",
                        "example": 123
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "404": {
          "$ref": "#/components/responses/NotFound"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/{id}/devolver-item": {
    "post": {
      "tags": ["Condicionais"],
      "summary": "Devolver item específico",
      "description": "Devolve uma quantidade específica de um item do condicional",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CondicionalDevolverItem"
            },
            "example": {
              "roupas_id": 5,
              "quantidade": 1
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Item devolvido com sucesso",
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
                    "example": "Item devolvido com sucesso. Quantidade devolvida: 1. Itens restantes no condicional: 2"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "quantidadeDevolvida": {
                        "type": "integer",
                        "example": 1
                      },
                      "itensRestantes": {
                        "type": "integer",
                        "example": 2
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "404": {
          "description": "Condicional ou item não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "example": {
                "success": false,
                "message": "Item não encontrado neste condicional",
                "code": "ITEM_NOT_IN_CONDICIONAL"
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/{id}/finalizar": {
    "post": {
      "tags": ["Condicionais"],
      "summary": "Finalizar condicional",
      "description": "Finaliza o condicional devolvendo todos os itens restantes ao estoque",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "requestBody": {
        "required": false,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CondicionalFinalizar"
            },
            "example": {
              "observacoes": "Cliente devolveu todos os itens em perfeito estado"
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Condicional finalizado com sucesso",
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
                    "example": "Condicional finalizado com sucesso. Todos os itens foram devolvidos ao estoque"
                  },
                  "data": {
                    "$ref": "#/components/schemas/CondicionalCompleto"
                  }
                }
              }
            }
          }
        },
        "400": {
          "$ref": "#/components/responses/BadRequest"
        },
        "404": {
          "$ref": "#/components/responses/NotFound"
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/{id}/converter-venda": {
    "post": {
      "tags": ["Condicionais"],
      "summary": "Converter condicional em venda",
      "description": "Converte um condicional em uma venda efetiva com os itens selecionados",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer"
          },
          "description": "ID do condicional"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/CondicionalConverterVenda"
            },
            "examples": {
              "venda_parcial": {
                "summary": "Venda com alguns itens",
                "value": {
                  "itens_vendidos": [
                    {
                      "roupas_id": 5,
                      "quantidade": 1
                    },
                    {
                      "roupas_id": 8,
                      "quantidade": 2
                    }
                  ],
                  "desconto": 10.50,
                  "forma_pagamento": "Cartão de Crédito",
                  "observacoes": "Cliente comprou parte dos itens"
                }
              },
              "venda_total": {
                "summary": "Venda de todos os itens",
                "value": {
                  "itens_vendidos": "todos",
                  "desconto": 0,
                  "forma_pagamento": "Dinheiro",
                  "observacoes": "Cliente decidiu comprar tudo"
                }
              },
              "venda_com_desconto": {
                "summary": "Venda com desconto",
                "value": {
                  "itens_vendidos": "todos",
                  "desconto": 25.00,
                  "forma_pagamento": "Pix",
                  "observacoes": "Desconto promocional aplicado"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Condicional convertido em venda com sucesso",
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
                    "example": "Condicional convertido em venda com sucesso. 2 item(ns) vendido(s), 1 item(ns) ainda no condicional"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "venda": {
                        "$ref": "#/components/schemas/Venda"
                      },
                      "condicional_atualizado": {
                        "$ref": "#/components/schemas/CondicionalCompleto"
                      },
                      "itens_vendidos": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "roupas_id": {
                              "type": "integer",
                              "example": 5
                            },
                            "nome_item": {
                              "type": "string",
                              "example": "Vestido Floral"
                            },
                            "quantidade": {
                              "type": "integer",
                              "example": 1
                            },
                            "preco": {
                              "type": "number",
                              "format": "decimal",
                              "example": 150.00
                            }
                          }
                        }
                      },
                      "itens_devolvidos": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "roupas_id": {
                              "type": "integer",
                              "example": 3
                            },
                            "quantidade": {
                              "type": "integer",
                              "example": 1
                            },
                            "nome": {
                              "type": "string",
                              "example": "Bolsa Preta"
                            }
                          }
                        }
                      },
                      "resumo": {
                        "type": "object",
                        "properties": {
                          "valor_total_venda": {
                            "type": "number",
                            "format": "decimal",
                            "example": 299.90
                          },
                          "desconto_aplicado": {
                            "type": "number",
                            "format": "decimal",
                            "example": 10.50
                          },
                          "valor_final": {
                            "type": "number",
                            "format": "decimal",
                            "example": 289.40
                          },
                          "condicional_finalizado": {
                            "type": "boolean",
                            "example": false
                          }
                        }
                      }
                    }
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
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "examples": {
                "dados_invalidos": {
                  "summary": "Dados de entrada inválidos",
                  "value": {
                    "success": false,
                    "message": "Dados inválidos para conversão em venda",
                    "errors": [
                      {
                        "path": "forma_pagamento",
                        "message": "Forma de pagamento deve ser: Pix, Dinheiro, Cartão de Crédito, Cartão de Débito, Boleto, Cheque ou Permuta"
                      }
                    ],
                    "code": "INVALID_DATA"
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Condicional ou item não encontrado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "examples": {
                "condicional_nao_encontrado": {
                  "summary": "Condicional não encontrado",
                  "value": {
                    "success": false,
                    "message": "Condicional não encontrado",
                    "code": "CONDICIONAL_NOT_FOUND"
                  }
                },
                "item_nao_no_condicional": {
                  "summary": "Item não está no condicional",
                  "value": {
                    "success": false,
                    "message": "Item 15 não encontrado no condicional",
                    "code": "ITEM_NOT_IN_CONDICIONAL"
                  }
                }
              }
            }
          }
        },
        "409": {
          "description": "Conflito - Quantidade inválida ou condicional já finalizado",
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "examples": {
                "quantidade_invalida": {
                  "summary": "Quantidade solicitada inválida",
                  "value": {
                    "success": false,
                    "message": "Quantidade solicitada (3) maior que disponível (2) para item Vestido Azul",
                    "code": "INVALID_QUANTITY"
                  }
                },
                "condicional_finalizado": {
                  "summary": "Condicional já finalizado",
                  "value": {
                    "success": false,
                    "message": "Condicional já foi finalizado",
                    "code": "CONDICIONAL_ALREADY_FINISHED"
                  }
                }
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/relatorios/ativos": {
    "get": {
      "tags": ["Condicionais"],
      "summary": "Relatório de condicionais ativos",
      "description": "Gera relatório detalhado de condicionais que ainda não foram devolvidos, incluindo estatísticas e alertas de vencimento",
      "parameters": [
        {
          "in": "query",
          "name": "cliente_id",
          "schema": {
            "type": "integer"
          },
          "description": "Filtrar por ID do cliente específico",
          "example": 1
        },
        {
          "in": "query",
          "name": "data_inicio",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data inicial para filtro de criação (YYYY-MM-DD)",
          "example": "2024-01-01"
        },
        {
          "in": "query",
          "name": "data_fim",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data final para filtro de criação (YYYY-MM-DD)", 
          "example": "2024-12-31"
        },
        {
          "in": "query",
          "name": "vencidos",
          "schema": {
            "type": "boolean"
          },
          "description": "Filtrar apenas condicionais vencidos (data_devolucao < hoje)",
          "example": false
        }
      ],
      "responses": {
        "200": {
          "description": "Relatório de condicionais ativos gerado com sucesso",
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
                    "example": "Relatório de condicionais ativos obtido com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "resumo": {
                        "type": "object",
                        "properties": {
                          "total_ativos": {
                            "type": "integer",
                            "example": 15,
                            "description": "Total de condicionais ativos"
                          },
                          "total_itens": {
                            "type": "integer",
                            "example": 45,
                            "description": "Total de itens em condicionais ativos"
                          },
                          "valor_total": {
                            "type": "number",
                            "format": "float",
                            "example": 2750.50,
                            "description": "Valor total dos itens em condicionais ativos"
                          },
                          "vencidos": {
                            "type": "integer",
                            "example": 3,
                            "description": "Quantidade de condicionais vencidos"
                          },
                          "a_vencer_em_7_dias": {
                            "type": "integer",
                            "example": 5,
                            "description": "Condicionais que vencem nos próximos 7 dias"
                          }
                        }
                      },
                      "condicionais": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "integer",
                              "example": 1
                            },
                            "cliente": {
                              "type": "object",
                              "properties": {
                                "id": {
                                  "type": "integer",
                                  "example": 1
                                },
                                "nome": {
                                  "type": "string",
                                  "example": "Maria Silva"
                                },
                                "email": {
                                  "type": "string",
                                  "example": "maria@email.com"
                                },
                                "telefone": {
                                  "type": "string",
                                  "example": "(11) 99999-9999"
                                }
                              }
                            },
                            "data_criacao": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-09-15T10:30:00.000Z"
                            },
                            "data_devolucao": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-10-15T23:59:59.000Z"
                            },
                            "dias_restantes": {
                              "type": "integer",
                              "example": 5,
                              "description": "Dias restantes até vencimento (negativo se vencido)"
                            },
                            "status": {
                              "type": "string",
                              "enum": ["ativo", "vencido"],
                              "example": "ativo"
                            },
                            "itens": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "id": {
                                    "type": "integer",
                                    "example": 1
                                  },
                                  "quantidade": {
                                    "type": "integer",
                                    "example": 2
                                  },
                                  "roupa": {
                                    "type": "object",
                                    "properties": {
                                      "id": {
                                        "type": "integer",
                                        "example": 5
                                      },
                                      "nome": {
                                        "type": "string",
                                        "example": "Vestido Floral"
                                      },
                                      "tipo": {
                                        "type": "string",
                                        "example": "vestido"
                                      },
                                      "tamanho": {
                                        "type": "string",
                                        "example": "M"
                                      },
                                      "cor": {
                                        "type": "string",
                                        "example": "azul"
                                      },
                                      "preco": {
                                        "type": "number",
                                        "format": "float",
                                        "example": 89.90
                                      },
                                      "valor_total": {
                                        "type": "number",
                                        "format": "float",
                                        "example": 179.80,
                                        "description": "quantidade * preco"
                                      }
                                    }
                                  }
                                }
                              }
                            },
                            "valor_total": {
                              "type": "number",
                              "format": "float",
                              "example": 179.80,
                              "description": "Valor total do condicional"
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/relatorios/devolvidos": {
    "get": {
      "tags": ["Condicionais"],
      "summary": "Relatório de condicionais devolvidos",
      "description": "Gera relatório detalhado de condicionais que já foram devolvidos, com estatísticas de itens e valores",
      "parameters": [
        {
          "in": "query",
          "name": "cliente_id",
          "schema": {
            "type": "integer"
          },
          "description": "Filtrar por ID do cliente específico",
          "example": 1
        },
        {
          "in": "query",
          "name": "data_inicio",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data inicial para filtro de criação (YYYY-MM-DD)",
          "example": "2024-01-01"
        },
        {
          "in": "query",
          "name": "data_fim",
          "schema": {
            "type": "string",
            "format": "date"
          },
          "description": "Data final para filtro de criação (YYYY-MM-DD)",
          "example": "2024-12-31"
        }
      ],
      "responses": {
        "200": {
          "description": "Relatório de condicionais devolvidos gerado com sucesso",
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
                    "example": "Relatório de condicionais devolvidos obtido com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "resumo": {
                        "type": "object",
                        "properties": {
                          "total_devolvidos": {
                            "type": "integer",
                            "example": 12,
                            "description": "Total de condicionais devolvidos"
                          },
                          "total_itens_devolvidos": {
                            "type": "integer",
                            "example": 35,
                            "description": "Total de itens devolvidos"
                          },
                          "valor_total_devolvido": {
                            "type": "number",
                            "format": "float",
                            "example": 1820.40,
                            "description": "Valor total dos itens devolvidos"
                          }
                        }
                      },
                      "condicionais": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "integer",
                              "example": 2
                            },
                            "cliente": {
                              "$ref": "#/components/schemas/ClienteInfo"
                            },
                            "data_criacao": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-08-15T10:30:00.000Z"
                            },
                            "data_devolucao": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-09-15T23:59:59.000Z",
                              "description": "Data prevista para devolução"
                            },
                            "data_efetiva_devolucao": {
                              "type": "string",
                              "format": "date-time",
                              "example": "2024-09-10T14:25:00.000Z",
                              "description": "Data efetiva da devolução"
                            },
                            "itens": {
                              "type": "array",
                              "items": {
                                "$ref": "#/components/schemas/CondicionalItemDetalhado"
                              }
                            },
                            "valor_total": {
                              "type": "number",
                              "format": "float",
                              "example": 150.00
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  },
  "/condicionais/itens/status": {
    "patch": {
      "tags": ["Condicionais"],
      "summary": "Atualizar status de itens",
      "description": "Atualiza o status de múltiplos itens (roupas) para disponível, em_condicional ou vendido. Registra histórico das alterações.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["roupas_ids", "novo_status"],
              "properties": {
                "roupas_ids": {
                  "type": "array",
                  "items": {
                    "type": "integer"
                  },
                  "description": "Array com IDs das roupas a serem atualizadas",
                  "example": [1, 2, 3]
                },
                "novo_status": {
                  "type": "string",
                  "enum": ["disponivel", "em_condicional", "vendido"],
                  "description": "Novo status para os itens",
                  "example": "em_condicional"
                }
              }
            },
            "examples": {
              "marcar_em_condicional": {
                "summary": "Marcar itens como em condicional",
                "value": {
                  "roupas_ids": [1, 2, 3],
                  "novo_status": "em_condicional"
                }
              },
              "marcar_disponivel": {
                "summary": "Marcar itens como disponível",
                "value": {
                  "roupas_ids": [4, 5],
                  "novo_status": "disponivel"
                }
              },
              "marcar_vendido": {
                "summary": "Marcar itens como vendido",
                "value": {
                  "roupas_ids": [6],
                  "novo_status": "vendido"
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Status dos itens atualizado com sucesso",
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
                    "example": "Status de 3 item(ns) atualizado(s) com sucesso"
                  },
                  "data": {
                    "type": "object",
                    "properties": {
                      "itens_atualizados": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "id": {
                              "type": "integer",
                              "example": 1
                            },
                            "nome": {
                              "type": "string",
                              "example": "Vestido Floral"
                            },
                            "status_anterior": {
                              "type": "string",
                              "example": "disponivel"
                            },
                            "status_novo": {
                              "type": "string",
                              "example": "em_condicional"
                            }
                          }
                        }
                      },
                      "novo_status": {
                        "type": "string",
                        "example": "em_condicional"
                      }
                    }
                  }
                }
              },
              "examples": {
                "sucesso_atualizacao": {
                  "summary": "Atualização bem-sucedida",
                  "value": {
                    "success": true,
                    "message": "Status de 3 item(ns) atualizado(s) com sucesso",
                    "data": {
                      "itens_atualizados": [
                        {
                          "id": 1,
                          "nome": "Vestido Floral",
                          "status_anterior": "disponivel",
                          "status_novo": "em_condicional"
                        },
                        {
                          "id": 2,
                          "nome": "Blusa Rosa",
                          "status_anterior": "disponivel",
                          "status_novo": "em_condicional"
                        },
                        {
                          "id": 3,
                          "nome": "Calça Jeans",
                          "status_anterior": "disponivel",
                          "status_novo": "em_condicional"
                        }
                      ],
                      "novo_status": "em_condicional"
                    }
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
                "$ref": "#/components/schemas/ErrorResponse"
              },
              "examples": {
                "status_invalido": {
                  "summary": "Status inválido",
                  "value": {
                    "success": false,
                    "message": "Status inválido. Valores permitidos: disponivel, em_condicional, vendido",
                    "code": "INVALID_STATUS"
                  }
                },
                "array_vazio": {
                  "summary": "Array de IDs vazio",
                  "value": {
                    "success": false,
                    "message": "roupas_ids deve ser um array não vazio",
                    "code": "INVALID_ROUPAS_IDS"
                  }
                },
                "status_obrigatorio": {
                  "summary": "Status obrigatório",
                  "value": {
                    "success": false,
                    "message": "novo_status é obrigatório",
                    "code": "MISSING_STATUS"
                  }
                }
              }
            }
          }
        },
        "500": {
          "$ref": "#/components/responses/InternalServerError"
        }
      }
    }
  }
};