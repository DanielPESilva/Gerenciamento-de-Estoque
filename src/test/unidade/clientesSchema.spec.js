import { describe, expect, test } from '@jest/globals';
import ClientesSchema from '../../schemas/clientesSchema.js';

describe('ClientesSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = ClientesSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = ClientesSchema.id.parse({ id: '123' });
      expect(result.id).toBe(123);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        ClientesSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        ClientesSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        ClientesSchema.id.parse({ id: '-1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('create schema', () => {
    test('should validate minimal valid data', () => {
      const validData = {
        nome: 'João Silva'
      };
      const result = ClientesSchema.create.parse(validData);
      expect(result.nome).toBe('João Silva');
    });

    test('should validate complete valid data', () => {
      const validData = {
        nome: 'Maria Santos',
        email: 'maria@email.com',
        cpf: '12345678901',
        telefone: '11987654321',
        endereco: 'Rua das Flores, 123'
      };
      const result = ClientesSchema.create.parse(validData);
      expect(result).toEqual(validData);
    });

    test('should reject invalid email', () => {
      const invalidData = {
        nome: 'João Silva',
        email: 'email-invalido'
      };
      expect(() => {
        ClientesSchema.create.parse(invalidData);
      }).toThrow('Email deve ter um formato válido');
    });

    test('should reject invalid CPF', () => {
      const invalidData = {
        nome: 'João Silva',
        cpf: '123'
      };
      expect(() => {
        ClientesSchema.create.parse(invalidData);
      }).toThrow('CPF deve ter exatamente 11 dígitos numéricos');
    });

    test('should reject short name', () => {
      const invalidData = {
        nome: 'A'
      };
      expect(() => {
        ClientesSchema.create.parse(invalidData);
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    test('should reject long name', () => {
      const invalidData = {
        nome: 'A'.repeat(101)
      };
      expect(() => {
        ClientesSchema.create.parse(invalidData);
      }).toThrow('Nome deve ter no máximo 100 caracteres');
    });

    test('should accept empty optional fields', () => {
      const validData = {
        nome: 'João Silva',
        email: '',
        cpf: '',
        telefone: '',
        endereco: ''
      };
      const result = ClientesSchema.create.parse(validData);
      expect(result).toEqual(validData);
    });
  });

  describe('update schema', () => {
    test('should validate partial update data', () => {
      const updateData = {
        nome: 'Novo Nome'
      };
      const result = ClientesSchema.update.parse(updateData);
      expect(result.nome).toBe('Novo Nome');
    });

    test('should validate complete update data', () => {
      const updateData = {
        nome: 'Maria Atualizada',
        email: 'nova@email.com',
        cpf: '98765432100',
        telefone: '11999888777',
        endereco: 'Nova Rua, 456'
      };
      const result = ClientesSchema.update.parse(updateData);
      expect(result).toEqual(updateData);
    });

    test('should accept empty object', () => {
      const result = ClientesSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should reject invalid email in update', () => {
      const invalidData = {
        email: 'email-invalido'
      };
      expect(() => {
        ClientesSchema.update.parse(invalidData);
      }).toThrow('Email deve ter um formato válido');
    });
  });

  describe('query schema', () => {
    test('should validate query with defaults', () => {
      const result = ClientesSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate complete query', () => {
      const queryData = {
        page: '2',
        limit: '20',
        nome: 'João',
        email: 'joao@email.com',
        cpf: '12345678901',
        telefone: '11987654321'
      };
      const result = ClientesSchema.query.parse(queryData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.nome).toBe('João');
      expect(result.email).toBe('joao@email.com');
      expect(result.cpf).toBe('12345678901');
      expect(result.telefone).toBe('11987654321');
    });

    test('should apply default values for missing page and limit', () => {
      const queryData = {
        nome: 'Maria'
      };
      const result = ClientesSchema.query.parse(queryData);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.nome).toBe('Maria');
    });

    test('should reject invalid page', () => {
      const invalidQuery = {
        page: '0'
      };
      expect(() => {
        ClientesSchema.query.parse(invalidQuery);
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject invalid limit (too high)', () => {
      const invalidQuery = {
        limit: '101'
      };
      expect(() => {
        ClientesSchema.query.parse(invalidQuery);
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject invalid limit (zero)', () => {
      const invalidQuery = {
        limit: '0'
      };
      expect(() => {
        ClientesSchema.query.parse(invalidQuery);
      }).toThrow('Limit deve ser pelo menos 1');
    });
  });
});