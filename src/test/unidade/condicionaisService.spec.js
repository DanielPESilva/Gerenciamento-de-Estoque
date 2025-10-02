import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import CondicionaisService from '../../services/condicionaisService.js';

// Mock dos repositórios e serviços
const CondicionaisRepository = {
  listarCondicionais: jest.fn(),
  obterCondicionalPorId: jest.fn(),
  criarCondicional: jest.fn(),
  atualizarCondicional: jest.fn(),
  excluirCondicional: jest.fn(),
  processarDevolucao: jest.fn(),
  processarConversaoVenda: jest.fn()
};

const VendasService = {
  create: jest.fn()
};

// Mock manual dos módulos
jest.doMock('../../repository/condicionaisRepository.js', () => CondicionaisRepository);
jest.doMock('./vendasService.js', () => VendasService);

describe('CondicionaisService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarCondicionais', () => {
    test('should return condicionais with valid filters', async () => {
      const query = {
        cliente_id: '1',
        devolvido: 'false',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        page: '1',
        limit: '10'
      };

      const mockResult = {
        data: [
          {
            id: 1,
            cliente_id: 1,
            data_condicional: new Date('2024-01-15'),
            valor_total: 150.00,
            devolvido: false,
            prazo_devolucao: new Date('2024-01-22'),
            observacoes: 'Condicional teste'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      CondicionaisRepository.listarCondicionais.mockResolvedValue(mockResult);

      const result = await CondicionaisService.listarCondicionais(query);

      expect(CondicionaisRepository.listarCondicionais).toHaveBeenCalledWith(
        {
          cliente_id: 1,
          devolvido: false,
          data_inicio: '2024-01-01',
          data_fim: '2024-12-31'
        },
        { page: 1, limit: 10 }
      );
      expect(result).toEqual(mockResult);
    });

    test('should return error for invalid cliente_id', async () => {
      const query = {
        cliente_id: 'invalid'
      };

      const result = await CondicionaisService.listarCondicionais(query);

      expect(result).toEqual({
        success: false,
        message: 'ID do cliente deve ser um número válido',
        code: 'INVALID_CLIENT_ID'
      });
    });

    test('should handle database error', async () => {
      const query = { page: '1', limit: '10' };

      CondicionaisRepository.listarCondicionais.mockRejectedValue(new Error('Database error'));

      await expect(CondicionaisService.listarCondicionais(query)).rejects.toThrow('Database error');
    });

    test('should apply default pagination when not provided', async () => {
      const query = {};

      const mockResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };

      CondicionaisRepository.listarCondicionais.mockResolvedValue(mockResult);

      await CondicionaisService.listarCondicionais(query);

      expect(CondicionaisRepository.listarCondicionais).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 }
      );
    });
  });

  describe('obterCondicionalPorId', () => {
    test('should return condicional by id', async () => {
      const condicionalId = 1;
      const mockCondicional = {
        id: 1,
        cliente_id: 1,
        data_condicional: new Date('2024-01-15'),
        valor_total: 200.00,
        devolvido: false,
        prazo_devolucao: new Date('2024-01-22'),
        itens: [
          {
            id: 1,
            roupa_id: 1,
            quantidade: 2,
            valor_unitario: 100.00
          }
        ]
      };

      CondicionaisRepository.obterCondicionalPorId.mockResolvedValue(mockCondicional);

      const result = await CondicionaisService.obterCondicionalPorId(condicionalId);

      expect(CondicionaisRepository.obterCondicionalPorId).toHaveBeenCalledWith(condicionalId);
      expect(result).toEqual(mockCondicional);
    });

    test('should return null for non-existent condicional', async () => {
      const condicionalId = 999;

      CondicionaisRepository.obterCondicionalPorId.mockResolvedValue(null);

      const result = await CondicionaisService.obterCondicionalPorId(condicionalId);

      expect(result).toBeNull();
    });
  });

  describe('criarCondicional', () => {
    test('should create new condicional successfully', async () => {
      const condicionalData = {
        cliente_id: 1,
        data_condicional: '2024-01-15',
        prazo_devolucao: '2024-01-22',
        observacoes: 'Nova condicional',
        itens: [
          {
            roupa_id: 1,
            quantidade: 3,
            valor_unitario: 75.00
          }
        ]
      };

      const mockCreatedCondicional = {
        id: 1,
        cliente_id: 1,
        data_condicional: new Date('2024-01-15'),
        prazo_devolucao: new Date('2024-01-22'),
        valor_total: 225.00,
        devolvido: false,
        observacoes: 'Nova condicional',
        itens: [
          {
            id: 1,
            roupa_id: 1,
            quantidade: 3,
            valor_unitario: 75.00
          }
        ]
      };

      CondicionaisRepository.criarCondicional.mockResolvedValue(mockCreatedCondicional);

      const result = await CondicionaisService.criarCondicional(condicionalData);

      expect(CondicionaisRepository.criarCondicional).toHaveBeenCalledWith(condicionalData);
      expect(result).toEqual(mockCreatedCondicional);
    });

    test('should handle validation error during creation', async () => {
      const condicionalData = {
        cliente_id: null,
        itens: []
      };

      CondicionaisRepository.criarCondicional.mockRejectedValue(new Error('Dados inválidos'));

      await expect(CondicionaisService.criarCondicional(condicionalData)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('atualizarCondicional', () => {
    test('should update condicional successfully', async () => {
      const condicionalId = 1;
      const updateData = {
        observacoes: 'Condicional atualizada',
        prazo_devolucao: '2024-01-30'
      };

      const mockUpdatedCondicional = {
        id: 1,
        cliente_id: 1,
        data_condicional: new Date('2024-01-15'),
        prazo_devolucao: new Date('2024-01-30'),
        valor_total: 150.00,
        devolvido: false,
        observacoes: 'Condicional atualizada'
      };

      CondicionaisRepository.atualizarCondicional.mockResolvedValue(mockUpdatedCondicional);

      const result = await CondicionaisService.atualizarCondicional(condicionalId, updateData);

      expect(CondicionaisRepository.atualizarCondicional).toHaveBeenCalledWith(condicionalId, updateData);
      expect(result).toEqual(mockUpdatedCondicional);
    });

    test('should return null for non-existent condicional', async () => {
      const condicionalId = 999;
      const updateData = { observacoes: 'Teste' };

      CondicionaisRepository.atualizarCondicional.mockResolvedValue(null);

      const result = await CondicionaisService.atualizarCondicional(condicionalId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('excluirCondicional', () => {
    test('should delete condicional successfully', async () => {
      const condicionalId = 1;
      const mockDeletedCondicional = {
        id: 1,
        cliente_id: 1,
        valor_total: 100.00,
        devolvido: false
      };

      CondicionaisRepository.excluirCondicional.mockResolvedValue(mockDeletedCondicional);

      const result = await CondicionaisService.excluirCondicional(condicionalId);

      expect(CondicionaisRepository.excluirCondicional).toHaveBeenCalledWith(condicionalId);
      expect(result).toEqual(mockDeletedCondicional);
    });

    test('should return null for non-existent condicional', async () => {
      const condicionalId = 999;

      CondicionaisRepository.excluirCondicional.mockResolvedValue(null);

      const result = await CondicionaisService.excluirCondicional(condicionalId);

      expect(result).toBeNull();
    });
  });

  describe('processarDevolucao', () => {
    test('should process return successfully', async () => {
      const condicionalId = 1;
      const motivoDevolucao = 'Cliente não ficou satisfeito';

      const mockProcessedReturn = {
        id: 1,
        cliente_id: 1,
        valor_total: 150.00,
        devolvido: true,
        data_devolucao: new Date(),
        motivo_devolucao: motivoDevolucao
      };

      CondicionaisRepository.processarDevolucao.mockResolvedValue(mockProcessedReturn);

      const result = await CondicionaisService.processarDevolucao(condicionalId, motivoDevolucao);

      expect(CondicionaisRepository.processarDevolucao).toHaveBeenCalledWith(condicionalId, motivoDevolucao);
      expect(result).toEqual(mockProcessedReturn);
    });

    test('should handle error when condicional not found for return', async () => {
      const condicionalId = 999;
      const motivoDevolucao = 'Teste';

      CondicionaisRepository.processarDevolucao.mockRejectedValue(new Error('Condicional não encontrada'));

      await expect(CondicionaisService.processarDevolucao(condicionalId, motivoDevolucao))
        .rejects.toThrow('Condicional não encontrada');
    });
  });

  describe('processarConversaoVenda', () => {
    test('should convert condicional to sale successfully', async () => {
      const condicionalId = 1;
      const dadosVenda = {
        metodo_pagamento: 'cartao',
        observacoes: 'Conversão de condicional'
      };

      const mockCondicional = {
        id: 1,
        cliente_id: 1,
        valor_total: 200.00,
        itens: [
          {
            roupa_id: 1,
            quantidade: 2,
            valor_unitario: 100.00
          }
        ]
      };

      const mockVenda = {
        id: 1,
        cliente_id: 1,
        total: 200.00,
        metodo_pagamento: 'cartao',
        observacoes: 'Conversão de condicional',
        data_venda: new Date()
      };

      CondicionaisRepository.obterCondicionalPorId.mockResolvedValue(mockCondicional);
      VendasService.create.mockResolvedValue(mockVenda);
      CondicionaisRepository.processarConversaoVenda.mockResolvedValue({
        venda: mockVenda,
        condicional_atualizada: {
          ...mockCondicional,
          convertida_venda: true,
          venda_id: 1
        }
      });

      const result = await CondicionaisService.processarConversaoVenda(condicionalId, dadosVenda);

      expect(CondicionaisRepository.obterCondicionalPorId).toHaveBeenCalledWith(condicionalId);
      expect(VendasService.create).toHaveBeenCalled();
      expect(CondicionaisRepository.processarConversaoVenda).toHaveBeenCalled();
      expect(result).toHaveProperty('venda');
      expect(result).toHaveProperty('condicional_atualizada');
    });

    test('should handle error when condicional not found for conversion', async () => {
      const condicionalId = 999;
      const dadosVenda = { metodo_pagamento: 'cartao' };

      CondicionaisRepository.obterCondicionalPorId.mockResolvedValue(null);

      await expect(CondicionaisService.processarConversaoVenda(condicionalId, dadosVenda))
        .rejects.toThrow();
    });
  });
});