import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import VendasService from '../../services/vendasService.js';

// Mock dos repositórios
const VendasRepository = {
  create: jest.fn(),
  getAll: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const ItensRepository = {
  getById: jest.fn(),
  decreaseEstoque: jest.fn(),
  restoreEstoque: jest.fn()
};

const ClientesRepository = {
  getById: jest.fn()
};

// Mock manual dos módulos
jest.doMock('../../repository/vendasRepository.js', () => VendasRepository);
jest.doMock('../../repository/itensRepository.js', () => ItensRepository);
jest.doMock('../../repository/clientesRepository.js', () => ClientesRepository);

describe('VendasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    test('should create a new sale successfully', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [
          { item_id: 1, quantidade: 2, preco_unitario: 10.00 },
          { item_id: 2, quantidade: 1, preco_unitario: 20.00 }
        ],
        metodo_pagamento: 'cartao',
        observacoes: 'Teste'
      };

      const mockCliente = {
        id: 1,
        nome: 'Cliente Teste',
        email: 'cliente@teste.com'
      };

      const mockItens = [
        { id: 1, nome: 'Item 1', estoque: 10, preco: 10.00 },
        { id: 2, nome: 'Item 2', estoque: 5, preco: 20.00 }
      ];

      const mockVenda = {
        id: 1,
        cliente_id: 1,
        total: 40.00,
        metodo_pagamento: 'cartao',
        observacoes: 'Teste',
        data_venda: new Date(),
        itens: vendaData.itens
      };

      ClientesRepository.getById.mockResolvedValue(mockCliente);
      ItensRepository.getById
        .mockResolvedValueOnce(mockItens[0])
        .mockResolvedValueOnce(mockItens[1]);
      ItensRepository.decreaseEstoque
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      VendasRepository.create.mockResolvedValue(mockVenda);

      const result = await VendasService.create(vendaData);

      expect(ClientesRepository.getById).toHaveBeenCalledWith(1);
      expect(ItensRepository.getById).toHaveBeenCalledTimes(2);
      expect(ItensRepository.decreaseEstoque).toHaveBeenCalledTimes(2);
      expect(VendasRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockVenda);
    });

    test('should throw error if client does not exist', async () => {
      const vendaData = {
        cliente_id: 999,
        itens: [{ item_id: 1, quantidade: 1, preco_unitario: 10.00 }],
        metodo_pagamento: 'cartao'
      };

      ClientesRepository.getById.mockResolvedValue(null);

      await expect(VendasService.create(vendaData)).rejects.toThrow('Cliente não encontrado');
      expect(ClientesRepository.getById).toHaveBeenCalledWith(999);
    });

    test('should throw error if item does not exist', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [{ item_id: 999, quantidade: 1, preco_unitario: 10.00 }],
        metodo_pagamento: 'cartao'
      };

      const mockCliente = {
        id: 1,
        nome: 'Cliente Teste'
      };

      ClientesRepository.getById.mockResolvedValue(mockCliente);
      ItensRepository.getById.mockResolvedValue(null);

      await expect(VendasService.create(vendaData)).rejects.toThrow('Item não encontrado');
      expect(ItensRepository.getById).toHaveBeenCalledWith(999);
    });

    test('should throw error if insufficient stock', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [{ item_id: 1, quantidade: 15, preco_unitario: 10.00 }],
        metodo_pagamento: 'cartao'
      };

      const mockCliente = {
        id: 1,
        nome: 'Cliente Teste'
      };

      const mockItem = {
        id: 1,
        nome: 'Item 1',
        estoque: 5,
        preco: 10.00
      };

      ClientesRepository.getById.mockResolvedValue(mockCliente);
      ItensRepository.getById.mockResolvedValue(mockItem);

      await expect(VendasService.create(vendaData)).rejects.toThrow('estoque insuficiente');
      expect(ItensRepository.getById).toHaveBeenCalledWith(1);
    });
  });

  describe('getAll', () => {
    test('should return all sales', async () => {
      const mockVendas = [
        {
          id: 1,
          cliente_id: 1,
          total: 100.00,
          metodo_pagamento: 'cartao',
          data_venda: new Date()
        },
        {
          id: 2,
          cliente_id: 2,
          total: 200.00,
          metodo_pagamento: 'pix',
          data_venda: new Date()
        }
      ];

      VendasRepository.getAll.mockResolvedValue(mockVendas);

      const result = await VendasService.getAll();

      expect(VendasRepository.getAll).toHaveBeenCalled();
      expect(result).toEqual(mockVendas);
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
        total: 100.00,
        metodo_pagamento: 'cartao',
        data_venda: new Date()
      };

      VendasRepository.getById.mockResolvedValue(mockVenda);

      const result = await VendasService.getById(vendaId);

      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(result).toEqual(mockVenda);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;

      VendasRepository.getById.mockResolvedValue(null);

      const result = await VendasService.getById(vendaId);

      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(result).toBeNull();
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
      const updateData = { metodo_pagamento: 'pix', observacoes: 'Atualizado' };
      const mockUpdatedVenda = {
        id: 1,
        cliente_id: 1,
        total: 100.00,
        metodo_pagamento: 'pix',
        observacoes: 'Atualizado',
        data_venda: new Date()
      };

      VendasRepository.update.mockResolvedValue(mockUpdatedVenda);

      const result = await VendasService.update(vendaId, updateData);

      expect(VendasRepository.update).toHaveBeenCalledWith(vendaId, updateData);
      expect(result).toEqual(mockUpdatedVenda);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;
      const updateData = { metodo_pagamento: 'pix' };

      VendasRepository.update.mockResolvedValue(null);

      const result = await VendasService.update(vendaId, updateData);

      expect(VendasRepository.update).toHaveBeenCalledWith(vendaId, updateData);
      expect(result).toBeNull();
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
        total: 100.00,
        itens: [
          { item_id: 1, quantidade: 2 },
          { item_id: 2, quantidade: 1 }
        ]
      };

      VendasRepository.getById.mockResolvedValue(mockVenda);
      ItensRepository.restoreEstoque.mockResolvedValue(true);
      VendasRepository.delete.mockResolvedValue(mockVenda);

      const result = await VendasService.delete(vendaId);

      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(ItensRepository.restoreEstoque).toHaveBeenCalledTimes(2);
      expect(VendasRepository.delete).toHaveBeenCalledWith(vendaId);
      expect(result).toEqual(mockVenda);
    });

    test('should return null for non-existent sale', async () => {
      const vendaId = 999;

      VendasRepository.getById.mockResolvedValue(null);

      const result = await VendasService.delete(vendaId);

      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
      expect(result).toBeNull();
    });

    test('should handle database error', async () => {
      const vendaId = 1;

      VendasRepository.getById.mockRejectedValue(new Error('Database error'));

      await expect(VendasService.delete(vendaId)).rejects.toThrow('Database error');
      expect(VendasRepository.getById).toHaveBeenCalledWith(vendaId);
    });
  });
});