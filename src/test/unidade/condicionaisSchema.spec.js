import { describe, expect, test } from '@jest/globals';
import CondicionaisSchema from '../../schemas/condicionaisSchema.js';

describe('CondicionaisSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = CondicionaisSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = CondicionaisSchema.id.parse({ id: '789' });
      expect(result.id).toBe(789);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        CondicionaisSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        CondicionaisSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        CondicionaisSchema.id.parse({ id: '-7' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('query schema', () => {
    test('should validate minimal query', () => {
      const result = CondicionaisSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate query with all parameters', () => {
      const queryData = {
        page: '2',
        limit: '15',
        cliente_id: '5',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        devolvido: 'true'
      };
      
      const result = CondicionaisSchema.query.parse(queryData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.cliente_id).toBe(5);
      expect(result.data_inicio).toBe('2024-01-01');
      expect(result.data_fim).toBe('2024-12-31');
      expect(result.devolvido).toBe(true);
    });

    test('should set defaults when values are empty', () => {
      const result = CondicionaisSchema.query.parse({ page: '', limit: '' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should parse devolvido as boolean true', () => {
      const result = CondicionaisSchema.query.parse({ devolvido: 'true' });
      expect(result.devolvido).toBe(true);
    });

    test('should parse devolvido as boolean false', () => {
      const result = CondicionaisSchema.query.parse({ devolvido: 'false' });
      expect(result.devolvido).toBe(false);
    });

    test('should handle undefined devolvido', () => {
      const result = CondicionaisSchema.query.parse({ devolvido: undefined });
      expect(result.devolvido).toBeUndefined();
    });

    test('should reject invalid date format for data_inicio', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ data_inicio: '2024/01/01' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject invalid date format for data_fim', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ data_fim: '01-01-2024' });
      }).toThrow('Data deve estar no formato YYYY-MM-DD');
    });

    test('should reject page less than 1', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ page: '0' });
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject limit greater than 100', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ limit: '101' });
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject limit less than 1', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ limit: '0' });
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should reject invalid cliente_id', () => {
      expect(() => {
        CondicionaisSchema.query.parse({ cliente_id: '0' });
      }).toThrow('ID do cliente deve ser um número válido');
    });
  });

  describe('create schema', () => {
    test('should validate valid create data with roupas_id', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            roupas_id: 1,
            quantidade: 2
          }
        ]
      };

      const result = CondicionaisSchema.create.parse(createData);
      expect(result.cliente_id).toBe(1);
      expect(result.data_devolucao).toBe('2024-12-01T10:00:00.000Z');
      expect(result.itens).toHaveLength(1);
      expect(result.itens[0].roupas_id).toBe(1);
      expect(result.itens[0].quantidade).toBe(2);
    });

    test('should validate valid create data with nome_item', () => {
      const createData = {
        cliente_id: 2,
        data_devolucao: '2024-12-15T14:30:00.000Z',
        itens: [
          {
            nome_item: 'Vestido Floral',
            quantidade: 1
          }
        ]
      };

      const result = CondicionaisSchema.create.parse(createData);
      expect(result.cliente_id).toBe(2);
      expect(result.data_devolucao).toBe('2024-12-15T14:30:00.000Z');
      expect(result.itens[0].nome_item).toBe('Vestido Floral');
      expect(result.itens[0].quantidade).toBe(1);
    });

    test('should validate multiple items', () => {
      const createData = {
        cliente_id: 3,
        data_devolucao: '2024-12-20T09:00:00.000Z',
        itens: [
          {
            roupas_id: 5,
            quantidade: 1
          },
          {
            nome_item: 'Saia Midi',
            quantidade: 2
          }
        ]
      };

      const result = CondicionaisSchema.create.parse(createData);
      expect(result.itens).toHaveLength(2);
    });

    test('should clean data by removing undefined fields', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            roupas_id: 1,
            nome_item: undefined,
            quantidade: 2
          }
        ]
      };

      const result = CondicionaisSchema.create.parse(createData);
      expect(result.itens[0]).not.toHaveProperty('nome_item');
      expect(result.itens[0].roupas_id).toBe(1);
    });

    test('should reject invalid cliente_id', () => {
      const createData = {
        cliente_id: 0,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('ID do cliente deve ser um número válido');
    });

    test('should reject invalid data_devolucao format', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01',
        itens: [{ roupas_id: 1, quantidade: 1 }]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('Data de devolução deve ser uma data válida');
    });

    test('should reject empty itens array', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: []
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('Deve haver pelo menos um item no condicional');
    });

    test('should reject item without roupas_id or nome_item', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            quantidade: 1
          }
        ]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow("Deve informar o 'roupas_id' OU o 'nome_item' do produto");
    });

    test('should reject item with invalid roupas_id', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            roupas_id: 0,
            quantidade: 1
          }
        ]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('ID da roupa deve ser um número válido');
    });

    test('should reject item with empty nome_item', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            nome_item: '',
            quantidade: 1
          }
        ]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('Nome do item deve ter pelo menos 1 caractere');
    });

    test('should reject item with invalid quantidade', () => {
      const createData = {
        cliente_id: 1,
        data_devolucao: '2024-12-01T10:00:00.000Z',
        itens: [
          {
            roupas_id: 1,
            quantidade: 0
          }
        ]
      };

      expect(() => {
        CondicionaisSchema.create.parse(createData);
      }).toThrow('Quantidade deve ser pelo menos 1');
    });
  });

  describe('update schema', () => {
    test('should validate valid update data', () => {
      const updateData = {
        cliente_id: 5,
        data_devolucao: '2024-12-25T15:00:00.000Z',
        devolvido: true
      };

      const result = CondicionaisSchema.update.parse(updateData);
      expect(result.cliente_id).toBe(5);
      expect(result.data_devolucao).toBe('2024-12-25T15:00:00.000Z');
      expect(result.devolvido).toBe(true);
    });

    test('should validate empty update data', () => {
      const result = CondicionaisSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update data', () => {
      const updateData = {
        devolvido: false
      };

      const result = CondicionaisSchema.update.parse(updateData);
      expect(result.devolvido).toBe(false);
    });

    test('should reject invalid cliente_id in update', () => {
      expect(() => {
        CondicionaisSchema.update.parse({ cliente_id: 0 });
      }).toThrow('ID do cliente deve ser um número válido');
    });

    test('should reject invalid data_devolucao in update', () => {
      expect(() => {
        CondicionaisSchema.update.parse({ data_devolucao: '2024-12-01' });
      }).toThrow('Data de devolução deve ser uma data válida');
    });
  });

  describe('devolverItem schema', () => {
    test('should validate valid devolverItem data', () => {
      const devolverData = {
        roupas_id: 10,
        quantidade: 3
      };

      const result = CondicionaisSchema.devolverItem.parse(devolverData);
      expect(result.roupas_id).toBe(10);
      expect(result.quantidade).toBe(3);
    });

    test('should reject invalid roupas_id', () => {
      expect(() => {
        CondicionaisSchema.devolverItem.parse({ roupas_id: 0, quantidade: 1 });
      }).toThrow('ID da roupa deve ser um número válido');
    });

    test('should reject invalid quantidade', () => {
      expect(() => {
        CondicionaisSchema.devolverItem.parse({ roupas_id: 1, quantidade: 0 });
      }).toThrow('Quantidade deve ser pelo menos 1');
    });
  });

  describe('finalizarCondicional schema', () => {
    test('should validate valid finalizarCondicional data', () => {
      const finalizarData = {
        devolvido: false,
        observacoes: 'Condicional convertido em venda'
      };

      const result = CondicionaisSchema.finalizarCondicional.parse(finalizarData);
      expect(result.devolvido).toBe(false);
      expect(result.observacoes).toBe('Condicional convertido em venda');
    });

    test('should set default devolvido to true', () => {
      const result = CondicionaisSchema.finalizarCondicional.parse({});
      expect(result.devolvido).toBe(true);
    });

    test('should validate with only observacoes', () => {
      const finalizarData = {
        observacoes: 'Finalizado com sucesso'
      };

      const result = CondicionaisSchema.finalizarCondicional.parse(finalizarData);
      expect(result.devolvido).toBe(true);
      expect(result.observacoes).toBe('Finalizado com sucesso');
    });

    test('should allow undefined observacoes', () => {
      const result = CondicionaisSchema.finalizarCondicional.parse({ devolvido: false });
      expect(result.devolvido).toBe(false);
      expect(result.observacoes).toBeUndefined();
    });
  });

  describe('converterVenda schema', () => {
    test('should validate converterVenda with "todos" items', () => {
      const converterData = {
        itens_vendidos: 'todos',
        desconto: 10,
        forma_pagamento: 'Pix',
        observacoes: 'Conversão total'
      };

      const result = CondicionaisSchema.converterVenda.parse(converterData);
      expect(result.itens_vendidos).toBe('todos');
      expect(result.desconto).toBe(10);
      expect(result.forma_pagamento).toBe('Pix');
      expect(result.observacoes).toBe('Conversão total');
    });

    test('should validate converterVenda with specific items array', () => {
      const converterData = {
        itens_vendidos: [
          {
            roupas_id: 1,
            quantidade: 2
          },
          {
            roupas_id: 3,
            quantidade: 1
          }
        ],
        forma_pagamento: 'Dinheiro'
      };

      const result = CondicionaisSchema.converterVenda.parse(converterData);
      expect(result.itens_vendidos).toHaveLength(2);
      expect(result.itens_vendidos[0].roupas_id).toBe(1);
      expect(result.itens_vendidos[0].quantidade).toBe(2);
      expect(result.forma_pagamento).toBe('Dinheiro');
      expect(result.desconto).toBe(0); // default value
    });

    test('should validate all valid forma_pagamento options', () => {
      const validFormas = ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"];
      
      validFormas.forEach(forma => {
        const converterData = {
          itens_vendidos: 'todos',
          forma_pagamento: forma
        };
        
        const result = CondicionaisSchema.converterVenda.parse(converterData);
        expect(result.forma_pagamento).toBe(forma);
      });
    });

    test('should set default desconto to 0', () => {
      const converterData = {
        itens_vendidos: 'todos',
        forma_pagamento: 'Pix'
      };

      const result = CondicionaisSchema.converterVenda.parse(converterData);
      expect(result.desconto).toBe(0);
    });

    test('should reject invalid forma_pagamento', () => {
      const converterData = {
        itens_vendidos: 'todos',
        forma_pagamento: 'FormaPagamentoInvalida'
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow();
    });

    test('should reject negative desconto', () => {
      const converterData = {
        itens_vendidos: 'todos',
        forma_pagamento: 'Pix',
        desconto: -5
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow('Desconto deve ser maior ou igual a 0');
    });

    test('should reject empty itens_vendidos array', () => {
      const converterData = {
        itens_vendidos: [],
        forma_pagamento: 'Pix'
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow('Deve especificar pelo menos um item para venda');
    });

    test('should reject item with invalid roupas_id in itens_vendidos', () => {
      const converterData = {
        itens_vendidos: [
          {
            roupas_id: 0,
            quantidade: 1
          }
        ],
        forma_pagamento: 'Pix'
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow('ID da roupa deve ser positivo');
    });

    test('should reject item with invalid quantidade in itens_vendidos', () => {
      const converterData = {
        itens_vendidos: [
          {
            roupas_id: 1,
            quantidade: 0
          }
        ],
        forma_pagamento: 'Pix'
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow('Quantidade deve ser pelo menos 1');
    });

    test('should handle non-object data in preprocessing - line 47', () => {
      const converterData = {
        itens_vendidos: 'todos',
        forma_pagamento: 'Pix'
      };

      const result = CondicionaisSchema.converterVenda.parse(converterData);
      expect(result.itens_vendidos).toBe('todos');
    });

    test('should use errorMap for invalid forma_pagamento - line 88', () => {
      const converterData = {
        itens_vendidos: 'todos',
        forma_pagamento: 'FormaPagamentoInvalida'
      };

      expect(() => {
        CondicionaisSchema.converterVenda.parse(converterData);
      }).toThrow();
    });
  });
});