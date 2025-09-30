const emailSchemas = {
  SimpleEmailRequest: {
    type: 'object',
    required: ['to', 'subject', 'message'],
    properties: {
      to: {
        type: 'string',
        format: 'email',
        description: 'Email do destinatário',
        example: 'destinatario@example.com'
      },
      subject: {
        type: 'string',
        description: 'Assunto do email',
        example: 'Mensagem importante'
      },
      message: {
        type: 'string',
        description: 'Conteúdo da mensagem',
        example: 'Esta é uma mensagem de teste.'
      },
      isHtml: {
        type: 'boolean',
        description: 'Se o conteúdo é HTML (padrão: false)',
        default: false
      }
    }
  },


  SaleNotificationRequest: {
    type: 'object',
    required: ['to', 'clienteName', 'items', 'totalValue'],
    properties: {
      to: {
        type: 'string',
        format: 'email',
        description: 'Email do destinatário',
        example: 'vendas@empresa.com'
      },
      clienteName: {
        type: 'string',
        description: 'Nome do cliente',
        example: 'João Silva'
      },
      totalValue: {
        type: 'number',
        format: 'float',
        description: 'Valor total da venda',
        example: 250.50
      },
      saleDate: {
        type: 'string',
        description: 'Data da venda (opcional)',
        example: '15/01/2024'
      },
      items: {
        type: 'array',
        description: 'Itens vendidos',
        items: {
          type: 'object',
          properties: {
            nome: {
              type: 'string',
              example: 'Produto B'
            },
            quantidade: {
              type: 'integer',
              example: 2
            },
            preco: {
              type: 'number',
              format: 'float',
              example: 125.25
            }
          }
        }
      }
    }
  },

  EmailResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      data: {
        type: 'object',
        properties: {
          messageId: {
            type: 'string',
            example: '<message-id@example.com>'
          }
        }
      },
      message: {
        type: 'string',
        example: 'Email enviado com sucesso'
      }
    }
  }
};

export default emailSchemas;