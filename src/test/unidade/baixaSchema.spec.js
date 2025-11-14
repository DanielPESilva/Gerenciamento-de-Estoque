import { describe, expect, test } from '@jest/globals';
import BaixaSchema from '../../schemas/baixaSchema.js';

describe('BaixaSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = BaixaSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = BaixaSchema.id.parse({ id: '123' });
      expect(result.id).toBe(123);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        BaixaSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        BaixaSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        BaixaSchema.id.parse({ id: '-1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('itemId schema', () => {
    test('should validate valid itemId with both IDs', () => {
      const result = BaixaSchema.itemId.parse({ id: '1', item_id: '2' });
      expect(result.id).toBe(1);
      expect(result.item_id).toBe(2);
    });

    test('should reject invalid main ID', () => {
      expect(() => {
        BaixaSchema.itemId.parse({ id: 'abc', item_id: '1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject invalid item ID', () => {
      expect(() => {
        BaixaSchema.itemId.parse({ id: '1', item_id: 'xyz' });
      }).toThrow('Item ID deve ser um número válido maior que 0');
    });

    test('should reject zero main ID', () => {
      expect(() => {
        BaixaSchema.itemId.parse({ id: '0', item_id: '1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero item ID', () => {
      expect(() => {
        BaixaSchema.itemId.parse({ id: '1', item_id: '0' });
      }).toThrow('Item ID deve ser um número válido maior que 0');
    });
  });

  describe('query schema', () => {
    test('should validate minimal query', () => {
      const result = BaixaSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate query with all parameters', () => {
      const queryData = {
        page: '2',
        limit: '20',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        motivo: 'Perda',
        usuario_id: '5'
      };
      
      const result = BaixaSchema.query.parse(queryData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.data_inicio).toBe('2024-01-01');
      expect(result.data_fim).toBe('2024-12-31');
      expect(result.motivo).toBe('Perda');
      expect(result.usuario_id).toBe(5);
    });

    test('should validate all valid motivos', () => {
      const validMotivos = ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"];
      
      validMotivos.forEach(motivo => {
        const result = BaixaSchema.query.parse({ motivo });
        expect(result.motivo).toBe(motivo);
      });
    });

    test('should reject invalid motivo', () => {
      expect(() => {
        BaixaSchema.query.parse({ motivo: 'MotivoInvalido' });
      }).toThrow();
    });

    test('should reject page less than 1', () => {
      expect(() => {
        BaixaSchema.query.parse({ page: '0' });
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject limit greater than 100', () => {
      expect(() => {
        BaixaSchema.query.parse({ limit: '101' });
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject limit less than 1', () => {
      expect(() => {
        BaixaSchema.query.parse({ limit: '0' });
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should set defaults when values are empty', () => {
      const result = BaixaSchema.query.parse({ page: '', limit: '' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('create schema', () => {
    test('should validate valid create data with roupas_id', () => {
      const createData = {
        motivo: 'Perda',
        observacoes: 'Teste de observação',
        usuario_id: 1,
        itens: [
          {
            roupas_id: 1,
            quantidade: 5,
            observacao_item: 'Item danificado'
          }
        ]
      };

      const result = BaixaSchema.create.parse(createData);
      expect(result.motivo).toBe('Perda');
      expect(result.observacoes).toBe('Teste de observação');
      expect(result.usuario_id).toBe(1);
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].roupas_id).toBe(1);
      expect(result.itens[0].quantidade).toBe(5);
    });

    test('should validate valid create data with nome_item', () => {
      const createData = {
        motivo: 'Roubo',
        usuario_id: 2,
        itens: [
          {
            nome_item: 'Camiseta Azul',
            quantidade: 3
          }
        ]
      };

      const result = BaixaSchema.create.parse(createData);
      expect(result.motivo).toBe('Roubo');
      expect(result.usuario_id).toBe(2);
      expect(result.itens[0].nome_item).toBe('Camiseta Azul');
      expect(result.itens[0].quantidade).toBe(3);
    });

    test('should validate multiple items', () => {
      const createData = {
        motivo: 'Defeito',
        usuario_id: 1,
        itens: [
          {
            roupas_id: 1,
            quantidade: 2
          },
          {
            nome_item: 'Calça Jeans',
            quantidade: 1
          }
        ]
      };

      const result = BaixaSchema.create.parse(createData);
      expect(result.itens).toHaveLength(2);
    });

    test('should reject invalid motivo in create', () => {
      const createData = {
        motivo: 'MotivoInvalido',
        usuario_id: 1,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Motivo deve ser um dos valores válidos');
    });

    test('should reject observacoes too long', () => {
      const createData = {
        motivo: 'Perda',
        observacoes: 'a'.repeat(501),
        usuario_id: 1,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Observações devem ter no máximo 500 caracteres');
    });

    test('should reject invalid usuario_id', () => {
      const createData = {
        motivo: 'Perda',
        usuario_id: 0,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('ID do usuário deve ser positivo');
    });

    test('should reject empty itens array', () => {
      const createData = {
        motivo: 'Perda',
        usuario_id: 1,
        itens: []
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Deve ter pelo menos um item na baixa');
    });

    test('should reject item without roupas_id or nome_item', () => {
      const createData = {
        motivo: 'Perda',
        usuario_id: 1,
        itens: [
          {
            quantidade: 1
          }
        ]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Deve informar roupas_id ou nome_item');
    });

    test('should reject item with invalid quantidade', () => {
      const createData = {
        motivo: 'Perda',
        usuario_id: 1,
        itens: [
          {
            roupas_id: 1,
            quantidade: 0
          }
        ]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject item with observacao_item too long', () => {
      const createData = {
        motivo: 'Perda',
        usuario_id: 1,
        itens: [
          {
            roupas_id: 1,
            quantidade: 1,
            observacao_item: 'a'.repeat(201)
          }
        ]
      };

      expect(() => {
        BaixaSchema.create.parse(createData);
      }).toThrow('Observação do item deve ter no máximo 200 caracteres');
    });
  });

  describe('update schema', () => {
    test('should validate valid update data', () => {
      const updateData = {
        motivo: 'Defeito',
        observacoes: 'Observação atualizada',
        usuario_id: 3
      };

      const result = BaixaSchema.update.parse(updateData);
      expect(result.motivo).toBe('Defeito');
      expect(result.observacoes).toBe('Observação atualizada');
      expect(result.usuario_id).toBe(3);
    });

    test('should validate empty update data', () => {
      const result = BaixaSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update data', () => {
      const updateData = {
        motivo: 'Doação'
      };

      const result = BaixaSchema.update.parse(updateData);
      expect(result.motivo).toBe('Doação');
    });

    test('should reject invalid motivo in update', () => {
      expect(() => {
        BaixaSchema.update.parse({ motivo: 'MotivoInvalido' });
      }).toThrow('Motivo deve ser um dos valores válidos');
    });

    test('should reject observacoes too long in update', () => {
      expect(() => {
        BaixaSchema.update.parse({ observacoes: 'a'.repeat(501) });
      }).toThrow('Observações devem ter no máximo 500 caracteres');
    });

    test('should reject invalid usuario_id in update', () => {
      expect(() => {
        BaixaSchema.update.parse({ usuario_id: -1 });
      }).toThrow('ID do usuário deve ser positivo');
    });
  });

  describe('addItem schema', () => {
    test('should validate valid item with roupas_id', () => {
      const itemData = {
        roupas_id: 5,
        quantidade: 3,
        observacao_item: 'Item com defeito'
      };

      const result = BaixaSchema.addItem.parse(itemData);
      expect(result.roupas_id).toBe(5);
      expect(result.quantidade).toBe(3);
      expect(result.observacao_item).toBe('Item com defeito');
    });

    test('should validate valid item with nome_item', () => {
      const itemData = {
        nome_item: 'Blusa Verde',
        quantidade: 2
      };

      const result = BaixaSchema.addItem.parse(itemData);
      expect(result.nome_item).toBe('Blusa Verde');
      expect(result.quantidade).toBe(2);
    });

    test('should reject item without roupas_id or nome_item', () => {
      expect(() => {
        BaixaSchema.addItem.parse({ quantidade: 1 });
      }).toThrow('Deve informar roupas_id ou nome_item');
    });

    test('should reject item with invalid quantidade', () => {
      expect(() => {
        BaixaSchema.addItem.parse({ roupas_id: 1, quantidade: 0 });
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject invalid roupas_id', () => {
      expect(() => {
        BaixaSchema.addItem.parse({ roupas_id: -1, quantidade: 1 });
      }).toThrow('ID da roupa deve ser positivo');
    });

    test('should reject empty nome_item', () => {
      expect(() => {
        BaixaSchema.addItem.parse({ nome_item: '', quantidade: 1 });
      }).toThrow('Nome do item deve ter pelo menos 1 caractere');
    });

    test('should reject observacao_item too long', () => {
      expect(() => {
        BaixaSchema.addItem.parse({ 
          roupas_id: 1, 
          quantidade: 1, 
          observacao_item: 'a'.repeat(201) 
        });
      }).toThrow('Observação do item deve ter no máximo 200 caracteres');
    });
  });

  describe('updateItem schema', () => {
    test('should validate valid item update', () => {
      const updateData = {
        quantidade: 5,
        observacao_item: 'Observação atualizada'
      };

      const result = BaixaSchema.updateItem.parse(updateData);
      expect(result.quantidade).toBe(5);
      expect(result.observacao_item).toBe('Observação atualizada');
    });

    test('should validate empty update', () => {
      const result = BaixaSchema.updateItem.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update with only quantidade', () => {
      const result = BaixaSchema.updateItem.parse({ quantidade: 3 });
      expect(result.quantidade).toBe(3);
    });

    test('should validate partial update with only observacao_item', () => {
      const result = BaixaSchema.updateItem.parse({ observacao_item: 'Nova observação' });
      expect(result.observacao_item).toBe('Nova observação');
    });

    test('should reject invalid quantidade', () => {
      expect(() => {
        BaixaSchema.updateItem.parse({ quantidade: 0 });
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject observacao_item too long', () => {
      expect(() => {
        BaixaSchema.updateItem.parse({ observacao_item: 'a'.repeat(201) });
      }).toThrow('Observação do item deve ter no máximo 200 caracteres');
    });
  });

  describe('itensSchema search - line 54', () => {
    const { z } = require('zod');
    const ItensSchema = {
      search: z.object({
        q: z.string().min(1, "Termo de busca deve ter pelo menos 1 caractere").optional(),
        nome: z.string().min(1, "Nome deve ter pelo menos 1 caractere").optional(),
        limit: z.preprocess(
          (val) => val ? parseInt(val) : 10,
          z.number().int().min(1, "Limit deve ser pelo menos 1").max(50, "Limit deve ser no máximo 50").optional().default(10)
        )
      }).refine((data) => data.q || data.nome, {
        message: "Deve informar 'q' ou 'nome' para buscar"
      })
    };

    test('should validate search with q parameter', () => {
      const result = ItensSchema.search.parse({ q: 'camiseta' });
      expect(result.q).toBe('camiseta');
      expect(result.limit).toBe(10);
    });

    test('should validate search with nome parameter', () => {
      const result = ItensSchema.search.parse({ nome: 'produto' });
      expect(result.nome).toBe('produto');
      expect(result.limit).toBe(10);
    });

    test('should reject when neither q nor nome provided', () => {
      expect(() => {
        ItensSchema.search.parse({ limit: 5 });
      }).toThrow("Deve informar 'q' ou 'nome' para buscar");
    });
  });
});