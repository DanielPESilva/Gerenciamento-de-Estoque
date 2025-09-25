const usuariosSchema = {
  Usuario: {
    type: 'object',
    properties: {
      id: {
        type: 'integer',
        example: 1,
        description: 'ID único do usuário'
      },
      nome: {
        type: 'string',
        example: 'João Silva',
        description: 'Nome completo do usuário'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'joao@exemplo.com',
        description: 'Email único do usuário'
      },
      criado_em: {
        type: 'string',
        format: 'date-time',
        example: '2025-09-24T10:30:00.000Z',
        description: 'Data de criação do usuário'
      }
    }
  },

  CreateUsuarioRequest: {
    type: 'object',
    required: ['nome', 'email', 'senha'],
    properties: {
      nome: {
        type: 'string',
        minLength: 3,
        example: 'João Silva',
        description: 'Nome completo do usuário (mínimo 3 caracteres)'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'joao@exemplo.com',
        description: 'Email único do usuário'
      },
      senha: {
        type: 'string',
        minLength: 6,
        example: '123456',
        description: 'Senha do usuário (mínimo 6 caracteres)'
      }
    }
  },

  UpdateUsuarioRequest: {
    type: 'object',
    properties: {
      nome: {
        type: 'string',
        minLength: 3,
        example: 'João Santos Silva',
        description: 'Nome completo do usuário'
      },
      email: {
        type: 'string',
        format: 'email',
        example: 'joao.santos@exemplo.com',
        description: 'Email único do usuário'
      },
      senha: {
        type: 'string',
        minLength: 6,
        example: 'novaSenha123',
        description: 'Nova senha do usuário'
      }
    }
  }
};

export default usuariosSchema;