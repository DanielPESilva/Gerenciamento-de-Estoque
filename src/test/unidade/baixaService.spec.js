import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import BaixaService from '../../services/baixaService.js';

// Mock do repositório
const BaixaRepository = {
  getAllBaixas: jest.fn(),
  getBaixaById: jest.fn(),
  createBaixa: jest.fn(),
  updateBaixa: jest.fn(),
  deleteBaixa: jest.fn(),
  getBaixasPorPeriodo: jest.fn(),
  getRelatorioBaixas: jest.fn()
};

// Mock manual do módulo
jest.doMock('../../repository/baixaRepository.js', () => BaixaRepository);

describe('BaixaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn(); // Mock console.log
  });

  describe('listarBaixas', () => {
    test('should return formatted baixas with pagination', async () => {
      const filters = { data_inicial: '2024-01-01', data_final: '2024-12-31' };
      const pagination = { page: 1, limit: 10 };
      
      const mockResult = {
        data: [
          {
            id: 1,
            roupa_id: 1,
            quantidade: 2,
            motivo: 'Venda',
            data_baixa: new Date('2024-01-15'),
            observacoes: 'Venda normal',
            usuario_id: 1,
            roupa: {
              id: 1,
              nome: 'Camisa Polo',
              tipo: 'Camisa',
              cor: 'Azul'
            }
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      BaixaRepository.getAllBaixas.mockResolvedValue(mockResult);

      const result = await BaixaService.listarBaixas(filters, pagination);

      expect(BaixaRepository.getAllBaixas).toHaveBeenCalledWith(filters, pagination);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('id', 1);
      expect(result.data[0]).toHaveProperty('roupa_id', 1);
      expect(result.data[0]).toHaveProperty('quantidade', 2);
    });

    test('should return empty result when no data found', async () => {
      const filters = {};
      const pagination = { page: 1, limit: 10 };

      BaixaRepository.getAllBaixas.mockResolvedValue(null);

      const result = await BaixaService.listarBaixas(filters, pagination);

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      });
    });

    test('should handle empty data array', async () => {
      const filters = {};
      const pagination = { page: 1, limit: 10 };

      const mockResult = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        }
      };

      BaixaRepository.getAllBaixas.mockResolvedValue(mockResult);

      const result = await BaixaService.listarBaixas(filters, pagination);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('obterBaixaPorId', () => {
    test('should return baixa by id', async () => {
      const baixaId = 1;
      const mockBaixa = {
        id: 1,
        roupa_id: 1,
        quantidade: 3,
        motivo: 'Defeito',
        data_baixa: new Date(),
        observacoes: 'Item danificado',
        usuario_id: 1,
        roupa: {
          id: 1,
          nome: 'Camisa Polo',
          tipo: 'Camisa'
        }
      };

      BaixaRepository.getBaixaById.mockResolvedValue(mockBaixa);

      const result = await BaixaService.obterBaixaPorId(baixaId);

      expect(BaixaRepository.getBaixaById).toHaveBeenCalledWith(baixaId);
      expect(result).toEqual(mockBaixa);
    });

    test('should return null for non-existent baixa', async () => {
      const baixaId = 999;

      BaixaRepository.getBaixaById.mockResolvedValue(null);

      const result = await BaixaService.obterBaixaPorId(baixaId);

      expect(result).toBeNull();
    });
  });

  describe('criarBaixa', () => {
    test('should create new baixa successfully', async () => {
      const baixaData = {
        roupa_id: 1,
        quantidade: 5,
        motivo: 'Venda',
        observacoes: 'Venda online',
        usuario_id: 1
      };

      const mockCreatedBaixa = {
        id: 1,
        ...baixaData,
        data_baixa: new Date()
      };

      BaixaRepository.createBaixa.mockResolvedValue(mockCreatedBaixa);

      const result = await BaixaService.criarBaixa(baixaData);

      expect(BaixaRepository.createBaixa).toHaveBeenCalledWith(baixaData);
      expect(result).toEqual(mockCreatedBaixa);
    });

    test('should handle database error during creation', async () => {
      const baixaData = {
        roupa_id: 1,
        quantidade: 5,
        motivo: 'Venda'
      };

      BaixaRepository.createBaixa.mockRejectedValue(new Error('Database error'));

      await expect(BaixaService.criarBaixa(baixaData)).rejects.toThrow('Database error');
    });
  });

  describe('atualizarBaixa', () => {
    test('should update baixa successfully', async () => {
      const baixaId = 1;
      const updateData = {
        quantidade: 10,
        observacoes: 'Quantidade atualizada'
      };

      const mockUpdatedBaixa = {
        id: 1,
        roupa_id: 1,
        quantidade: 10,
        motivo: 'Venda',
        observacoes: 'Quantidade atualizada',
        data_baixa: new Date(),
        usuario_id: 1
      };

      BaixaRepository.updateBaixa.mockResolvedValue(mockUpdatedBaixa);

      const result = await BaixaService.atualizarBaixa(baixaId, updateData);

      expect(BaixaRepository.updateBaixa).toHaveBeenCalledWith(baixaId, updateData);
      expect(result).toEqual(mockUpdatedBaixa);
    });

    test('should return null for non-existent baixa', async () => {
      const baixaId = 999;
      const updateData = { quantidade: 10 };

      BaixaRepository.updateBaixa.mockResolvedValue(null);

      const result = await BaixaService.atualizarBaixa(baixaId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('excluirBaixa', () => {
    test('should delete baixa successfully', async () => {
      const baixaId = 1;
      const mockDeletedBaixa = {
        id: 1,
        roupa_id: 1,
        quantidade: 2,
        motivo: 'Venda'
      };

      BaixaRepository.deleteBaixa.mockResolvedValue(mockDeletedBaixa);

      const result = await BaixaService.excluirBaixa(baixaId);

      expect(BaixaRepository.deleteBaixa).toHaveBeenCalledWith(baixaId);
      expect(result).toEqual(mockDeletedBaixa);
    });

    test('should return null for non-existent baixa', async () => {
      const baixaId = 999;

      BaixaRepository.deleteBaixa.mockResolvedValue(null);

      const result = await BaixaService.excluirBaixa(baixaId);

      expect(result).toBeNull();
    });
  });

  describe('getBaixasPorPeriodo', () => {
    test('should return baixas for specified period', async () => {
      const dataInicial = '2024-01-01';
      const dataFinal = '2024-01-31';
      
      const mockBaixas = [
        {
          id: 1,
          roupa_id: 1,
          quantidade: 2,
          motivo: 'Venda',
          data_baixa: new Date('2024-01-15')
        },
        {
          id: 2,
          roupa_id: 2,
          quantidade: 1,
          motivo: 'Defeito',
          data_baixa: new Date('2024-01-20')
        }
      ];

      BaixaRepository.getBaixasPorPeriodo.mockResolvedValue(mockBaixas);

      const result = await BaixaService.getBaixasPorPeriodo(dataInicial, dataFinal);

      expect(BaixaRepository.getBaixasPorPeriodo).toHaveBeenCalledWith(dataInicial, dataFinal);
      expect(result).toEqual(mockBaixas);
      expect(result).toHaveLength(2);
    });
  });

  describe('getRelatorioBaixas', () => {
    test('should return baixas report', async () => {
      const filtros = {
        data_inicial: '2024-01-01',
        data_final: '2024-12-31',
        motivo: 'Venda'
      };

      const mockRelatorio = {
        baixas: [
          {
            id: 1,
            roupa_id: 1,
            quantidade: 5,
            motivo: 'Venda',
            valor_total: 250.00
          }
        ],
        resumo: {
          total_baixas: 1,
          quantidade_total: 5,
          valor_total: 250.00
        }
      };

      BaixaRepository.getRelatorioBaixas.mockResolvedValue(mockRelatorio);

      const result = await BaixaService.getRelatorioBaixas(filtros);

      expect(BaixaRepository.getRelatorioBaixas).toHaveBeenCalledWith(filtros);
      expect(result).toEqual(mockRelatorio);
      expect(result).toHaveProperty('baixas');
      expect(result).toHaveProperty('resumo');
    });
  });
});