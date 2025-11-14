import { describe, expect, test } from '@jest/globals';
import VendasSchema from '../../schemas/vendasSchema.js';

describe('VendasSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = VendasSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = VendasSchema.id.parse({ id: '999' });
      expect(result.id).toBe(999);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        VendasSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        VendasSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        VendasSchema.id.parse({ id: '-3' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('query schema', () => {
    test('should validate minimal query', () => {
      const result = VendasSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate query with all parameters', () => {
      const queryData = {
        page: '3',
        limit: '20',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        forma_pgto: 'Pix',
        valor_min: '50.00',
        valor_max: '500.00'
      };
      
      const result = VendasSchema.query.parse(queryData);
      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.data_inicio).toBe('2024-01-01');
      expect(result.data_fim).toBe('2024-12-31');
      expect(result.forma_pgto).toBe('Pix');
      expect(result.valor_min).toBe(50.00);
      expect(result.valor_max).toBe(500.00);
    });

    test('should set defaults when values are empty', () => {
      const result = VendasSchema.query.parse({ page: '', limit: '' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should reject invalid date format for data_inicio', () => {
      expect(() => {
        VendasSchema.query.parse({ data_inicio: '2024/01/01' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject invalid date format for data_fim', () => {
      expect(() => {
        VendasSchema.query.parse({ data_fim: '01-01-2024' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject page less than 1', () => {
      expect(() => {
        VendasSchema.query.parse({ page: '0' });
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject limit greater than 100', () => {
      expect(() => {
        VendasSchema.query.parse({ limit: '101' });
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject limit less than 1', () => {
      expect(() => {
        VendasSchema.query.parse({ limit: '0' });
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should reject forma_pgto with empty string', () => {
      expect(() => {
        VendasSchema.query.parse({ forma_pgto: '' });
      }).toThrow('Forma de pagamento deve ter pelo menos 1 caractere');
    });

    test('should reject negative valor_min', () => {
      expect(() => {
        VendasSchema.query.parse({ valor_min: '-10' });
      }).toThrow('Valor mínimo deve ser maior ou igual a 0');
    });

    test('should reject negative valor_max', () => {
      expect(() => {
        VendasSchema.query.parse({ valor_max: '-5' });
      }).toThrow('Valor máximo deve ser maior ou igual a 0');
    });

    test('should accept zero values for valor_min and valor_max', () => {
      const result = VendasSchema.query.parse({ valor_min: '0', valor_max: '0' });
      expect(result.valor_min).toBe(0);
      expect(result.valor_max).toBe(0);
    });
  });

  describe('create schema', () => {
    test('should validate valid create data with roupas_id', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        desconto: 10.00,
        valor_pago: 90.00,
        nome_cliente: 'João Silva',
        telefone_cliente: '11987654321',
        itens: [
          {
            roupas_id: 1,
            quantidade: 2
          }
        ]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.forma_pgto).toBe('Pix');
      expect(result.valor_total).toBe(100.00);
      expect(result.desconto).toBe(10.00);
      expect(result.valor_pago).toBe(90.00);
      expect(result.nome_cliente).toBe('João Silva');
      expect(result.telefone_cliente).toBe('11987654321');
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].roupas_id).toBe(1);
      expect(result.itens[0].quantidade).toBe(2);
    });

    test('should validate valid create data with nome_item', () => {
      const createData = {
        forma_pgto: 'Dinheiro',
        valor_total: 75.00,
        valor_pago: 75.00,
        itens: [
          {
            nome_item: 'Camiseta Básica',
            quantidade: 1
          }
        ]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.forma_pgto).toBe('Dinheiro');
      expect(result.valor_total).toBe(75.00);
      expect(result.valor_pago).toBe(75.00);
      expect(result.desconto).toBe(0); // default value
      expect(result.itens[0].nome_item).toBe('Camiseta Básica');
      expect(result.itens[0].quantidade).toBe(1);
    });

    test('should validate valid permuta data', () => {
      const createData = {
        forma_pgto: 'Permuta',
        valor_total: 50.00,
        valor_pago: 60.00,
        descricao_permuta: 'Troca por calça jeans',
        itens: [
          {
            roupas_id: 5,
            quantidade: 1
          }
        ]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.forma_pgto).toBe('Permuta');
      expect(result.valor_total).toBe(0); // transformed to 0 for permuta
      expect(result.desconto).toBe(0); // transformed to 0 for permuta
      expect(result.valor_pago).toBe(0); // transformed to 0 for permuta
      expect(result.descricao_permuta).toBe('Troca por calça jeans');
    });

    test('should validate multiple items', () => {
      const createData = {
        forma_pgto: 'Cartão de Crédito',
        valor_total: 200.00,
        valor_pago: 200.00,
        itens: [
          {
            roupas_id: 1,
            quantidade: 1
          },
          {
            nome_item: 'Vestido Estampado',
            quantidade: 1
          }
        ]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.itens).toHaveLength(2);
    });

    test('should validate all valid forma_pgto options', () => {
      const validFormas = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"];
      
      validFormas.forEach(forma => {
        const createData = {
          forma_pgto: forma,
          valor_total: forma === 'Permuta' ? 100 : 100.00,
          valor_pago: forma === 'Permuta' ? 100 : 100.00,
          descricao_permuta: forma === 'Permuta' ? 'Descrição da permuta' : undefined,
          itens: [{ roupas_id: 1, quantidade: 1 }]
        };
        
        const result = VendasSchema.create.parse(createData);
        expect(result.forma_pgto).toBe(forma);
      });
    });

    test('should set default desconto to 0', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.desconto).toBe(0);
    });

    test('should clean data by removing undefined fields in items', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [
          {
            roupas_id: 1,
            nome_item: undefined,
            quantidade: 1
          }
        ]
      };

      const result = VendasSchema.create.parse(createData);
      expect(result.itens[0]).not.toHaveProperty('nome_item');
      expect(result.itens[0].roupas_id).toBe(1);
    });

    test('should reject invalid forma_pgto', () => {
      const createData = {
        forma_pgto: 'FormaPagamentoInvalida',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Forma de pagamento inválida');
    });

    test('should reject negative valor_total', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: -50.00,
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Valor total deve ser maior ou igual a 0');
    });

    test('should reject negative desconto', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        desconto: -10.00,
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Desconto deve ser maior ou igual a 0');
    });

    test('should reject negative valor_pago', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: -50.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Valor pago deve ser maior ou igual a 0');
    });

    test('should reject nome_cliente with less than 2 characters', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        nome_cliente: 'A',
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Nome do cliente deve ter pelo menos 2 caracteres');
    });

    test('should reject telefone_cliente with less than 10 digits', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        telefone_cliente: '123456789',
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Telefone deve ter pelo menos 10 dígitos');
    });

    test('should reject empty itens array', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: []
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Deve haver pelo menos um item na venda');
    });

    test('should reject item without roupas_id or nome_item', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [
          {
            quantidade: 1
          }
        ]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow("Deve informar o 'roupas_id' OU o 'nome_item' do produto");
    });

    test('should reject item with invalid roupas_id', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [
          {
            roupas_id: 0,
            quantidade: 1
          }
        ]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('ID da roupa deve ser um número válido');
    });

    test('should reject item with empty nome_item', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [
          {
            nome_item: '',
            quantidade: 1
          }
        ]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Nome do item deve ter pelo menos 1 caractere');
    });

    test('should reject item with invalid quantidade', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [
          {
            roupas_id: 1,
            quantidade: 0
          }
        ]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should reject valor_pago greater than valor_total for non-permuta', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 150.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Para permuta, descrição é obrigatória. Para outras formas, valor pago não pode ser maior que valor total.');
    });

    test('should reject permuta without descricao_permuta', () => {
      const createData = {
        forma_pgto: 'Permuta',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Para permuta, descrição é obrigatória. Para outras formas, valor pago não pode ser maior que valor total.');
    });

    test('should reject permuta with empty descricao_permuta', () => {
      const createData = {
        forma_pgto: 'Permuta',
        valor_total: 100.00,
        valor_pago: 100.00,
        descricao_permuta: '   ',
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow('Para permuta, descrição é obrigatória. Para outras formas, valor pago não pode ser maior que valor total.');
    });
  });

  describe('update schema', () => {
    test('should validate valid update data', () => {
      const updateData = {
        forma_pgto: 'Boleto',
        valor_total: 150.00,
        desconto: 15.00,
        valor_pago: 135.00,
        nome_cliente: 'Maria Santos',
        telefone_cliente: '11999888777'
      };

      const result = VendasSchema.update.parse(updateData);
      expect(result.forma_pgto).toBe('Boleto');
      expect(result.valor_total).toBe(150.00);
      expect(result.desconto).toBe(15.00);
      expect(result.valor_pago).toBe(135.00);
      expect(result.nome_cliente).toBe('Maria Santos');
      expect(result.telefone_cliente).toBe('11999888777');
    });

    test('should validate empty update data', () => {
      const result = VendasSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update data', () => {
      const updateData = {
        forma_pgto: 'Cheque'
      };

      const result = VendasSchema.update.parse(updateData);
      expect(result.forma_pgto).toBe('Cheque');
    });

    test('should reject invalid forma_pgto in update', () => {
      expect(() => {
        VendasSchema.update.parse({ forma_pgto: 'FormaPagamentoInvalida' });
      }).toThrow('Forma de pagamento inválida');
    });

    test('should reject negative valor_total in update', () => {
      expect(() => {
        VendasSchema.update.parse({ valor_total: -10.00 });
      }).toThrow('Valor total deve ser maior ou igual a 0');
    });

    test('should reject negative desconto in update', () => {
      expect(() => {
        VendasSchema.update.parse({ desconto: -5.00 });
      }).toThrow('Desconto deve ser maior ou igual a 0');
    });

    test('should reject negative valor_pago in update', () => {
      expect(() => {
        VendasSchema.update.parse({ valor_pago: -20.00 });
      }).toThrow('Valor pago deve ser maior ou igual a 0');
    });

    test('should reject short nome_cliente in update', () => {
      expect(() => {
        VendasSchema.update.parse({ nome_cliente: 'A' });
      }).toThrow('Nome do cliente deve ter pelo menos 2 caracteres');
    });

    test('should reject short telefone_cliente in update', () => {
      expect(() => {
        VendasSchema.update.parse({ telefone_cliente: '123456789' });
      }).toThrow('Telefone deve ter pelo menos 10 dígitos');
    });

    test('should allow permuta in update', () => {
      const updateData = {
        forma_pgto: 'Permuta',
        descricao_permuta: 'Troca por bolsa'
      };

      const result = VendasSchema.update.parse(updateData);
      expect(result.forma_pgto).toBe('Permuta');
      expect(result.descricao_permuta).toBe('Troca por bolsa');
    });

    test('should handle non-object data in preprocessing - line 52', () => {
      const createData = {
        forma_pgto: 'Pix',
        valor_total: 100.00,
        valor_pago: 100.00,
        itens: 'invalid_data' // Will be processed as non-object
      };

      expect(() => {
        VendasSchema.create.parse(createData);
      }).toThrow();
    });
  });
});