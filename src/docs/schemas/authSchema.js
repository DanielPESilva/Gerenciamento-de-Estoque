const authSchemas = {
  AuthRegisterRequest: {
    type: 'object',
    required: ['nome', 'email', 'senha'],
    properties: {
      nome: {
        type: 'string',
        description: 'Nome completo do usuário',
        example: 'João Silva'
      },
      email: {
        type: 'string',
        format: 'email',
        description: 'Email único do usuário',
        example: 'joao@example.com'
      },
      senha: {
        type: 'string',
        minLength: 6,
        description: 'Senha do usuário (mínimo 6 caracteres)',
        example: 'minhasenha123'
      }
    }
  },
  AuthLoginRequest: {
    type: 'object',
    required: ['email', 'senha'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
        example: 'joao@example.com'
      },
      senha: {
        type: 'string',
        description: 'Senha do usuário',
        example: 'minhasenha123'
      }
    }
  },
  AuthResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      data: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'integer',
                example: 1
              },
              nome: {
                type: 'string',
                example: 'João Silva'
              },
              email: {
                type: 'string',
                example: 'joao@example.com'
              }
            }
          },
          accessToken: {
            type: 'string',
            description: 'Token JWT para autenticação',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refreshToken: {
            type: 'string',
            description: 'Token para renovar o accessToken',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      },
      message: {
        type: 'string',
        example: 'Login realizado com sucesso'
      }
    }
  },
  ForgotPasswordRequest: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
        example: 'joao@example.com'
      }
    }
  },
  ResetPasswordRequest: {
    type: 'object',
    required: ['email', 'code', 'senha'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        description: 'Email do usuário',
        example: 'joao@example.com'
      },
      code: {
        type: 'string',
        minLength: 6,
        maxLength: 6,
        description: 'Código de 6 dígitos recebido por email',
        example: '123456'
      },
      senha: {
        type: 'string',
        minLength: 6,
        description: 'Nova senha',
        example: 'novasenha123'
      }
    }
  },
  RefreshTokenRequest: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: {
        type: 'string',
        description: 'Token de refresh válido',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      }
    }
  },
  TokenResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      data: {
        type: 'object',
        properties: {
          accessToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          },
          refreshToken: {
            type: 'string',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
          }
        }
      }
    }
  },
  MessageResponse: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        example: true
      },
      message: {
        type: 'string',
        example: 'Operação realizada com sucesso'
      }
    }
  }
};

export default authSchemas;