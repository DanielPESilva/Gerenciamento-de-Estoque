import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import VendasService from '../../services/vendasService.js';
import VendasRepository from '../../repository/vendasRepository.js';
import ItensRepository from '../../repository/itensRepository.js';
import ClientesRepository from '../../repository/clientesRepository.js';

jest.mock('../../repository/vendasRepository.js');
jest.mock('../../repository/itensRepository.js');
jest.mock('../../repository/clientesRepository.js');

describe('VendasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new sale successfully', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [
          { item_id: 1, quantidade: 2, preco: 50.00 },
          { item_id: 2, quantidade: 1, preco: 30.00 }
        ],
        total: 130.00,
        metodo_pagamento: 'cartao'
      };

      const mockCliente = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com'
      };

      const mockItens = [
        { id: 1, nome: 'Camisa', preco: 50.00, estoque: 10 },
        { id: 2, nome: 'Calça', preco: 30.00, estoque: 5 }
      ];

      const mockVenda = {
        id: 1,
        ...vendaData,
        data_venda: new Date()
      };

      ClientesRepository.getById.mockResolvedValue(mockCliente);
      ItensRepository.getById
        .mockResolvedValueOnce(mockItens[0])
        .mockResolvedValueOnce(mockItens[1]);
      ItensRepository.updateEstoque.mockResolvedValue(true);
      VendasRepository.create.mockResolvedValue(mockVenda);

      const result = await VendasService.create(vendaData);

      expect(result).toEqual(mockVenda);
      expect(ClientesRepository.getById).toHaveBeenCalledWith(vendaData.cliente_id);
      expect(ItensRepository.getById).toHaveBeenCalledTimes(2);
      expect(ItensRepository.updateEstoque).toHaveBeenCalledTimes(2);
      expect(VendasRepository.create).toHaveBeenCalledWith(vendaData);
    });

    test('should throw error if client does not exist', async () => {
      const vendaData = {
        cliente_id: 999,
        itens: [],
        total: 0,
        metodo_pagamento: 'dinheiro'
      };

      ClientesRepository.getById.mockResolvedValue(null);

      await expect(VendasService.create(vendaData)).rejects.toThrow('Cliente não encontrado');
      
      expect(ClientesRepository.getById).toHaveBeenCalledWith(vendaData.cliente_id);
      expect(VendasRepository.create).not.toHaveBeenCalled();
    });

    test('should throw error if item does not exist', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [
          { item_id: 999, quantidade: 1, preco: 50.00 }
        ],
        total: 50.00,
        metodo_pagamento: 'cartao'
      };

      const mockCliente = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com'
      };

      ClientesRepository.getById.mockResolvedValue(mockCliente);
      ItensRepository.getById.mockResolvedValue(null);

      await expect(VendasService.create(vendaData)).rejects.toThrow('Item não encontrado');
      
      expect(ClientesRepository.getById).toHaveBeenCalledWith(vendaData.cliente_id);
      expect(ItensRepository.getById).toHaveBeenCalledWith(999);
      expect(VendasRepository.create).not.toHaveBeenCalled();
    });

    test('should throw error if insufficient stock', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [
          { item_id: 1, quantidade: 15, preco: 50.00 } // More than available stock
        ],
        total: 750.00,
        metodo_pagamento: 'cartao'
      };

      const mockCliente = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@teste.com'
      };

      const mockItem = {
        id: 1,
        nome: 'Camisa',
        preco: 50.00,
        estoque: 10 // Less than requested quantity
      };

      ClientesRepository.getById.mockResolvedValueOnce(mockCliente);
      ItensRepository.getById.mockResolvedValueOnce(mockItem);

      await expect(VendasService.create(vendaData)).rejects.toThrow('estoque insuficiente');
      
      expect(ClientesRepository.getById).toHaveBeenCalledWith(vendaData.cliente_id);
      expect(ItensRepository.getById).toHaveBeenCalledWith(1);
      expect(ItensRepository.updateEstoque).not.toHaveBeenCalled();
      expect(VendasRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    test('should return all sales', async () => {
      const mockVendas = [
        { 
          id: 1, 
          cliente_id: 1, 
          total: 130.00, 
          data_venda: new Date(),
          cliente: { nome: 'João Silva' }
        },
        { 
          id: 2, 
          cliente_id: 2, 
          total: 80.00, 
          data_venda: new Date(),
          cliente: { nome: 'Maria Santos' }
        }
      ];

      VendasRepository.getAll.mockResolvedValue(mockVendas);

      const result = await VendasService.getAll();

      expect(result).toEqual(mockVendas);
      expect(VendasRepository.getAll).toHaveBeenCalled();
    });

    test('should handle database error', async () => {
      VendasRepository.getAll.mockRejectedValue(new Error('Database error'));

      await expect(VendasService.getAll()).rejects.toThrow('Database error');
      
      expect(VendasRepository.getAll).toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    test('should return sale by id', async () => {
      const vendaId = 1;
      const mockVenda = {
        id: 1,
        cliente_id: 1,
        total: 130.00,
        data_venda: new Date(),
        cliente: { nome: 'João Silva' },
        itens: [
          { id: 1, nome: 'Camisa', quantidade: 2, preco: 50.00 }
        ]
      };

      VendasRepository.getById.mockResolvedValue(mockVenda);

      const result = await VendasService.getById(vendaId);

      expect(result).toEqual(mockVenda);
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;

      VendasRepository.getById.mockResolvedValue(null);

      const result = await VendasService.getById(vendaId);

      expect(result).toBeNull();
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
    });

    test('should handle database error', async () => {
      const vendaId = 1;

      VendasRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(VendasService.getById(vendaId)).rejects.toThrow('Database error');
      
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
    });
  });

  describe('update', () => {
    test('should update sale successfully', async () => {
      const vendaId = 1;
      const updateData = {
        metodo_pagamento: 'pix',
        observacoes: 'Pagamento via PIX'
      };

      const mockUpdatedVenda = {
        id: 1,
        cliente_id: 1,
        total: 130.00,
        ...updateData,
        data_venda: new Date()
      };

      VendasRepository.update.mockResolvedValue(mockUpdatedVenda);

      const result = await VendasService.update(vendaId, updateData);

      expect(result).toEqual(mockUpdatedVenda);
      expect(VendasRepository.update).toHaveBeenCalledWith(vendaId, updateData);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;
      const updateData = { metodo_pagamento: 'pix' };

      VendasRepository.update.mockResolvedValue(null);

      const result = await VendasService.update(vendaId, updateData);

      expect(result).toBeNull();
      expect(VendasRepository.update).toHaveBeenCalledWith(vendaId, updateData);
    });

    test('should handle database error', async () => {
      const vendaId = 1;
      const updateData = { metodo_pagamento: 'pix' };

      VendasRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(VendasService.update(vendaId, updateData)).rejects.toThrow('Database error');
      
      expect(VendasRepository.update).toHaveBeenCalledWith(vendaId, updateData);
    });
  });

  describe('delete', () => {
    test('should delete sale and restore stock', async () => {
      const vendaId = 1;
      const mockVenda = {
        id: 1,
        cliente_id: 1,
        total: 130.00,
        itens: [
          { item_id: 1, quantidade: 2 },
          { item_id: 2, quantidade: 1 }
        ]
      };

      VendasRepository.getById.mockResolvedValue(mockVenda);
      ItensRepository.restoreEstoque.mockResolvedValue(true);
      VendasRepository.delete.mockResolvedValue(mockVenda);

      const result = await VendasService.delete(vendaId);

      expect(result).toEqual(mockVenda);
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(ItensRepository.restoreEstoque).toHaveBeenCalledTimes(2);
      expect(VendasRepository.delete).toHaveBeenCalledWith(vendaId);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;

      VendasRepository.getById.mockResolvedValue(null);

      const result = await VendasService.delete(vendaId);

      expect(result).toBeNull();
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(ItensRepository.restoreEstoque).not.toHaveBeenCalled();
      expect(VendasRepository.delete).not.toHaveBeenCalled();
    });

    test('should handle database error', async () => {
      const vendaId = 1;

      VendasRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(VendasService.delete(vendaId)).rejects.toThrow('Database error');
      
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
    });
  });
});