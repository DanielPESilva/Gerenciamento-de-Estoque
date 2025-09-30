const imagensSchema = {
  Imagem: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        description: "ID único da imagem",
        example: 1
      },
      item_id: {
        type: "integer",
        description: "ID do item ao qual a imagem pertence",
        example: 1
      },
      nome_arquivo: {
        type: "string",
        description: "Nome único do arquivo no sistema",
        example: "camiseta-azul-123e4567-e89b-12d3-a456-426614174000.jpg"
      },
      nome_original: {
        type: "string",
        description: "Nome original do arquivo enviado",
        example: "IMG_20240929_143022.jpg"
      },
      caminho: {
        type: "string",
        description: "Caminho completo do arquivo no servidor",
        example: "uploads/imagens/camiseta-azul-123e4567-e89b-12d3-a456-426614174000.jpg"
      },
      url: {
        type: "string",
        description: "URL para acessar a imagem via API",
        example: "/api/imagens/1/camiseta-azul-123e4567-e89b-12d3-a456-426614174000.jpg"
      },
      tamanho: {
        type: "integer",
        description: "Tamanho do arquivo em bytes",
        example: 2048576
      },
      tipo: {
        type: "string",
        description: "Tipo MIME do arquivo",
        enum: [
          "image/jpeg",
          "image/jpg", 
          "image/png",
          "image/gif",
          "image/webp",
          "image/bmp"
        ],
        example: "image/jpeg"
      },
      criado_em: {
        type: "string",
        format: "date-time",
        description: "Data e hora de criação da imagem",
        example: "2024-09-29T17:30:22.000Z"
      }
    },
    required: ["id", "item_id", "nome_arquivo", "nome_original", "caminho", "url", "tamanho", "tipo", "criado_em"]
  },

  CreateImagemRequest: {
    type: "object",
    properties: {
      item_id: {
        type: "integer",
        description: "ID do item ao qual as imagens serão associadas",
        example: 1
      },
      images: {
        type: "array",
        items: {
          type: "string",
          format: "binary"
        },
        description: "Arquivos de imagem para upload",
        minItems: 1,
        maxItems: 5
      }
    },
    required: ["item_id", "images"]
  },

  ImagemUploadResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Imagens enviadas com sucesso"
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Imagem"
        }
      }
    }
  },

  ImagemListResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Imagens encontradas"
      },
      data: {
        type: "array",
        items: {
          $ref: "#/components/schemas/Imagem"
        }
      }
    }
  },

  ImagemDeleteResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: true
      },
      message: {
        type: "string",
        example: "Imagem excluída com sucesso"
      }
    }
  },

  ImagemErrorResponse: {
    type: "object", 
    properties: {
      success: {
        type: "boolean",
        example: false
      },
      message: {
        type: "string",
        example: "Erro ao processar imagem"
      },
      errors: {
        type: "array",
        items: {
          type: "string"
        },
        example: ["Formato de arquivo não suportado"]
      }
    }
  }
};

export default imagensSchema;