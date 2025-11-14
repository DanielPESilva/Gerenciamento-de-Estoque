import { describe, expect, test } from '@jest/globals';
import UsuariosSchema from '../../schemas/usuariosSchema.js';

describe('UsuariosSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = UsuariosSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate large ID', () => {
      const result = UsuariosSchema.id.parse({ id: '999' });
      expect(result.id).toBe(999);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        UsuariosSchema.id.parse({ id: 'invalid' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        UsuariosSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        UsuariosSchema.id.parse({ id: '-5' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('create schema', () => {
    test('should validate valid user data', () => {
      const validData = {
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: 'senha123'
      };
      const result = UsuariosSchema.create.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should validate minimum valid data', () => {
      const validData = {
        nome: 'Ana',
        email: 'ana@test.com',
        senha: '123456'
      };
      const result = UsuariosSchema.create.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should reject short name', () => {
      const invalidData = {
        nome: 'Jo',
        email: 'joao@email.com',
        senha: 'senha123'
      };
      expect(() => {
        UsuariosSchema.create.parse(invalidData);
      }).toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should reject invalid email', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'invalid-email',
        senha: 'senha123'
      };
      expect(() => {
        UsuariosSchema.create.parse(invalidData);
      }).toThrow('Email deve ter um formato válido');
    });

    test('should reject short password', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'joao@email.com',
        senha: '123'
      };
      expect(() => {
        UsuariosSchema.create.parse(invalidData);
      }).toThrow('Senha deve ter pelo menos 6 caracteres');
    });

    test('should reject missing required fields', () => {
      const incompleteData = {
        nome: 'João Silva'
        // missing email and senha
      };
      expect(() => {
        UsuariosSchema.create.parse(incompleteData);
      }).toThrow();
    });
  });

  describe('update schema', () => {
    test('should validate partial update data', () => {
      const updateData = {
        nome: 'Novo Nome'
      };
      const result = UsuariosSchema.update.parse(updateData);
      expect(result.nome).toBe('Novo Nome');
    });

    test('should validate complete update data', () => {
      const updateData = {
        nome: 'Maria Santos',
        email: 'maria@newemail.com',
        senha: 'newpassword123'
      };
      const result = UsuariosSchema.update.parse(updateData);
      expect(result).toEqual(updateData);
    });

    test('should accept empty update object', () => {
      const result = UsuariosSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should reject short name in update', () => {
      const invalidData = {
        nome: 'AB'
      };
      expect(() => {
        UsuariosSchema.update.parse(invalidData);
      }).toThrow('Nome deve ter pelo menos 3 caracteres');
    });

    test('should reject invalid email in update', () => {
      const invalidData = {
        email: 'not-an-email'
      };
      expect(() => {
        UsuariosSchema.update.parse(invalidData);
      }).toThrow('Email deve ter um formato válido');
    });

    test('should reject short password in update', () => {
      const invalidData = {
        senha: '12345'
      };
      expect(() => {
        UsuariosSchema.update.parse(invalidData);
      }).toThrow('Senha deve ter pelo menos 6 caracteres');
    });
  });

  describe('query schema', () => {
    test('should validate empty query with defaults', () => {
      const result = UsuariosSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate complete query', () => {
      const queryData = {
        page: '3',
        limit: '25',
        nome: 'João',
        email: 'joao@email.com'
      };
      const result = UsuariosSchema.query.parse(queryData);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.nome).toBe('João');
      expect(result.email).toBe('joao@email.com');
    });

    test('should apply defaults for pagination', () => {
      const queryData = {
        nome: 'Maria'
      };
      const result = UsuariosSchema.query.parse(queryData);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.nome).toBe('Maria');
    });

    test('should reject invalid page number', () => {
      const invalidQuery = {
        page: '0'
      };
      expect(() => {
        UsuariosSchema.query.parse(invalidQuery);
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject invalid limit (too high)', () => {
      const invalidQuery = {
        limit: '150'
      };
      expect(() => {
        UsuariosSchema.query.parse(invalidQuery);
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject invalid limit (too low)', () => {
      const invalidQuery = {
        limit: '0'
      };
      expect(() => {
        UsuariosSchema.query.parse(invalidQuery);
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should handle string page and limit conversion', () => {
      const queryData = {
        page: '5',
        limit: '50'
      };
      const result = UsuariosSchema.query.parse(queryData);
      expect(result.page).toBe(5);
      expect(result.limit).toBe(50);
    });
  });
});