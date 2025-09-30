const authRouter = {
  '/api/auth/register': {
    'post': {
      'tags': ['Autenticação'],
      'summary': 'Registra um novo usuário',
      'description': 'Cria uma nova conta de usuário no sistema. Retorna tokens de autenticação.',
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/AuthRegisterRequest'
            }
          }
        }
      },
      'responses': {
        '201': {
          'description': 'Usuário registrado com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/AuthResponse'
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
  '/api/auth/login': {
    'post': {
      'tags': ['Autenticação'],
      'summary': 'Autentica um usuário',
      'description': 'Realiza login no sistema. Use o accessToken retornado no cabeçalho Authorization: Bearer {token}',
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/AuthLoginRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Login realizado com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/AuthResponse'
              }
            }
          }
        },
        '401': {
          'description': 'Credenciais inválidas',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
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
  '/api/auth/forgot-password': {
    'post': {
      'tags': ['Autenticação'],
      'summary': 'Solicita reset de senha por email',
      'description': 'Envia um código de 6 dígitos para o email do usuário para reset de senha.',
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/ForgotPasswordRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Instruções enviadas por email (se o email existir)',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/MessageResponse'
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
  '/api/auth/reset-password': {
    'post': {
      'tags': ['Autenticação'],
      'summary': 'Redefine a senha usando código enviado por email',
      'description': 'Use o código de 6 dígitos recebido por email para definir uma nova senha.',
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/ResetPasswordRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Senha redefinida com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/MessageResponse'
              }
            }
          }
        },
        '400': {
          'description': 'Código inválido, expirado ou dados inválidos',
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
  '/api/auth/refresh': {
    'post': {
      'tags': ['Autenticação'],
      'summary': 'Renova o token de acesso',
      'description': 'Use o refreshToken para obter um novo accessToken quando o atual expirar.',
      'requestBody': {
        'required': true,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/RefreshTokenRequest'
            }
          }
        }
      },
      'responses': {
        '200': {
          'description': 'Novos tokens gerados com sucesso',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/TokenResponse'
              }
            }
          }
        },
        '401': {
          'description': 'Refresh token inválido ou expirado',
          'content': {
            'application/json': {
              'schema': {
                '$ref': '#/components/schemas/ErrorResponse'
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
  }
};

export default authRouter;