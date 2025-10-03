import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import ComprasController from '../../controllers/comprasController.js';
import ComprasService from '../../services/comprasService.js';
import ComprasSchema from '../../schemas/comprasSchema.js';

// Mock dos módulos
jest.mock('../../services/comprasService.js');
jest.mock('../../schemas/comprasSchema.js');

describe('ComprasController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('listarCompras', () => {
    test('should list compras successfully', async () => {
      const queryData = {
        page: 1,
        limit: 10,
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
        fornecedor: 'Fornecedor A',
        valor_min: 100,
        valor_max: 1000
      };
      const serviceResult = {
        data: [{
          id: 1,
          data_compra: '2024-10-01',
          valor_total: 500,
          fornecedor: 'Fornecedor A'
        }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.query = queryData;
      ComprasService.listarCompras.mockResolvedValue(serviceResult);

      await ComprasController.listarCompras(req, res);

      expect(ComprasService.listarCompras).toHaveBeenCalledWith(
        {
          data_inicio: '2024-01-01',
          data_fim: '2024-12-31',
          fornecedor: 'Fornecedor A',
          valor_min: 100,
          valor_max: 1000
        },
        { page: 1, limit: 10 }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Compras listadas com sucesso',
        data: serviceResult
      });
    });

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      req.query = { page: 1, limit: 10 };

      ComprasService.listarCompras.mockRejectedValue(error);

      await ComprasController.listarCompras(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('buscarCompra', () => {
    test('should find compra by id successfully', async () => {
      const compraData = {
        id: 1,
        data_compra: '2024-10-01',
        valor_total: 500,
        fornecedor: 'Fornecedor A'
      };
      req.params = { id: '1' };

      ComprasService.buscarCompraPorId.mockResolvedValue(compraData);

      await ComprasController.buscarCompra(req, res);

      expect(ComprasService.buscarCompraPorId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Compra encontrada',
        data: compraData
      });
    });

    test('should handle compra not found', async () => {
      req.params = { id: '999' };

      ComprasService.buscarCompraPorId.mockResolvedValue(null);

      await ComprasController.buscarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Compra não encontrada'
      });
    });

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      req.params = { id: '1' };

      ComprasService.buscarCompraPorId.mockRejectedValue(error);

      await ComprasController.buscarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('criarCompra', () => {
    test('should create compra successfully', async () => {
      const compraData = {
        fornecedor: 'Fornecedor A',
        valor_total: 500,
        itens: [{ produto_id: 1, quantidade: 2, preco: 250 }]
      };
      const createdCompra = { id: 1, ...compraData };

      req.body = compraData;
      ComprasSchema.create = {
        parse: jest.fn().mockReturnValue(compraData)
      };
      ComprasService.criarCompra.mockResolvedValue(createdCompra);

      await ComprasController.criarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Compra criada com sucesso',
        data: createdCompra
      });
    });

    test('should handle validation errors', async () => {
      req.body = { fornecedor: 'A' };

      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.errors = [{
        path: ['fornecedor'],
        message: 'Fornecedor deve ter pelo menos 2 caracteres'
      }];

      ComprasSchema.create = {
        parse: jest.fn().mockImplementation(() => {
          throw zodError;
        })
      };

      await ComprasController.criarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      const compraData = { fornecedor: 'Fornecedor A', valor_total: 500 };

      req.body = compraData;
      ComprasSchema.create = {
        parse: jest.fn().mockReturnValue(compraData)
      };
      ComprasService.criarCompra.mockRejectedValue(error);

      await ComprasController.criarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('atualizarCompra', () => {
    test('should update compra successfully', async () => {
      const updateData = { fornecedor: 'Fornecedor B' };
      const updatedCompra = { id: 1, fornecedor: 'Fornecedor B', valor_total: 500 };

      req.params = { id: '1' };
      req.body = updateData;

      ComprasSchema.update = {
        parse: jest.fn().mockReturnValue(updateData)
      };
      ComprasService.atualizarCompra.mockResolvedValue(updatedCompra);

      await ComprasController.atualizarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Compra atualizada com sucesso',
        data: updatedCompra
      });
    });

    test('should handle compra not found on update', async () => {
      req.params = { id: '999' };
      req.body = { fornecedor: 'Fornecedor B' };

      ComprasSchema.update = {
        parse: jest.fn().mockReturnValue({ fornecedor: 'Fornecedor B' })
      };
      ComprasService.atualizarCompra.mockRejectedValue(new Error('Compra não encontrada'));

      await ComprasController.atualizarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Compra não encontrada'
      });
    });

    test('should handle validation errors', async () => {
      req.params = { id: '1' };
      req.body = { fornecedor: 'A' };

      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.errors = [{
        path: ['fornecedor'],
        message: 'Fornecedor deve ter pelo menos 2 caracteres'
      }];

      ComprasSchema.update = {
        parse: jest.fn().mockImplementation(() => {
          throw zodError;
        })
      };

      await ComprasController.atualizarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });
  });

  describe('deletarCompra', () => {
    test('should delete compra successfully', async () => {
      req.params = { id: '1' };

      ComprasService.deletarCompra.mockResolvedValue({ message: 'Compra removida com sucesso' });

      await ComprasController.deletarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Compra removida com sucesso'
      });
    });

    test('should handle compra not found on delete', async () => {
      req.params = { id: '999' };

      ComprasService.deletarCompra.mockRejectedValue(new Error('Compra não encontrada'));

      await ComprasController.deletarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Compra não encontrada'
      });
    });

    test('should handle service errors on delete', async () => {
      const error = new Error('Database error');
      req.params = { id: '1' };

      ComprasService.deletarCompra.mockRejectedValue(error);

      await ComprasController.deletarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('adicionarItem', () => {
    test('should add item successfully', async () => {
      const compraId = 1;
      const itemData = { item_id: 1, quantidade: 5, preco_unitario: 10.50 };
      const novoItem = { id: 1, ...itemData, valor_total: 52.50 };

      req.params = { id: compraId.toString() };
      req.body = itemData;
      ComprasSchema.addItem = {
        parse: jest.fn().mockReturnValue(itemData)
      };
      ComprasService.adicionarItem.mockResolvedValue(novoItem);

      await ComprasController.adicionarItem(req, res);

      expect(ComprasSchema.addItem.parse).toHaveBeenCalledWith(itemData);
      expect(ComprasService.adicionarItem).toHaveBeenCalledWith(compraId, itemData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item adicionado com sucesso',
        data: novoItem
      });
    });

    test('should handle validation errors when adding item', async () => {
      const compraId = 1;
      const itemData = { item_id: 'invalid', quantidade: -1 };
      const zodError = {
        name: 'ZodError',
        errors: [{ path: ['item_id'], message: 'Expected number, received string' }]
      };

      req.params = { id: compraId.toString() };
      req.body = itemData;
      ComprasSchema.addItem = {
        parse: jest.fn().mockImplementation(() => { throw zodError; })
      };

      await ComprasController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });

    test('should handle not found errors when adding item', async () => {
      const compraId = 1;
      const itemData = { item_id: 999, quantidade: 5, preco_unitario: 10.50 };
      const error = new Error('Compra não encontrada');

      req.params = { id: compraId.toString() };
      req.body = itemData;
      ComprasSchema.addItem = {
        parse: jest.fn().mockReturnValue(itemData)
      };
      ComprasService.adicionarItem.mockRejectedValue(error);

      await ComprasController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Compra não encontrada'
      });
    });

    test('should handle generic errors when adding item', async () => {
      const compraId = 1;
      const itemData = { item_id: 1, quantidade: 5, preco_unitario: 10.50 };
      const error = new Error('Database connection failed');

      req.params = { id: compraId.toString() };
      req.body = itemData;
      ComprasSchema.addItem = {
        parse: jest.fn().mockReturnValue(itemData)
      };
      ComprasService.adicionarItem.mockRejectedValue(error);

      await ComprasController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed'
      });
    });
  });

  describe('listarItens', () => {
    test('should list items successfully', async () => {
      const compraId = 1;
      const itens = [{ id: 1, item_id: 1, quantidade: 5, preco_unitario: 10.50 }];

      req.params = { id: compraId.toString() };
      ComprasService.listarItensCompra.mockResolvedValue(itens);

      await ComprasController.listarItens(req, res);

      expect(ComprasService.listarItensCompra).toHaveBeenCalledWith(compraId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Itens listados com sucesso',
        data: itens
      });
    });

    test('should handle service errors when listing items', async () => {
      const compraId = 1;
      const error = new Error('Database error');

      req.params = { id: compraId.toString() };
      ComprasService.listarItensCompra.mockRejectedValue(error);

      await ComprasController.listarItens(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('gerarRelatorio', () => {
    test('should generate report successfully', async () => {
      const relatorio = { compras: [], total: 0 };

      req.query = { data_inicio: '2024-01-01', data_fim: '2024-12-31' };
      ComprasService.relatorioCompasPeriodo.mockResolvedValue(relatorio);

      await ComprasController.gerarRelatorio(req, res);

      expect(ComprasService.relatorioCompasPeriodo).toHaveBeenCalledWith('2024-01-01', '2024-12-31');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: relatorio
      });
    });

    test('should handle missing data_inicio parameter', async () => {
      req.query = { data_fim: '2024-12-31' };

      await ComprasController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'É necessário informar data_inicio e data_fim'
      });
    });

    test('should handle missing data_fim parameter', async () => {
      req.query = { data_inicio: '2024-01-01' };

      await ComprasController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'É necessário informar data_inicio e data_fim'
      });
    });

    test('should handle service errors when generating report', async () => {
      const error = new Error('Database error');

      req.query = { data_inicio: '2024-01-01', data_fim: '2024-12-31' };
      ComprasService.relatorioCompasPeriodo.mockRejectedValue(error);

      await ComprasController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('obterEstatisticas', () => {
    test('should get statistics successfully', async () => {
      const estatisticas = { total_compras: 10, valor_total: 5000 };

      req.query = { data_inicio: '2024-01-01', data_fim: '2024-12-31' };
      ComprasService.obterEstatisticas.mockResolvedValue(estatisticas);

      await ComprasController.obterEstatisticas(req, res);

      expect(ComprasService.obterEstatisticas).toHaveBeenCalledWith({
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: estatisticas
      });
    });

    test('should handle service errors when getting statistics', async () => {
      const error = new Error('Database error');

      req.query = {};
      ComprasService.obterEstatisticas.mockRejectedValue(error);

      await ComprasController.obterEstatisticas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('atualizarCompra - additional error cases', () => {
    test('should handle generic error in atualizarCompra (line 130)', async () => {
      const compraId = 1;
      const updateData = { fornecedor: 'Novo Fornecedor' };
      const error = new Error('Connection timeout');

      req.params = { id: compraId.toString() };
      req.body = updateData;
      ComprasSchema.update = {
        parse: jest.fn().mockReturnValue(updateData)
      };
      ComprasService.atualizarCompra.mockRejectedValue(error);

      await ComprasController.atualizarCompra(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Connection timeout'
      });
    });
  });
});
