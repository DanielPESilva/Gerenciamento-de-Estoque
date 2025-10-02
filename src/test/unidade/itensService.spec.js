import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import ItensService from '../../services/itensService.js';
import ItensRepository from '../../repository/itensRepository.js';

jest.mock('../../repository/itensRepository.js');

describe('ItensService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new item successfully', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        descricao: 'Camisa polo masculina',
        preco: 89.90,
        estoque: 20,
        categoria: 'Vestuário',
        tamanho: 'M',
        cor: 'Azul'
      };

      const mockItem = {
        id: 1,
        ...itemData,
        data_cadastro: new Date()
      };

      ItensRepository.create.mockResolvedValue(mockItem);

      const result = await ItensService.create(itemData);

      expect(result).toEqual(mockItem);
      expect(ItensRepository.create).toHaveBeenCalledWith(itemData);
    });

    test('should handle duplicate item name', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 20
      };

      ItensRepository.create.mockRejectedValue(new Error('Unique constraint violation'));

      await expect(ItensService.create(itemData)).rejects.toThrow('Item já existe');
      
      expect(ItensRepository.create).toHaveBeenCalledWith(itemData);
    });

    test('should handle database errors', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 20
      };

      ItensRepository.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(ItensService.create(itemData)).rejects.toThrow('Database connection failed');
      
      expect(ItensRepository.create).toHaveBeenCalledWith(itemData);
    });

    test('should validate required fields', async () => {
      const invalidData = {
        descricao: 'Descrição sem nome',
        preco: 89.90
      };

      await expect(ItensService.create(invalidData)).rejects.toThrow('Nome é obrigatório');
    });

    test('should validate price format', async () => {
      const invalidData = {
        nome: 'Camisa Polo',
        preco: -10,
        estoque: 20
      };

      await expect(ItensService.create(invalidData)).rejects.toThrow('Preço deve ser positivo');
    });

    test('should validate stock format', async () => {
      const invalidData = {
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: -5
      };

      await expect(ItensService.create(invalidData)).rejects.toThrow('Estoque deve ser não negativo');
    });
  });

  describe('getAll', () => {
    test('should return all items', async () => {
      const mockItens = [
        {
          id: 1,
          nome: 'Camisa Polo',
          preco: 89.90,
          estoque: 20,
          categoria: 'Vestuário'
        },
        {
          id: 2,
          nome: 'Calça Jeans',
          preco: 120.00,
          estoque: 15,
          categoria: 'Vestuário'
        }
      ];

      ItensRepository.getAll.mockResolvedValue(mockItens);

      const result = await ItensService.getAll();

      expect(result).toEqual(mockItens);
      expect(ItensRepository.getAll).toHaveBeenCalled();
    });

    test('should return empty array when no items exist', async () => {
      ItensRepository.getAll.mockResolvedValue([]);

      const result = await ItensService.getAll();

      expect(result).toEqual([]);
      expect(ItensRepository.getAll).toHaveBeenCalled();
    });

    test('should handle database error', async () => {
      ItensRepository.getAll.mockRejectedValue(new Error('Database error'));

      await expect(ItensService.getAll()).rejects.toThrow('Database error');
      
      expect(ItensRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    test('should return item by id', async () => {
      const itemId = 1;
      const mockItem = {
        id: 1,
        nome: 'Camisa Polo',
        descricao: 'Camisa polo masculina',
        preco: 89.90,
        estoque: 20,
        categoria: 'Vestuário'
      };

      ItensRepository.getById.mockResolvedValue(mockItem);

      const result = await ItensService.getById(itemId);

      expect(result).toEqual(mockItem);
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
    });

    test('should return null for non-existent item', async () => {
      const itemId = 999;

      ItensRepository.getById.mockResolvedValue(null);

      const result = await ItensService.getById(itemId);

      expect(result).toBeNull();
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
    });

    test('should handle database error', async () => {
      const itemId = 1;

      ItensRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(ItensService.getById(itemId)).rejects.toThrow('Database error');
      
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
    });
  });

  describe('update', () => {
    test('should update item successfully', async () => {
      const itemId = 1;
      const updateData = {
        nome: 'Camisa Polo Premium',
        preco: 99.90,
        estoque: 25
      };

      const mockUpdatedItem = {
        id: 1,
        descricao: 'Camisa polo masculina',
        categoria: 'Vestuário',
        ...updateData,
        data_atualizacao: new Date()
      };

      ItensRepository.update.mockResolvedValue(mockUpdatedItem);

      const result = await ItensService.update(itemId, updateData);

      expect(result).toEqual(mockUpdatedItem);
      expect(ItensRepository.update).toHaveBeenCalledWith(itemId, updateData);
    });

    test('should return null for non-existent item', async () => {
      const itemId = 999;
      const updateData = { nome: 'Novo Nome' };

      ItensRepository.update.mockResolvedValue(null);

      const result = await ItensService.update(itemId, updateData);

      expect(result).toBeNull();
      expect(ItensRepository.update).toHaveBeenCalledWith(itemId, updateData);
    });

    test('should validate update data', async () => {
      const itemId = 1;
      const invalidData = {
        preco: -10
      };

      await expect(ItensService.update(itemId, invalidData)).rejects.toThrow('Preço deve ser positivo');
    });

    test('should handle database error', async () => {
      const itemId = 1;
      const updateData = { nome: 'Novo Nome' };

      ItensRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(ItensService.update(itemId, updateData)).rejects.toThrow('Database error');
      
      expect(ItensRepository.update).toHaveBeenCalledWith(itemId, updateData);
    });
  });

  describe('delete', () => {
    test('should delete item successfully', async () => {
      const itemId = 1;
      const mockDeletedItem = {
        id: 1,
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 20
      };

      ItensRepository.hasVendas.mockResolvedValue(false);
      ItensRepository.delete.mockResolvedValue(mockDeletedItem);

      const result = await ItensService.delete(itemId);

      expect(result).toEqual(mockDeletedItem);
      expect(ItensRepository.hasVendas).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.delete).toHaveBeenCalledWith(itemId);
    });

    test('should prevent deletion of items with sales history', async () => {
      const itemId = 1;

      ItensRepository.hasVendas.mockResolvedValue(true);

      await expect(ItensService.delete(itemId)).rejects.toThrow('Item possui histórico de vendas');
      
      expect(ItensRepository.hasVendas).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.delete).not.toHaveBeenCalled();
    });

    test('should return null for non-existent item', async () => {
      const itemId = 999;

      ItensRepository.hasVendas.mockResolvedValue(false);
      ItensRepository.delete.mockResolvedValue(null);

      const result = await ItensService.delete(itemId);

      expect(result).toBeNull();
      expect(ItensRepository.hasVendas).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.delete).toHaveBeenCalledWith(itemId);
    });

    test('should handle database error', async () => {
      const itemId = 1;

      ItensRepository.hasVendas.mockRejectedValue(new Error('Database error'));

      await expect(ItensService.delete(itemId)).rejects.toThrow('Database error');
      
      expect(ItensRepository.hasVendas).toHaveBeenCalledWith(itemId);
    });
  });

  describe('getByCategory', () => {
    test('should return items by category', async () => {
      const categoria = 'Vestuário';
      const mockItens = [
        {
          id: 1,
          nome: 'Camisa Polo',
          preco: 89.90,
          categoria: 'Vestuário'
        },
        {
          id: 2,
          nome: 'Calça Jeans',
          preco: 120.00,
          categoria: 'Vestuário'
        }
      ];

      ItensRepository.getByCategory.mockResolvedValue(mockItens);

      const result = await ItensService.getByCategory(categoria);

      expect(result).toEqual(mockItens);
      expect(ItensRepository.getByCategory).toHaveBeenCalledWith(categoria);
    });

    test('should return empty array for non-existent category', async () => {
      const categoria = 'Eletrônicos';

      ItensRepository.getByCategory.mockResolvedValue([]);

      const result = await ItensService.getByCategory(categoria);

      expect(result).toEqual([]);
      expect(ItensRepository.getByCategory).toHaveBeenCalledWith(categoria);
    });

    test('should handle database error', async () => {
      const categoria = 'Vestuário';

      ItensRepository.getByCategory.mockRejectedValue(new Error('Database error'));

      await expect(ItensService.getByCategory(categoria)).rejects.toThrow('Database error');
      
      expect(ItensRepository.getByCategory).toHaveBeenCalledWith(categoria);
    });
  });

  describe('updateStock', () => {
    test('should add stock successfully', async () => {
      const itemId = 1;
      const stockData = { quantidade: 10, operacao: 'adicionar' };

      const mockCurrentItem = {
        id: 1,
        nome: 'Camisa Polo',
        estoque: 20
      };

      const mockUpdatedItem = {
        ...mockCurrentItem,
        estoque: 30
      };

      ItensRepository.getById.mockResolvedValue(mockCurrentItem);
      ItensRepository.updateStock.mockResolvedValue(mockUpdatedItem);

      const result = await ItensService.updateStock(itemId, stockData);

      expect(result).toEqual(mockUpdatedItem);
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.updateStock).toHaveBeenCalledWith(itemId, 30);
    });

    test('should remove stock successfully', async () => {
      const itemId = 1;
      const stockData = { quantidade: 5, operacao: 'remover' };

      const mockCurrentItem = {
        id: 1,
        nome: 'Camisa Polo',
        estoque: 20
      };

      const mockUpdatedItem = {
        ...mockCurrentItem,
        estoque: 15
      };

      ItensRepository.getById.mockResolvedValue(mockCurrentItem);
      ItensRepository.updateStock.mockResolvedValue(mockUpdatedItem);

      const result = await ItensService.updateStock(itemId, stockData);

      expect(result).toEqual(mockUpdatedItem);
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.updateStock).toHaveBeenCalledWith(itemId, 15);
    });

    test('should prevent removal of more stock than available', async () => {
      const itemId = 1;
      const stockData = { quantidade: 25, operacao: 'remover' };

      const mockCurrentItem = {
        id: 1,
        nome: 'Camisa Polo',
        estoque: 20
      };

      ItensRepository.getById.mockResolvedValue(mockCurrentItem);

      await expect(ItensService.updateStock(itemId, stockData)).rejects.toThrow('Estoque insuficiente');
      
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.updateStock).not.toHaveBeenCalled();
    });

    test('should handle non-existent item', async () => {
      const itemId = 999;
      const stockData = { quantidade: 10, operacao: 'adicionar' };

      ItensRepository.getById.mockResolvedValue(null);

      await expect(ItensService.updateStock(itemId, stockData)).rejects.toThrow('Item não encontrado');
      
      expect(ItensRepository.getById).toHaveBeenCalledWith(itemId);
      expect(ItensRepository.updateStock).not.toHaveBeenCalled();
    });

    test('should validate stock operation', async () => {
      const itemId = 1;
      const invalidStockData = { quantidade: 10, operacao: 'invalid' };

      await expect(ItensService.updateStock(itemId, invalidStockData)).rejects.toThrow('Operação inválida');
    });

    test('should validate stock quantity', async () => {
      const itemId = 1;
      const invalidStockData = { quantidade: -5, operacao: 'adicionar' };

      await expect(ItensService.updateStock(itemId, invalidStockData)).rejects.toThrow('Quantidade deve ser positiva');
    });
  });

  describe('getLowStock', () => {
    test('should return items with low stock', async () => {
      const minStock = 5;
      const mockLowStockItems = [
        {
          id: 1,
          nome: 'Camisa Polo',
          estoque: 3,
          estoque_minimo: 5
        },
        {
          id: 2,
          nome: 'Calça Jeans',
          estoque: 2,
          estoque_minimo: 10
        }
      ];

      ItensRepository.getLowStock.mockResolvedValue(mockLowStockItems);

      const result = await ItensService.getLowStock(minStock);

      expect(result).toEqual(mockLowStockItems);
      expect(ItensRepository.getLowStock).toHaveBeenCalledWith(minStock);
    });

    test('should use default minimum stock value', async () => {
      const mockLowStockItems = [];

      ItensRepository.getLowStock.mockResolvedValue(mockLowStockItems);

      const result = await ItensService.getLowStock();

      expect(result).toEqual(mockLowStockItems);
      expect(ItensRepository.getLowStock).toHaveBeenCalledWith(10); // default value
    });
  });
});