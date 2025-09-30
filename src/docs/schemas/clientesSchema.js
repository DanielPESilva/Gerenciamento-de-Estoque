export default {
  Cliente: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "ID único do cliente",
        example: 1
      },
      nome: {
        type: "string",
        description: "Nome completo do cliente",
        example: "João Silva Santos"
      },
      email: {
        type: "string",
        format: "email",
        description: "Email do cliente (opcional)",
        example: "joao.silva@email.com",
        nullable: true
      },
      cpf: {
        type: "string",
        description: "CPF do cliente com 11 dígitos (opcional)",
        example: "12345678901",
        nullable: true
      },
      telefone: {
        type: "string",
        description: "Telefone do cliente (opcional)",
        example: "(11) 98765-4321",
        nullable: true
      },
      endereco: {
        type: "string",
        description: "Endereço completo do cliente (opcional)",
        example: "Rua das Flores, 123 - Centro - São Paulo/SP",
        nullable: true
      },
      criado_em: {
        type: "string",
        format: "date-time",
        description: "Data e hora de criação do cliente",
        example: "2025-09-26T10:30:00.000Z"
      },
      atualizado_em: {
        type: "string",
        format: "date-time", 
        description: "Data e hora da última atualização",
        example: "2025-09-26T15:45:00.000Z"
      }
    },
    required: ["id", "nome", "criado_em"]
  },

  ClienteCreate: {
    type: "object",
    required: ["nome"],
    properties: {
      nome: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        description: "Nome completo do cliente (obrigatório)",
        example: "João Silva Santos"
      },
      email: {
        type: "string",
        format: "email",
        description: "Email do cliente (opcional). Use string vazia para limpar.",
        example: "joao.silva@email.com"
      },
      cpf: {
        type: "string",
        pattern: "^\\d{11}$",
        description: "CPF do cliente com exatamente 11 dígitos (opcional). Use string vazia para limpar.",
        example: "12345678901"
      },
      telefone: {
        type: "string",
        minLength: 10,
        maxLength: 15,
        description: "Telefone do cliente (opcional). Use string vazia para limpar.",
        example: "(11) 98765-4321"
      },
      endereco: {
        type: "string",
        maxLength: 200,
        description: "Endereço completo do cliente (opcional). Use string vazia para limpar.",
        example: "Rua das Flores, 123 - Centro - São Paulo/SP"
      }
    }
  },

  ClienteUpdate: {
    type: "object",
    properties: {
      nome: {
        type: "string",
        minLength: 2,
        maxLength: 100,
        description: "Novo nome do cliente (opcional)"
      },
      email: {
        type: "string",
        format: "email",
        description: "Novo email do cliente (opcional). Use string vazia para limpar campo."
      },
      cpf: {
        type: "string",
        pattern: "^\\d{11}$",
        description: "Novo CPF do cliente com exatamente 11 dígitos (opcional). Use string vazia para limpar campo."
      },
      telefone: {
        type: "string",
        minLength: 10,
        maxLength: 15,
        description: "Novo telefone do cliente (opcional). Use string vazia para limpar campo."
      },
      endereco: {
        type: "string",
        maxLength: 200,
        description: "Novo endereço do cliente (opcional). Use string vazia para limpar campo."
      }
    },
    additionalProperties: false
  },

  ClienteLista: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      data: {
        type: "array",
        items: {
          "$ref": "#/components/schemas/Cliente"
        }
      },
      pagination: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            description: "Página atual",
            example: 1
          },
          limit: {
            type: "integer",
            description: "Itens por página",
            example: 10
          },
          total: {
            type: "integer",
            description: "Total de clientes encontrados",
            example: 50
          },
          totalPages: {
            type: "integer",
            description: "Total de páginas",
            example: 5
          },
          hasNext: {
            type: "boolean",
            description: "Indica se há próxima página",
            example: true
          },
          hasPrev: {
            type: "boolean",
            description: "Indica se há página anterior", 
            example: false
          }
        }
      }
    }
  },

  ClienteResposta: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Operação realizada com sucesso"
      },
      data: {
        oneOf: [
          { "$ref": "#/components/schemas/Cliente" },
          { "type": "null" }
        ]
      }
    }
  },

  ClienteErro: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false
      },
      message: {
        type: "string",
        example: "Erro na operação"
      },
      field: {
        type: "string",
        description: "Campo que causou o erro",
        example: "email"
      }
    }
  },

  ClienteErroValidacao: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false
      },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Nome deve ter pelo menos 2 caracteres"
            },
            field: {
              type: "string",
              example: "nome"
            }
          }
        }
      }
    }
  }
};