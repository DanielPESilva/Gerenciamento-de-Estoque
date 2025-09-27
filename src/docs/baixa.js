export const baixaPaths = {
  "/api/baixa": {
    get: {
      tags: ["Baixa"],
      summary: "Listar baixas",
      description: "Lista todas as baixas de estoque com filtros opcionais",
      parameters: [
        {
          name: "page",
          in: "query",
          description: "Página para paginação",
          required: false,
          schema: { type: "integer", default: 1 }
        },
        {
          name: "limit",
          in: "query", 
          description: "Limite de itens por página",
          required: false,
          schema: { type: "integer", default: 10 }
        },
        {
          name: "motivo",
          in: "query",
          description: "Filtrar por motivo da baixa",
          required: false,
          schema: { 
            type: "string",
            enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"]
          }
        },
        {
          name: "data_inicio",
          in: "query",
          description: "Data de início para filtro (YYYY-MM-DD)",
          required: false,
          schema: { type: "string", format: "date" }
        },
        {
          name: "data_fim",
          in: "query",
          description: "Data de fim para filtro (YYYY-MM-DD)",
          required: false,
          schema: { type: "string", format: "date" }
        },
        {
          name: "roupa_id",
          in: "query",
          description: "Filtrar por ID da roupa",
          required: false,
          schema: { type: "integer" }
        }
      ],
      responses: {
        200: {
          description: "Lista de baixas retornada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Baixa" }
                  },
                  pagination: {
                    type: "object",
                    properties: {
                      page: { type: "integer" },
                      limit: { type: "integer" },
                      total: { type: "integer" },
                      totalPages: { type: "integer" }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Parâmetros inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    },
    post: {
      tags: ["Baixa"],
      summary: "Criar nova baixa",
      description: "Cria uma nova baixa de estoque",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["roupa_id", "quantidade", "motivo"],
              properties: {
                roupa_id: {
                  type: "integer",
                  description: "ID da roupa para baixa"
                },
                quantidade: {
                  type: "integer",
                  minimum: 1,
                  description: "Quantidade para baixa"
                },
                motivo: {
                  type: "string",
                  enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"],
                  description: "Motivo da baixa"
                },
                observacao: {
                  type: "string",
                  description: "Observação adicional (opcional)"
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: "Baixa criada com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Baixa" }
            }
          }
        },
        400: {
          description: "Dados inválidos ou estoque insuficiente",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        },
        404: {
          description: "Roupa não encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    }
  },
  "/api/baixa/motivos": {
    get: {
      tags: ["Baixa"],
      summary: "Listar motivos de baixa",
      description: "Retorna todos os motivos disponíveis para baixa",
      responses: {
        200: {
          description: "Lista de motivos retornada com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  motivos: {
                    type: "array",
                    items: {
                      type: "string",
                      enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"]
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
  "/api/baixa/estatisticas": {
    get: {
      tags: ["Baixa"],
      summary: "Estatísticas de baixa",
      description: "Retorna estatísticas das baixas por motivo e período",
      parameters: [
        {
          name: "periodo",
          in: "query",
          description: "Período para estatísticas",
          required: false,
          schema: {
            type: "string",
            enum: ["hoje", "semana", "mes", "ano"],
            default: "mes"
          }
        }
      ],
      responses: {
        200: {
          description: "Estatísticas retornadas com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  total_baixas: { type: "integer" },
                  quantidade_total: { type: "integer" },
                  por_motivo: {
                    type: "object",
                    additionalProperties: {
                      type: "object",
                      properties: {
                        quantidade: { type: "integer" },
                        valor_total: { type: "number" }
                      }
                    }
                  },
                  periodo: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  },
  "/api/baixa/relatorio": {
    get: {
      tags: ["Baixa"],
      summary: "Relatório de baixas",
      description: "Gera relatório detalhado de baixas por período",
      parameters: [
        {
          name: "data_inicio",
          in: "query",
          description: "Data de início (YYYY-MM-DD)",
          required: true,
          schema: { type: "string", format: "date" }
        },
        {
          name: "data_fim",
          in: "query",
          description: "Data de fim (YYYY-MM-DD)",
          required: true,
          schema: { type: "string", format: "date" }
        },
        {
          name: "motivo",
          in: "query",
          description: "Filtrar por motivo específico",
          required: false,
          schema: {
            type: "string",
            enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"]
          }
        }
      ],
      responses: {
        200: {
          description: "Relatório gerado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  periodo: {
                    type: "object",
                    properties: {
                      inicio: { type: "string", format: "date" },
                      fim: { type: "string", format: "date" }
                    }
                  },
                  resumo: {
                    type: "object",
                    properties: {
                      total_baixas: { type: "integer" },
                      quantidade_total: { type: "integer" },
                      valor_total: { type: "number" }
                    }
                  },
                  baixas: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Baixa" }
                  }
                }
              }
            }
          }
        },
        400: {
          description: "Parâmetros de data inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    }
  },
  "/api/baixa/{id}": {
    get: {
      tags: ["Baixa"],
      summary: "Buscar baixa específica",
      description: "Retorna os detalhes de uma baixa específica",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID da baixa",
          schema: { type: "integer" }
        }
      ],
      responses: {
        200: {
          description: "Baixa encontrada com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Baixa" }
            }
          }
        },
        404: {
          description: "Baixa não encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    },
    patch: {
      tags: ["Baixa"],
      summary: "Atualizar baixa",
      description: "Atualiza uma baixa existente (apenas observação e motivo)",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID da baixa",
          schema: { type: "integer" }
        }
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                motivo: {
                  type: "string",
                  enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"],
                  description: "Novo motivo da baixa"
                },
                observacao: {
                  type: "string",
                  description: "Nova observação"
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: "Baixa atualizada com sucesso",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Baixa" }
            }
          }
        },
        400: {
          description: "Dados inválidos",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        },
        404: {
          description: "Baixa não encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    },
    delete: {
      tags: ["Baixa"],
      summary: "Deletar baixa",
      description: "Deleta uma baixa e restaura o estoque automaticamente",
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID da baixa",
          schema: { type: "integer" }
        }
      ],
      responses: {
        200: {
          description: "Baixa deletada e estoque restaurado com sucesso",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  estoque_restaurado: { type: "integer" }
                }
              }
            }
          }
        },
        404: {
          description: "Baixa não encontrada",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" }
            }
          }
        }
      }
    }
  }
};

export const baixaSchemas = {
  Baixa: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "ID único da baixa"
      },
      roupa_id: {
        type: "integer",
        description: "ID da roupa relacionada"
      },
      quantidade: {
        type: "integer",
        description: "Quantidade baixada do estoque"
      },
      motivo: {
        type: "string",
        enum: ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"],
        description: "Motivo da baixa"
      },
      observacao: {
        type: "string",
        nullable: true,
        description: "Observação adicional sobre a baixa"
      },
      data_baixa: {
        type: "string",
        format: "date-time",
        description: "Data e hora da baixa"
      },
      Roupa: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          tipo: { type: "string" },
          tamanho: { type: "string" },
          cor: { type: "string" },
          preco: { type: "number" }
        },
        description: "Informações da roupa relacionada"
      }
    }
  }
};