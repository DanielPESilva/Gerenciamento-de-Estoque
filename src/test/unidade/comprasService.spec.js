import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import ComprasService from '../../services/comprasService.js';

// Mock do repositório
const ComprasRepository = {
  getAllCompras: jest.fn(),
  getCompraById: jest.fn(),
  createCompra: jest.fn(),
  updateCompra: jest.fn(),
  deleteCompra: jest.fn(),
  getComprasPorPeriodo: jest.fn(),
  getRelatorioCompras: jest.fn()
};

// Mock manual do módulo
jest.doMock('../../repository/comprasRepository.js', () => ComprasRepository);

describe('ComprasService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listarCompras', () => {
    test('should return formatted compras with totals and pagination', async () => {
      const filters = { data_inicial: '2024-01-01', data_final: '2024-12-31' };
      const pagination = { page: 1, limit: 10 };
      
      const mockResult = {
        data: [
          {
            id: 1,
            fornecedor: 'Fornecedor Teste',
            data_compra: new Date('2024-01-15'),
            status: 'finalizada',
            observacoes: 'Compra normal',
            valor_total: 500.00,
            ComprasItens: [
              {
                id: 1,
                quatidade: 5,
                valor_peça: 50.00,
                Roupa: {
                  id: 1,
                  nome: 'Camisa Polo',
                  categoria: 'Camisa',
                  marca: 'Nike'
                }
              },
              {
                id: 2,
                quatidade: 3,
                valor_peça: 100.00,
                Roupa: {
                  id: 2,
                  nome: 'Calça Jeans',
                  categoria: 'Calça',
                  marca: 'Levis'
                }
              }
            ]
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1
        }
      };

      ComprasRepository.getAllCompras.mockResolvedValue(mockResult);

      const result = await ComprasService.listarCompras(filters, pagination);

      expect(ComprasRepository.getAllCompras).toHaveBeenCalledWith(filters, pagination);
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.data).toHaveLength(1);
      
      const compra = result.data[0];
      expect(compra).toHaveProperty('id', 1);
      expect(compra).toHaveProperty('total_itens', 8); // 5 + 3
      expect(compra).toHaveProperty('valor_total_itens', 550); // (5*50) + (3*100)
      expect(compra).toHaveProperty('itens');
      expect(compra.itens).toHaveLength(2);
      
      expect(compra.itens[0]).toHaveProperty('quantidade', 5);
      expect(compra.itens[0]).toHaveProperty('valor_unitario', 50.00);
      expect(compra.itens[0]).toHaveProperty('valor_total', 250.00);
    });

    test('should handle empty compras result', async () => {
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

      ComprasRepository.getAllCompras.mockResolvedValue(mockResult);

      const result = await ComprasService.listarCompras(filters, pagination);

      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    test('should handle database error', async () => {
      const filters = {};
      const pagination = { page: 1, limit: 10 };

      ComprasRepository.getAllCompras.mockRejectedValue(new Error('Database error'));

      await expect(ComprasService.listarCompras(filters, pagination)).rejects.toThrow('Database error');
    });
  });

  describe('obterCompraPorId', () => {
    test('should return compra by id with formatted data', async () => {
      const compraId = 1;
      const mockCompra = {
        id: 1,
        fornecedor: 'Fornecedor ABC',
        data_compra: new Date('2024-01-15'),
        status: 'pendente',
        valor_total: 300.00,
        ComprasItens: [
          {
            id: 1,
            quatidade: 2,
            valor_peça: 75.00,
            Roupa: {
              id: 1,
              nome: 'Camiseta',
              categoria: 'Camisa',
              marca: 'Adidas'
            }
          }
        ]
      };

      ComprasRepository.getCompraById.mockResolvedValue(mockCompra);

      const result = await ComprasService.obterCompraPorId(compraId);

      expect(ComprasRepository.getCompraById).toHaveBeenCalledWith(compraId);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('total_itens', 2);
      expect(result).toHaveProperty('valor_total_itens', 150);
      expect(result).toHaveProperty('itens');
      expect(result.itens).toHaveLength(1);
    });

    test('should return null for non-existent compra', async () => {
      const compraId = 999;

      ComprasRepository.getCompraById.mockResolvedValue(null);

      const result = await ComprasService.obterCompraPorId(compraId);

      expect(result).toBeNull();
    });
  });

  describe('criarCompra', () => {
    test('should create new compra successfully', async () => {
      const compraData = {
        fornecedor: 'Novo Fornecedor',
        data_compra: '2024-01-20',
        status: 'pendente',
        observacoes: 'Nova compra',
        itens: [
          {
            roupa_id: 1,
            quantidade: 10,
            valor_unitario: 45.00
          }
        ]
      };

      const mockCreatedCompra = {
        id: 1,
        fornecedor: 'Novo Fornecedor',
        data_compra: new Date('2024-01-20'),
        status: 'pendente',
        observacoes: 'Nova compra',
        valor_total: 450.00,
        ComprasItens: [
          {
            id: 1,
            quatidade: 10,
            valor_peça: 45.00,
            Roupa: {
              id: 1,
              nome: 'Produto Teste',
              categoria: 'Teste',
              marca: 'Marca Teste'
            }
          }
        ]
      };

      ComprasRepository.createCompra.mockResolvedValue(mockCreatedCompra);

      const result = await ComprasService.criarCompra(compraData);

      expect(ComprasRepository.createCompra).toHaveBeenCalledWith(compraData);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('total_itens', 10);
      expect(result).toHaveProperty('valor_total_itens', 450);
    });

    test('should handle validation error during creation', async () => {
      const compraData = {
        fornecedor: '',
        itens: []
      };

      ComprasRepository.createCompra.mockRejectedValue(new Error('Dados inválidos'));

      await expect(ComprasService.criarCompra(compraData)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('atualizarCompra', () => {
    test('should update compra successfully', async () => {
      const compraId = 1;
      const updateData = {
        status: 'finalizada',
        observacoes: 'Compra finalizada'
      };

      const mockUpdatedCompra = {
        id: 1,
        fornecedor: 'Fornecedor ABC',
        status: 'finalizada',
        observacoes: 'Compra finalizada',
        data_compra: new Date(),
        valor_total: 200.00,
        ComprasItens: [
          {
            id: 1,
            quatidade: 4,
            valor_peça: 50.00,
            Roupa: {
              id: 1,
              nome: 'Produto',
              categoria: 'Categoria',
              marca: 'Marca'
            }
          }
        ]
      };

      ComprasRepository.updateCompra.mockResolvedValue(mockUpdatedCompra);

      const result = await ComprasService.atualizarCompra(compraId, updateData);

      expect(ComprasRepository.updateCompra).toHaveBeenCalledWith(compraId, updateData);
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('status', 'finalizada');
      expect(result).toHaveProperty('total_itens', 4);
      expect(result).toHaveProperty('valor_total_itens', 200);
    });

    test('should return null for non-existent compra', async () => {
      const compraId = 999;
      const updateData = { status: 'finalizada' };

      ComprasRepository.updateCompra.mockResolvedValue(null);

      const result = await ComprasService.atualizarCompra(compraId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('excluirCompra', () => {
    test('should delete compra successfully', async () => {
      const compraId = 1;
      const mockDeletedCompra = {
        id: 1,
        fornecedor: 'Fornecedor ABC',
        status: 'cancelada'
      };

      ComprasRepository.deleteCompra.mockResolvedValue(mockDeletedCompra);

      const result = await ComprasService.excluirCompra(compraId);

      expect(ComprasRepository.deleteCompra).toHaveBeenCalledWith(compraId);
      expect(result).toEqual(mockDeletedCompra);
    });

    test('should return null for non-existent compra', async () => {
      const compraId = 999;

      ComprasRepository.deleteCompra.mockResolvedValue(null);

      const result = await ComprasService.excluirCompra(compraId);

      expect(result).toBeNull();
    });
  });

  describe('getComprasPorPeriodo', () => {
    test('should return compras for specified period', async () => {
      const dataInicial = '2024-01-01';
      const dataFinal = '2024-01-31';
      
      const mockCompras = [
        {
          id: 1,
          fornecedor: 'Fornecedor A',
          data_compra: new Date('2024-01-15'),
          valor_total: 300.00
        },
        {
          id: 2,
          fornecedor: 'Fornecedor B',
          data_compra: new Date('2024-01-20'),
          valor_total: 150.00
        }
      ];

      ComprasRepository.getComprasPorPeriodo.mockResolvedValue(mockCompras);

      const result = await ComprasService.getComprasPorPeriodo(dataInicial, dataFinal);

      expect(ComprasRepository.getComprasPorPeriodo).toHaveBeenCalledWith(dataInicial, dataFinal);
      expect(result).toEqual(mockCompras);
      expect(result).toHaveLength(2);
    });
  });

  describe('getRelatorioCompras', () => {
    test('should return compras report with summary', async () => {
      const filtros = {
        data_inicial: '2024-01-01',
        data_final: '2024-12-31',
        fornecedor: 'Fornecedor ABC'
      };

      const mockRelatorio = {
        compras: [
          {
            id: 1,
            fornecedor: 'Fornecedor ABC',
            data_compra: new Date('2024-01-15'),
            valor_total: 500.00,
            status: 'finalizada'
          }
        ],
        resumo: {
          total_compras: 1,
          valor_total: 500.00,
          valor_medio: 500.00,
          compras_finalizadas: 1,
          compras_pendentes: 0
        }
      };

      ComprasRepository.getRelatorioCompras.mockResolvedValue(mockRelatorio);

      const result = await ComprasService.getRelatorioCompras(filtros);

      expect(ComprasRepository.getRelatorioCompras).toHaveBeenCalledWith(filtros);
      expect(result).toEqual(mockRelatorio);
      expect(result).toHaveProperty('compras');
      expect(result).toHaveProperty('resumo');
      expect(result.resumo).toHaveProperty('total_compras', 1);
      expect(result.resumo).toHaveProperty('valor_total', 500.00);
    });
  });
});