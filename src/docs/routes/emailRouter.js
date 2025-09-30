const emailRouter = {
  '/api/email/send': {
    'post': {
      'tags': ['Email'],
      'summary': 'Envia um email simples',
      'description': 'Envia um email personalizado para um destinatário. Requer autenticação JWT.',
      'security': [
        {
          'bearerAuth': []
        }
      ],
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/SimpleEmailRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Email enviado com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/EmailResponse'
              }
            }
          }
        },
        '400': {
          'description': 'Dados de entrada inválidos',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          'description': 'Token de autorização inválido ou ausente',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          'description': 'Erro interno do servidor',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },


  '/api/email/sale-notification': {
    'post': {
      'tags': ['Email'],
      'summary': 'Envia notificação de nova venda',
      'description': 'Envia uma notificação por email quando uma nova venda é realizada. Requer autenticação JWT.',
      'security': [
        {
          'bearerAuth': []
        }
      ],
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/SaleNotificationRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Notificação de venda enviada com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/EmailResponse'
              }
            }
          }
        },
        '400': {
          'description': 'Dados de entrada inválidos',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '401': {
          'description': 'Token de autorização inválido ou ausente',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        '500': {
          'description': 'Erro interno do servidor',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
              }
            }
          }
        }
      }
    }
  },

};

export default emailRouter;