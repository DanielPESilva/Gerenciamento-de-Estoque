import { describe, expect, test } from '@jest/globals';
import ComprasSchema from '../../schemas/comprasSchema.js';

describe('ComprasSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = ComprasSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = ComprasSchema.id.parse({ id: '456' });
      expect(result.id).toBe(456);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        ComprasSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        ComprasSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        ComprasSchema.id.parse({ id: '-5' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('itemId schema', () => {
    test('should validate valid itemId with both IDs', () => {
      const result = ComprasSchema.itemId.parse({ id: '10', item_id: '20' });
      expect(result.id).toBe(10);
      expect(result.item_id).toBe(20);
    });

    test('should reject invalid main ID', () => {
      expect(() => {
        ComprasSchema.itemId.parse({ id: 'invalid', item_id: '1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject invalid item ID', () => {
      expect(() => {
        ComprasSchema.itemId.parse({ id: '1', item_id: 'invalid' });
      }).toThrow('Item ID deve ser um número válido maior que 0');
    });

    test('should reject zero main ID', () => {
      expect(() => {
        ComprasSchema.itemId.parse({ id: '0', item_id: '1' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative item ID', () => {
      expect(() => {
        ComprasSchema.itemId.parse({ id: '1', item_id: '-1' });
      }).toThrow('Item ID deve ser um número válido maior que 0');
    });
  });

  describe('query schema', () => {
    test('should validate minimal query', () => {
      const result = ComprasSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate query with all parameters', () => {
      const queryData = {
        page: '3',
        limit: '25',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        fornecedor: 'Fornecedor ABC',
        valor_min: '100.50',
        valor_max: '1000.00'
      };
      
      const result = ComprasSchema.query.parse(queryData);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(25);
      expect(result.data_inicio).toBe('2024-01-01');
      expect(result.data_fim).toBe('2024-12-31');
      expect(result.fornecedor).toBe('Fornecedor ABC');
      expect(result.valor_min).toBe(100.50);
      expect(result.valor_max).toBe(1000.00);
    });

    test('should set defaults when values are empty', () => {
      const result = ComprasSchema.query.parse({ page: '', limit: '' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should reject invalid date format for data_inicio', () => {
      expect(() => {
        ComprasSchema.query.parse({ data_inicio: '2024/01/01' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject invalid date format for data_fim', () => {
      expect(() => {
        ComprasSchema.query.parse({ data_fim: '01-01-2024' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject page less than 1', () => {
      expect(() => {
        ComprasSchema.query.parse({ page: '0' });
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject limit greater than 100', () => {
      expect(() => {
        ComprasSchema.query.parse({ limit: '150' });
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject limit less than 1', () => {
      expect(() => {
        ComprasSchema.query.parse({ limit: '0' });
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should reject negative valor_min', () => {
      expect(() => {
        ComprasSchema.query.parse({ valor_min: '-10' });
      }).toThrow('Valor mínimo deve ser maior ou igual a 0');
    });

    test('should reject negative valor_max', () => {
      expect(() => {
        ComprasSchema.query.parse({ valor_max: '-5' });
      }).toThrow('Valor máximo deve ser maior ou igual a 0');
    });

    test('should accept zero values for valor_min and valor_max', () => {
      const result = ComprasSchema.query.parse({ valor_min: '0', valor_max: '0' });
      expect(result.valor_min).toBe(0);
      expect(result.valor_max).toBe(0);
    });
  });

  describe('create schema', () => {
    test('should validate valid create data with roupas_id', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 250.00,
        fornecendor: 'Fornecedor XYZ',
        telefone_forncedor: '11987654321',
        itens: [
          {
            roupas_id: 1,
            quantidade: 5,
            valor_peca: 50.00
          }
        ]
      };

      const result = ComprasSchema.create.parse(createData);
      expect(result.forma_pgto).toBe('Pix');
      expect(result.valor_pago).toBe(250.00);
      expect(result.fornecendor).toBe('Fornecedor XYZ');
      expect(result.telefone_forncedor).toBe('11987654321');
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].roupas_id).toBe(1);
      expect(result.itens[0].quantidade).toBe(5);
      expect(result.itens[0].valor_peca).toBe(50.00);
    });

    test('should validate valid create data with nome_item', () => {
      const createData = {
        forma_pgto: 'Dinheiro',
        valor_pago: 100.00,
        itens: [
          {
            nome_item: 'Camiseta Polo',
            quantidade: 2,
            valor_peca: 50.00
          }
        ]
      };

      const result = ComprasSchema.create.parse(createData);
      expect(result.forma_pgto).toBe('Dinheiro');
      expect(result.valor_pago).toBe(100.00);
      expect(result.itens[0].nome_item).toBe('Camiseta Polo');
      expect(result.itens[0].quantidade).toBe(2);
      expect(result.itens[0].valor_peca).toBe(50.00);
    });

    test('should validate multiple items', () => {
      const createData = {
        forma_pgto: 'Cartão de Crédito',
        valor_pago: 300.00,
        itens: [
          {
            roupas_id: 1,
            quantidade: 2,
            valor_peca: 75.00
          },
          {
            nome_item: 'Calça Jeans',
            quantidade: 1,
            valor_peca: 150.00
          }
        ]
      };

      const result = ComprasSchema.create.parse(createData);
      expect(result.itens).toHaveLength(2);
    });

    test('should validate all valid forma_pgto options', () => {
      const validFormas = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Transferência"];
      
      validFormas.forEach(forma => {
        const createData = {
          forma_pgto: forma,
          valor_pago: 100.00,
          itens: [{ roupas_id: 1, quantidade: 1, valor_peca: 100.00 }]
        };
        
        const result = ComprasSchema.create.parse(createData);
        expect(result.forma_pgto).toBe(forma);
      });
    });

    test('should reject invalid forma_pgto', () => {
      const createData = {
        forma_pgto: 'FormaPagamentoInvalida',
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1, valor_peca: 100.00 }]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Forma de pagamento inválida');
    });

    test('should reject negative valor_pago', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: -50.00,
        itens: [{ roupas_id: 1, quantidade: 1, valor_peca: 100.00 }]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Valor pago deve ser maior ou igual a 0');
    });

    test('should reject fornecendor with less than 2 characters', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        fornecendor: 'A',
        itens: [{ roupas_id: 1, quantidade: 1, valor_peca: 100.00 }]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Nome do fornecedor deve ter pelo menos 2 caracteres');
    });

    test('should reject telefone_forncedor with less than 10 digits', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        telefone_forncedor: '123456789',
        itens: [{ roupas_id: 1, quantidade: 1, valor_peca: 100.00 }]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Telefone deve ter pelo menos 10 dígitos');
    });

    test('should reject empty itens array', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        itens: []
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Deve ter pelo menos um item na compra');
    });

    test('should reject item without roupas_id or nome_item', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        itens: [
          {
            quantidade: 1,
            valor_peca: 100.00
          }
        ]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Deve informar roupas_id ou nome_item');
    });

    test('should reject item with invalid quantidade', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        itens: [
          {
            roupas_id: 1,
            quantidade: 0,
            valor_peca: 100.00
          }
        ]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject item with negative valor_peca', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 100.00,
        itens: [
          {
            roupas_id: 1,
            quantidade: 1,
            valor_peca: -50.00
          }
        ]
      };

      expect(() => {
        ComprasSchema.create.parse(createData);
      }).toThrow('Valor da peça deve ser maior ou igual a 0');
    });

    test('should accept zero valor_peca', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_pago: 0,
        itens: [
          {
            roupas_id: 1,
            quantidade: 1,
            valor_peca: 0
          }
        ]
      };

      const result = ComprasSchema.create.parse(createData);
      expect(result.itens[0].valor_peca).toBe(0);
    });
  });

  describe('update schema', () => {
    test('should validate valid update data', () => {
      const updateData = {
        forma_pgto: 'Boleto',
        valor_pago: 150.00,
        fornecendor: 'Novo Fornecedor',
        telefone_forncedor: '11999888777'
      };

      const result = ComprasSchema.update.parse(updateData);
      expect(result.forma_pgto).toBe('Boleto');
      expect(result.valor_pago).toBe(150.00);
      expect(result.fornecendor).toBe('Novo Fornecedor');
      expect(result.telefone_forncedor).toBe('11999888777');
    });

    test('should validate empty update data', () => {
      const result = ComprasSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update data', () => {
      const updateData = {
        forma_pgto: 'Cheque'
      };

      const result = ComprasSchema.update.parse(updateData);
      expect(result.forma_pgto).toBe('Cheque');
    });

    test('should reject invalid forma_pgto in update', () => {
      expect(() => {
        ComprasSchema.update.parse({ forma_pgto: 'FormaPagamentoInvalida' });
      }).toThrow('Forma de pagamento inválida');
    });

    test('should reject negative valor_pago in update', () => {
      expect(() => {
        ComprasSchema.update.parse({ valor_pago: -10.00 });
      }).toThrow('Valor pago deve ser maior ou igual a 0');
    });

    test('should reject short fornecendor in update', () => {
      expect(() => {
        ComprasSchema.update.parse({ fornecendor: 'A' });
      }).toThrow('Nome do fornecedor deve ter pelo menos 2 caracteres');
    });

    test('should reject short telefone_forncedor in update', () => {
      expect(() => {
        ComprasSchema.update.parse({ telefone_forncedor: '123456789' });
      }).toThrow('Telefone deve ter pelo menos 10 dígitos');
    });
  });

  describe('addItem schema', () => {
    test('should validate valid item with roupas_id', () => {
      const itemData = {
        roupas_id: 5,
        quantidade: 3,
        valor_peca: 75.00
      };

      const result = ComprasSchema.addItem.parse(itemData);
      expect(result.roupas_id).toBe(5);
      expect(result.quantidade).toBe(3);
      expect(result.valor_peca).toBe(75.00);
    });

    test('should validate valid item with nome_item', () => {
      const itemData = {
        nome_item: 'Bermuda Jeans',
        quantidade: 2,
        valor_peca: 40.00
      };

      const result = ComprasSchema.addItem.parse(itemData);
      expect(result.nome_item).toBe('Bermuda Jeans');
      expect(result.quantidade).toBe(2);
      expect(result.valor_peca).toBe(40.00);
    });

    test('should reject item without roupas_id or nome_item', () => {
      expect(() => {
        ComprasSchema.addItem.parse({ quantidade: 1, valor_peca: 50.00 });
      }).toThrow('Deve informar roupas_id ou nome_item');
    });

    test('should reject item with invalid quantidade', () => {
      expect(() => {
        ComprasSchema.addItem.parse({ roupas_id: 1, quantidade: 0, valor_peca: 50.00 });
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject invalid roupas_id', () => {
      expect(() => {
        ComprasSchema.addItem.parse({ roupas_id: -1, quantidade: 1, valor_peca: 50.00 });
      }).toThrow('ID da roupa deve ser positivo');
    });

    test('should reject empty nome_item', () => {
      expect(() => {
        ComprasSchema.addItem.parse({ nome_item: '', quantidade: 1, valor_peca: 50.00 });
      }).toThrow('Nome do item deve ter pelo menos 1 caractere');
    });

    test('should reject negative valor_peca', () => {
      expect(() => {
        ComprasSchema.addItem.parse({ roupas_id: 1, quantidade: 1, valor_peca: -10.00 });
      }).toThrow('Valor da peça deve ser maior ou igual a 0');
    });
  });

  describe('updateItem schema', () => {
    test('should validate valid item update', () => {
      const updateData = {
        quantidade: 5,
        valor_peca: 80.00
      };

      const result = ComprasSchema.updateItem.parse(updateData);
      expect(result.quantidade).toBe(5);
      expect(result.valor_peca).toBe(80.00);
    });

    test('should validate empty update', () => {
      const result = ComprasSchema.updateItem.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update with only quantidade', () => {
      const result = ComprasSchema.updateItem.parse({ quantidade: 3 });
      expect(result.quantidade).toBe(3);
    });

    test('should validate partial update with only valor_peca', () => {
      const result = ComprasSchema.updateItem.parse({ valor_peca: 45.00 });
      expect(result.valor_peca).toBe(45.00);
    });

    test('should reject invalid quantidade', () => {
      expect(() => {
        ComprasSchema.updateItem.parse({ quantidade: 0 });
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject negative valor_peca', () => {
      expect(() => {
        ComprasSchema.updateItem.parse({ valor_peca: -5.00 });
      }).toThrow('Valor da peça deve ser maior ou igual a 0');
    });
  });

  describe('finalizar schema', () => {
    test('should validate valid finalizar data', () => {
      const finalizarData = {
        observacoes: 'Compra finalizada com sucesso'
      };

      const result = ComprasSchema.finalizar.parse(finalizarData);
      expect(result.observacoes).toBe('Compra finalizada com sucesso');
    });

    test('should validate empty finalizar data', () => {
      const result = ComprasSchema.finalizar.parse({});
      expect(result).toEqual({});
    });

    test('should allow undefined observacoes', () => {
      const result = ComprasSchema.finalizar.parse({ observacoes: undefined });
      expect(result.observacoes).toBeUndefined();
    });

    test('should allow empty string observacoes', () => {
      const result = ComprasSchema.finalizar.parse({ observacoes: '' });
      expect(result.observacoes).toBe('');
    });
  });
});