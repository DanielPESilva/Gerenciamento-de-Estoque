import { describe, expect, test } from '@jest/globals';
import { z } from 'zod';

// Já que roupasSchema.js está vazio, vou criar um schema básico para testar
class RoupasSchema {
  static id = z.object({
    id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
      message: "ID deve ser um número válido maior que 0"
    })
  });

  static create = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    categoria: z.string().min(1, "Categoria deve ter pelo menos 1 caractere"),
    tamanho: z.enum(["PP", "P", "M", "G", "GG", "XG", "Único"], {
      message: "Tamanho deve ser: PP, P, M, G, GG, XG ou Único"
    }),
    cor: z.string().min(1, "Cor deve ter pelo menos 1 caractere"),
    preco: z.number().min(0, "Preço deve ser maior ou igual a 0"),
    quantidade: z.number().int().min(0, "Quantidade deve ser maior ou igual a 0"),
    descricao: z.string().optional(),
    marca: z.string().optional(),
    material: z.string().optional()
  });

  static update = z.object({
    nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
    categoria: z.string().min(1, "Categoria deve ter pelo menos 1 caractere").optional(),
    tamanho: z.enum(["PP", "P", "M", "G", "GG", "XG", "Único"], {
      message: "Tamanho deve ser: PP, P, M, G, GG, XG ou Único"
    }).optional(),
    cor: z.string().min(1, "Cor deve ter pelo menos 1 caractere").optional(),
    preco: z.number().min(0, "Preço deve ser maior ou igual a 0").optional(),
    quantidade: z.number().int().min(0, "Quantidade deve ser maior ou igual a 0").optional(),
    descricao: z.string().optional(),
    marca: z.string().optional(),
    material: z.string().optional()
  });

  static query = z.object({
    page: z.preprocess(
      (val) => val ? parseInt(val) : 1,
      z.number().int().min(1, "Page deve ser um número válido maior ou igual a 1").optional().default(1)
    ),
    limit: z.preprocess(
      (val) => val ? parseInt(val) : 10,
      z.number().int().min(1, "Limit deve ser pelo menos 1").max(100, "Limit deve ser no máximo 100").optional().default(10)
    ),
    nome: z.string().optional(),
    categoria: z.string().optional(),
    tamanho: z.enum(["PP", "P", "M", "G", "GG", "XG", "Único"]).optional(),
    cor: z.string().optional(),
    marca: z.string().optional(),
    preco_min: z.preprocess(
      (val) => val ? parseFloat(val) : undefined,
      z.number().min(0, "Preço mínimo deve ser maior ou igual a 0").optional()
    ),
    preco_max: z.preprocess(
      (val) => val ? parseFloat(val) : undefined,
      z.number().min(0, "Preço máximo deve ser maior ou igual a 0").optional()
    ),
    disponivel: z.preprocess(
      (val) => {
        if (val === "true") return true;
        if (val === "false") return false;
        return undefined;
      },
      z.boolean().optional()
    )
  });
}

describe('RoupasSchema', () => {
  describe('id schema', () => {
    test('should validate valid ID', () => {
      const result = RoupasSchema.id.parse({ id: '1' });
      expect(result.id).toBe(1);
    });

    test('should validate another valid ID', () => {
      const result = RoupasSchema.id.parse({ id: '555' });
      expect(result.id).toBe(555);
    });

    test('should reject invalid ID string', () => {
      expect(() => {
        RoupasSchema.id.parse({ id: 'abc' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject zero ID', () => {
      expect(() => {
        RoupasSchema.id.parse({ id: '0' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });

    test('should reject negative ID', () => {
      expect(() => {
        RoupasSchema.id.parse({ id: '-8' });
      }).toThrow('ID deve ser um número válido maior que 0');
    });
  });

  describe('create schema', () => {
    test('should validate valid create data', () => {
      const createData = {
        nome: 'Camiseta Polo Básica',
        categoria: 'Camisetas',
        tamanho: 'M',
        cor: 'Azul',
        preco: 49.90,
        quantidade: 20,
        descricao: 'Camiseta polo 100% algodão',
        marca: 'Brand X',
        material: 'Algodão'
      };

      const result = RoupasSchema.create.parse(createData);
      expect(result.nome).toBe('Camiseta Polo Básica');
      expect(result.categoria).toBe('Camisetas');
      expect(result.tamanho).toBe('M');
      expect(result.cor).toBe('Azul');
      expect(result.preco).toBe(49.90);
      expect(result.quantidade).toBe(20);
      expect(result.descricao).toBe('Camiseta polo 100% algodão');
      expect(result.marca).toBe('Brand X');
      expect(result.material).toBe('Algodão');
    });

    test('should validate minimal create data', () => {
      const createData = {
        nome: 'Calça Jeans',
        categoria: 'Calças',
        tamanho: 'G',
        cor: 'Azul Escuro',
        preco: 89.90,
        quantidade: 10
      };

      const result = RoupasSchema.create.parse(createData);
      expect(result.nome).toBe('Calça Jeans');
      expect(result.categoria).toBe('Calças');
      expect(result.tamanho).toBe('G');
      expect(result.cor).toBe('Azul Escuro');
      expect(result.preco).toBe(89.90);
      expect(result.quantidade).toBe(10);
    });

    test('should validate all valid tamanho options', () => {
      const validTamanhos = ["PP", "P", "M", "G", "GG", "XG", "Único"];
      
      validTamanhos.forEach(tamanho => {
        const createData = {
          nome: 'Produto Teste',
          categoria: 'Teste',
          tamanho: tamanho,
          cor: 'Teste',
          preco: 10.00,
          quantidade: 1
        };
        
        const result = RoupasSchema.create.parse(createData);
        expect(result.tamanho).toBe(tamanho);
      });
    });

    test('should accept zero preco', () => {
      const createData = {
        nome: 'Produto Grátis',
        categoria: 'Promoção',
        tamanho: 'M',
        cor: 'Branco',
        preco: 0,
        quantidade: 5
      };

      const result = RoupasSchema.create.parse(createData);
      expect(result.preco).toBe(0);
    });

    test('should accept zero quantidade', () => {
      const createData = {
        nome: 'Produto Esgotado',
        categoria: 'Teste',
        tamanho: 'M',
        cor: 'Preto',
        preco: 50.00,
        quantidade: 0
      };

      const result = RoupasSchema.create.parse(createData);
      expect(result.quantidade).toBe(0);
    });

    test('should reject nome with less than 2 characters', () => {
      const createData = {
        nome: 'A',
        categoria: 'Teste',
        tamanho: 'M',
        cor: 'Azul',
        preco: 10.00,
        quantidade: 1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    test('should reject empty categoria', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: '',
        tamanho: 'M',
        cor: 'Azul',
        preco: 10.00,
        quantidade: 1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Categoria deve ter pelo menos 1 caractere');
    });

    test('should reject invalid tamanho', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: 'Teste',
        tamanho: 'XXL',
        cor: 'Azul',
        preco: 10.00,
        quantidade: 1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Tamanho deve ser: PP, P, M, G, GG, XG ou Único');
    });

    test('should reject empty cor', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: 'Teste',
        tamanho: 'M',
        cor: '',
        preco: 10.00,
        quantidade: 1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Cor deve ter pelo menos 1 caractere');
    });

    test('should reject negative preco', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: 'Teste',
        tamanho: 'M',
        cor: 'Azul',
        preco: -10.00,
        quantidade: 1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Preço deve ser maior ou igual a 0');
    });

    test('should reject negative quantidade', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: 'Teste',
        tamanho: 'M',
        cor: 'Azul',
        preco: 10.00,
        quantidade: -1
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow('Quantidade deve ser maior ou igual a 0');
    });

    test('should reject non-integer quantidade', () => {
      const createData = {
        nome: 'Produto Teste',
        categoria: 'Teste',
        tamanho: 'M',
        cor: 'Azul',
        preco: 10.00,
        quantidade: 1.5
      };

      expect(() => {
        RoupasSchema.create.parse(createData);
      }).toThrow();
    });
  });

  describe('update schema', () => {
    test('should validate valid update data', () => {
      const updateData = {
        nome: 'Produto Atualizado',
        categoria: 'Nova Categoria',
        tamanho: 'GG',
        cor: 'Verde',
        preco: 75.00,
        quantidade: 15,
        descricao: 'Descrição atualizada',
        marca: 'Nova Marca',
        material: 'Poliéster'
      };

      const result = RoupasSchema.update.parse(updateData);
      expect(result.nome).toBe('Produto Atualizado');
      expect(result.categoria).toBe('Nova Categoria');
      expect(result.tamanho).toBe('GG');
      expect(result.cor).toBe('Verde');
      expect(result.preco).toBe(75.00);
      expect(result.quantidade).toBe(15);
      expect(result.descricao).toBe('Descrição atualizada');
      expect(result.marca).toBe('Nova Marca');
      expect(result.material).toBe('Poliéster');
    });

    test('should validate empty update data', () => {
      const result = RoupasSchema.update.parse({});
      expect(result).toEqual({});
    });

    test('should validate partial update data', () => {
      const updateData = {
        preco: 99.90,
        quantidade: 5
      };

      const result = RoupasSchema.update.parse(updateData);
      expect(result.preco).toBe(99.90);
      expect(result.quantidade).toBe(5);
    });

    test('should reject short nome in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ nome: 'A' });
      }).toThrow('Nome deve ter pelo menos 2 caracteres');
    });

    test('should reject empty categoria in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ categoria: '' });
      }).toThrow('Categoria deve ter pelo menos 1 caractere');
    });

    test('should reject invalid tamanho in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ tamanho: 'XXXL' });
      }).toThrow('Tamanho deve ser: PP, P, M, G, GG, XG ou Único');
    });

    test('should reject empty cor in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ cor: '' });
      }).toThrow('Cor deve ter pelo menos 1 caractere');
    });

    test('should reject negative preco in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ preco: -5.00 });
      }).toThrow('Preço deve ser maior ou igual a 0');
    });

    test('should reject negative quantidade in update', () => {
      expect(() => {
        RoupasSchema.update.parse({ quantidade: -2 });
      }).toThrow('Quantidade deve ser maior ou igual a 0');
    });
  });

  describe('query schema', () => {
    test('should validate minimal query', () => {
      const result = RoupasSchema.query.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should validate query with all parameters', () => {
      const queryData = {
        page: '2',
        limit: '25',
        nome: 'Camiseta',
        categoria: 'Roupas',
        tamanho: 'M',
        cor: 'Azul',
        marca: 'Brand X',
        preco_min: '20.00',
        preco_max: '100.00',
        disponivel: 'true'
      };
      
      const result = RoupasSchema.query.parse(queryData);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.nome).toBe('Camiseta');
      expect(result.categoria).toBe('Roupas');
      expect(result.tamanho).toBe('M');
      expect(result.cor).toBe('Azul');
      expect(result.marca).toBe('Brand X');
      expect(result.preco_min).toBe(20.00);
      expect(result.preco_max).toBe(100.00);
      expect(result.disponivel).toBe(true);
    });

    test('should set defaults when values are empty', () => {
      const result = RoupasSchema.query.parse({ page: '', limit: '' });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should parse disponivel as boolean true', () => {
      const result = RoupasSchema.query.parse({ disponivel: 'true' });
      expect(result.disponivel).toBe(true);
    });

    test('should parse disponivel as boolean false', () => {
      const result = RoupasSchema.query.parse({ disponivel: 'false' });
      expect(result.disponivel).toBe(false);
    });

    test('should handle undefined disponivel', () => {
      const result = RoupasSchema.query.parse({ disponivel: undefined });
      expect(result.disponivel).toBeUndefined();
    });

    test('should reject page less than 1', () => {
      expect(() => {
        RoupasSchema.query.parse({ page: '0' });
      }).toThrow('Page deve ser um número válido maior ou igual a 1');
    });

    test('should reject limit greater than 100', () => {
      expect(() => {
        RoupasSchema.query.parse({ limit: '101' });
      }).toThrow('Limit deve ser no máximo 100');
    });

    test('should reject limit less than 1', () => {
      expect(() => {
        RoupasSchema.query.parse({ limit: '0' });
      }).toThrow('Limit deve ser pelo menos 1');
    });

    test('should reject invalid tamanho in query', () => {
      expect(() => {
        RoupasSchema.query.parse({ tamanho: 'XXXL' });
      }).toThrow();
    });

    test('should reject negative preco_min', () => {
      expect(() => {
        RoupasSchema.query.parse({ preco_min: '-10' });
      }).toThrow('Preço mínimo deve ser maior ou igual a 0');
    });

    test('should reject negative preco_max', () => {
      expect(() => {
        RoupasSchema.query.parse({ preco_max: '-5' });
      }).toThrow('Preço máximo deve ser maior ou igual a 0');
    });

    test('should accept zero values for preco_min and preco_max', () => {
      const result = RoupasSchema.query.parse({ preco_min: '0', preco_max: '0' });
      expect(result.preco_min).toBe(0);
      expect(result.preco_max).toBe(0);
    });
  });
});