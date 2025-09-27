export default {
  "/clientes": {
    "get": {
      "tags": ["Clientes"],
      "summary": "Listar clientes",
      "description": "Lista todos os clientes com filtros opcionais e paginação",
      "parameters": [
        {
          "in": "query",
          "name": "page",
          "schema": {
            "type": "integer",
            "minimum": 1,
            "default": 1
          },
          "description": "Número da página para paginação"
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
          "description": "Quantidade de itens por página"
        },
        {
          "in": "query",
          "name": "nome",
          "schema": {
            "type": "string"
          },
          "description": "Filtrar clientes por nome (busca parcial)"
        },
        {
          "in": "query",
          "name": "email",
          "schema": {
            "type": "string"
          },
          "description": "Filtrar clientes por email (busca parcial)"
        },
        {
          "in": "query",
          "name": "cpf",
          "schema": {
            "type": "string"
          },
          "description": "Filtrar clientes por CPF (busca exata)"
        },
        {
          "in": "query",
          "name": "telefone",
          "schema": {
            "type": "string"
          },
          "description": "Filtrar clientes por telefone (busca parcial)"
        }
      ],
      "responses": {
        "200": {
          "description": "Lista de clientes retornada com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/Cliente"
                    }
                  },
                  "pagination": {
                    "type": "object",
                    "properties": {
                      "page": {
                        "type": "integer",
                        "example": 1
                      },
                      "limit": {
                        "type": "integer", 
                        "example": 10
                      },
                      "total": {
                        "type": "integer",
                        "example": 50
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
        "400": {
          "description": "Parâmetros de consulta inválidos",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "message": {
                          "type": "string"
                        },
                        "field": {
                          "type": "string"
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
          "description": "Erro interno do servidor"
        }
      }
    },
    "post": {
      "tags": ["Clientes"],
      "summary": "Criar novo cliente",
      "description": "Cria um novo cliente no sistema. Nome é obrigatório, demais campos são opcionais.",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ClienteCreate"
            },
            "examples": {
              "cliente_completo": {
                "summary": "Cliente com todos os dados",
                "value": {
                  "nome": "João Silva Santos",
                  "email": "joao.silva@email.com",
                  "cpf": "12345678901",
                  "telefone": "(11) 98765-4321",
                  "endereco": "Rua das Flores, 123 - Centro - São Paulo/SP"
                }
              },
              "cliente_minimo": {
                "summary": "Cliente apenas com nome",
                "value": {
                  "nome": "Maria Oliveira"
                }
              },
              "cliente_parcial": {
                "summary": "Cliente com alguns dados",
                "value": {
                  "nome": "Pedro Costa",
                  "email": "pedro@email.com",
                  "telefone": "(11) 99999-8888"
                }
              }
            }
          }
        }
      },
      "responses": {
        "201": {
          "description": "Cliente criado com sucesso",
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
                    "example": "Cliente criado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/Cliente"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "Dados de entrada inválidos",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "message": {
                          "type": "string",
                          "example": "Nome deve ter pelo menos 2 caracteres"
                        },
                        "field": {
                          "type": "string",
                          "example": "nome"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "409": {
          "description": "Email ou CPF já existem no sistema",
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
                    "example": "Email já está sendo usado por outro cliente"
                  },
                  "field": {
                    "type": "string",
                    "example": "email"
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
  "/clientes/{id}": {
    "get": {
      "tags": ["Clientes"],
      "summary": "Buscar cliente por ID",
      "description": "Retorna um cliente específico pelo seu ID",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "description": "ID do cliente"
        }
      ],
      "responses": {
        "200": {
          "description": "Cliente encontrado com sucesso",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": true
                  },
                  "data": {
                    "$ref": "#/components/schemas/Cliente"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "ID inválido",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "success": {
                    "type": "boolean",
                    "example": false
                  },
                  "errors": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "message": {
                          "type": "string",
                          "example": "ID deve ser um número válido maior que 0"
                        },
                        "field": {
                          "type": "string",
                          "example": "id"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "404": {
          "description": "Cliente não encontrado",
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
                    "example": "Cliente não encontrado com o ID informado"
                  },
                  "field": {
                    "type": "string",
                    "example": "id"
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
    "patch": {
      "tags": ["Clientes"],
      "summary": "Atualizar cliente",
      "description": "Atualiza dados de um cliente existente. Todos os campos são opcionais.",
      "parameters": [
        {
          "in": "path",
          "name": "id",
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "description": "ID do cliente"
        }
      ],
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "$ref": "#/components/schemas/ClienteUpdate"
            },
            "examples": {
              "atualizar_nome": {
                "summary": "Atualizar apenas o nome",
                "value": {
                  "nome": "João Silva Santos Jr."
                }
              },
              "atualizar_contato": {
                "summary": "Atualizar dados de contato",
                "value": {
                  "email": "novo.email@exemplo.com",
                  "telefone": "(11) 97777-6666"
                }
              },
              "atualizar_completo": {
                "summary": "Atualizar múltiplos campos",
                "value": {
                  "nome": "João Silva Santos",
                  "email": "joao.silva.novo@email.com",
                  "telefone": "(11) 95555-4444",
                  "endereco": "Av. Paulista, 1000 - Bela Vista - São Paulo/SP"
                }
              },
              "limpar_campos": {
                "summary": "Limpar campos opcionais (usar string vazia)",
                "value": {
                  "email": "",
                  "cpf": "",
                  "endereco": ""
                }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Cliente atualizado com sucesso",
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
                    "example": "Cliente atualizado com sucesso"
                  },
                  "data": {
                    "$ref": "#/components/schemas/Cliente"
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
          "description": "Cliente não encontrado"
        },
        "409": {
          "description": "Email ou CPF já existem em outro cliente",
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
                    "example": "Email já está sendo usado por outro cliente"
                  },
                  "field": {
                    "type": "string",
                    "example": "email"
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
    "delete": {
      "tags": ["Clientes"],
      "summary": "Remover cliente",
      "description": "Remove um cliente do sistema. Não é possível remover clientes que possuem vendas ou outros registros associados.",
      "parameters": [
        {
          "in": "path",
          "name": "id", 
          "required": true,
          "schema": {
            "type": "integer",
            "minimum": 1
          },
          "description": "ID do cliente"
        }
      ],
      "responses": {
        "204": {
          "description": "Cliente removido com sucesso (sem conteúdo retornado)",
          "content": {}
        },
        "200": {
          "description": "Cliente removido com sucesso (resposta com dados)",
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
                    "example": "Cliente removido com sucesso"
                  },
                  "data": {
                    "type": "null"
                  }
                }
              }
            }
          }
        },
        "400": {
          "description": "ID inválido"
        },
        "404": {
          "description": "Cliente não encontrado"
        },
        "409": {
          "description": "Cliente possui registros associados",
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
                    "example": "Não é possível remover cliente que possui vendas ou outros registros associados"
                  },
                  "field": {
                    "type": "string",
                    "example": "relacionamentos"
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
  }
};