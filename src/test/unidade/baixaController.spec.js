import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import BaixaController from '../../controllers/baixaController.js';
import BaixaService from '../../services/baixaService.js';
import BaixaSchema from '../../schemas/baixaSchema.js';

// Mock dos módulos
jest.mock('../../services/baixaService.js');
jest.mock('../../schemas/baixaSchema.js');

describe('BaixaController', () => {
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
    console.log = jest.fn(); // Mock console.log
  });

  describe('listarBaixas', () => {
    test('should list baixas successfully', async () => {
      const queryParams = {
        page: '1',
        limit: '10',
        data_inicio: '2023-01-01',
        data_fim: '2023-12-31',
        motivo: 'defeito',
        roupa_id: '1'
      };

      const serviceResult = {
        data: [
          { id: 1, motivo: 'defeito', quantidade: 5 }
        ],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.query = queryParams;
      BaixaService.listarBaixas.mockResolvedValue(serviceResult);

      await BaixaController.listarBaixas(req, res);

      expect(BaixaService.listarBaixas).toHaveBeenCalledWith(
        {
          data_inicio: '2023-01-01',
          data_fim: '2023-12-31',
          motivo: 'defeito',
          roupa_id: 1
        },
        { page: 1, limit: 10 }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixas listadas com sucesso',
        data: serviceResult
      });
    });

    test('should handle service errors', async () => {
      req.query = { page: '1', limit: '10' };
      BaixaService.listarBaixas.mockRejectedValue(new Error('Database error'));

      await BaixaController.listarBaixas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });

    test('should handle empty query parameters', async () => {
      const serviceResult = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0 }
      };

      req.query = {};
      BaixaService.listarBaixas.mockResolvedValue(serviceResult);

      await BaixaController.listarBaixas(req, res);

      expect(BaixaService.listarBaixas).toHaveBeenCalledWith(
        {},
        { page: 1, limit: 10 }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixas listadas com sucesso',
        data: serviceResult
      });
    });
  });

  describe('buscarBaixa', () => {
    test('should find baixa by id successfully', async () => {
      const baixaData = { id: 1, motivo: 'defeito', quantidade: 5 };

      req.params = { id: '1' };
      BaixaService.buscarBaixaPorId.mockResolvedValue(baixaData);

      await BaixaController.buscarBaixa(req, res);

      expect(BaixaService.buscarBaixaPorId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixa encontrada',
        data: baixaData
      });
    });

    test('should handle baixa not found', async () => {
      req.params = { id: '999' };
      BaixaService.buscarBaixaPorId.mockResolvedValue(null);

      await BaixaController.buscarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Baixa não encontrada'
      });
    });

    test('should handle service errors', async () => {
      req.params = { id: '1' };
      BaixaService.buscarBaixaPorId.mockRejectedValue(new Error('Database error'));

      await BaixaController.buscarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('criarBaixa', () => {
    test('should create baixa successfully', async () => {
      const baixaData = { motivo: 'defeito', quantidade: 5, roupa_id: 1 };
      const createdBaixa = { id: 1, ...baixaData };

      req.body = baixaData;
      BaixaSchema.create = { parse: jest.fn().mockReturnValue(baixaData) };
      BaixaService.criarBaixa.mockResolvedValue(createdBaixa);

      await BaixaController.criarBaixa(req, res);

      expect(BaixaSchema.create.parse).toHaveBeenCalledWith(baixaData);
      expect(BaixaService.criarBaixa).toHaveBeenCalledWith(baixaData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixa criada com sucesso',
        data: createdBaixa
      });
    });

    test('should handle validation errors', async () => {
      const invalidData = { motivo: '' };
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['motivo'], message: 'Motivo é obrigatório' }
        ]
      };

      req.body = invalidData;
      BaixaSchema.create = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await BaixaController.criarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });

    test('should handle service errors', async () => {
      const baixaData = { motivo: 'defeito', quantidade: 5, roupa_id: 1 };

      req.body = baixaData;
      BaixaSchema.create = { parse: jest.fn().mockReturnValue(baixaData) };
      BaixaService.criarBaixa.mockRejectedValue(new Error('Database error'));

      await BaixaController.criarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('atualizarBaixa', () => {
    test('should update baixa successfully', async () => {
      const updateData = { motivo: 'defeito atualizado' };
      const updatedBaixa = { id: 1, motivo: 'defeito atualizado', quantidade: 5 };

      req.params = { id: '1' };
      req.body = updateData;
      BaixaSchema.update = { parse: jest.fn().mockReturnValue(updateData) };
      BaixaService.atualizarBaixa.mockResolvedValue(updatedBaixa);

      await BaixaController.atualizarBaixa(req, res);

      expect(BaixaSchema.update.parse).toHaveBeenCalledWith(updateData);
      expect(BaixaService.atualizarBaixa).toHaveBeenCalledWith(1, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixa atualizada com sucesso',
        data: updatedBaixa
      });
    });

    test('should handle baixa not found on update', async () => {
      const updateData = { motivo: 'defeito atualizado' };

      req.params = { id: '999' };
      req.body = updateData;
      BaixaSchema.update = { parse: jest.fn().mockReturnValue(updateData) };
      BaixaService.atualizarBaixa.mockResolvedValue(null);

      await BaixaController.atualizarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixa atualizada com sucesso',
        data: null
      });
    });

    test('should handle validation errors on update', async () => {
      const invalidData = { quantidade: -1 };
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['quantidade'], message: 'Quantidade deve ser positiva' }
        ]
      };

      req.params = { id: '1' };
      req.body = invalidData;
      BaixaSchema.update = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await BaixaController.atualizarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });
  });

  describe('deletarBaixa', () => {
    test('should delete baixa successfully', async () => {
      const deleteResult = {
        message: 'Baixa deletada com sucesso',
        itens_restaurados: [{ id: 1, quantidade: 5 }]
      };

      req.params = { id: '1' };
      BaixaService.deletarBaixa.mockResolvedValue(deleteResult);

      await BaixaController.deletarBaixa(req, res);

      expect(BaixaService.deletarBaixa).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Baixa deletada com sucesso',
        data: deleteResult.itens_restaurados
      });
    });

    test('should handle baixa not found on delete', async () => {
      req.params = { id: '999' };
      BaixaService.deletarBaixa.mockRejectedValue(new Error('Baixa não encontrada'));

      await BaixaController.deletarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Baixa não encontrada'
      });
    });

    test('should handle service errors on delete', async () => {
      req.params = { id: '1' };
      BaixaService.deletarBaixa.mockRejectedValue(new Error('Database error'));

      await BaixaController.deletarBaixa(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('adicionarItem', () => {
    test('should add item successfully', async () => {
      const itemData = { roupa_id: 1, quantidade: 10 };
      const addedItem = { id: 1, baixa_id: 1, ...itemData };

      req.params = { id: '1' };
      req.body = itemData;
      BaixaSchema.addItem = { parse: jest.fn().mockReturnValue(itemData) };
      BaixaService.adicionarItem = jest.fn().mockResolvedValue(addedItem);

      await BaixaController.adicionarItem(req, res);

      expect(BaixaSchema.addItem.parse).toHaveBeenCalledWith(itemData);
      expect(BaixaService.adicionarItem).toHaveBeenCalledWith(1, itemData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item adicionado com sucesso',
        data: addedItem
      });
    });

    test('should handle validation errors when adding item', async () => {
      const invalidData = { quantidade: -1 };
      const zodError = {
        name: 'ZodError',
        errors: [
          { path: ['quantidade'], message: 'Quantidade deve ser positiva' }
        ]
      };

      req.params = { id: '1' };
      req.body = invalidData;
      BaixaSchema.addItem = { parse: jest.fn().mockImplementation(() => { throw zodError; }) };

      await BaixaController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });
  });

  describe('listarItens', () => {
    test('should list items successfully', async () => {
      const items = [
        { id: 1, roupa_id: 1, quantidade: 10 },
        { id: 2, roupa_id: 2, quantidade: 5 }
      ];

      req.params = { id: '1' };
      BaixaService.listarItensBaixa = jest.fn().mockResolvedValue(items);

      await BaixaController.listarItens(req, res);

      expect(BaixaService.listarItensBaixa).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Itens listados com sucesso',
        data: items
      });
    });

    test('should handle service errors when listing items', async () => {
      req.params = { id: '1' };
      BaixaService.listarItensBaixa = jest.fn().mockRejectedValue(new Error('Database error'));

      await BaixaController.listarItens(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('obterEstatisticas', () => {
    test('should get statistics successfully', async () => {
      const stats = {
        total_baixas: 100,
        total_quantidade: 500,
        motivos_mais_comuns: ['defeito', 'vencido']
      };

      BaixaService.obterEstatisticas.mockResolvedValue(stats);

      await BaixaController.obterEstatisticas(req, res);

      expect(BaixaService.obterEstatisticas).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Estatísticas obtidas com sucesso',
        data: stats
      });
    });

    test('should handle service errors when getting statistics', async () => {
      BaixaService.obterEstatisticas.mockRejectedValue(new Error('Database error'));

      await BaixaController.obterEstatisticas(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('obterMotivos', () => {
    test('should get motivos successfully', async () => {
      const motivos = ['defeito', 'vencido', 'danificado'];

      BaixaService.getMotivosDisponiveis = jest.fn().mockReturnValue(motivos);

      await BaixaController.obterMotivos(req, res);

      expect(BaixaService.getMotivosDisponiveis).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Motivos disponíveis obtidos com sucesso',
        data: motivos
      });
    });

    test('should handle service errors when getting motivos', async () => {
      BaixaService.getMotivosDisponiveis = jest.fn().mockImplementation(() => { 
        throw new Error('Database error'); 
      });

      await BaixaController.obterMotivos(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('atualizarItem', () => {
    test('should update item successfully', async () => {
      const updateData = { quantidade: 15 };
      const updatedItem = { id: 1, roupa_id: 1, quantidade: 15 };

      req.params = { item_id: '1' };
      req.body = updateData;
      BaixaSchema.updateItem = { 
        parse: jest.fn().mockReturnValue(updateData) 
      };
      BaixaService.atualizarItem = jest.fn().mockResolvedValue(updatedItem);

      await BaixaController.atualizarItem(req, res);

      expect(BaixaService.atualizarItem).toHaveBeenCalledWith(1, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Item atualizado com sucesso',
        data: updatedItem
      });
    });

    test('should handle validation errors when updating item', async () => {
      const invalidData = { quantidade: -5 };
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.errors = [{ path: ['quantidade'], message: 'Quantidade deve ser positiva' }];

      req.params = { item_id: '1' };
      req.body = invalidData;
      BaixaSchema.updateItem = { 
        parse: jest.fn().mockImplementation(() => { throw zodError; }) 
      };

      await BaixaController.atualizarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        errors: zodError.errors
      });
    });

    test('should handle item not found error when updating', async () => {
      const updateData = { quantidade: 15 };
      const error = new Error('Item não encontrado');

      req.params = { item_id: '999' };
      req.body = updateData;
      BaixaSchema.updateItem = { 
        parse: jest.fn().mockReturnValue(updateData) 
      };
      BaixaService.atualizarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.atualizarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Item não encontrado'
      });
    });

    test('should handle insufficient stock error when updating', async () => {
      const updateData = { quantidade: 1000 };
      const error = new Error('Estoque insuficiente para esta operação');

      req.params = { item_id: '1' };
      req.body = updateData;
      BaixaSchema.updateItem = { 
        parse: jest.fn().mockReturnValue(updateData) 
      };
      BaixaService.atualizarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.atualizarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Estoque insuficiente para esta operação'
      });
    });

    test('should handle service errors when updating item', async () => {
      const updateData = { quantidade: 15 };
      const error = new Error('Database connection failed');

      req.params = { item_id: '1' };
      req.body = updateData;
      BaixaSchema.updateItem = { 
        parse: jest.fn().mockReturnValue(updateData) 
      };
      BaixaService.atualizarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.atualizarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed'
      });
    });
  });

  describe('removerItem', () => {
    test('should remove item successfully', async () => {
      const resultado = { 
        message: 'Item removido com sucesso', 
        item_restaurado: { id: 1, roupa_id: 1, quantidade: 10 } 
      };

      req.params = { item_id: '1' };
      BaixaService.removerItem = jest.fn().mockResolvedValue(resultado);

      await BaixaController.removerItem(req, res);

      expect(BaixaService.removerItem).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: resultado.message,
        data: resultado.item_restaurado
      });
    });

    test('should handle item not found when removing', async () => {
      const error = new Error('Item não encontrado');

      req.params = { item_id: '999' };
      BaixaService.removerItem = jest.fn().mockRejectedValue(error);

      await BaixaController.removerItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Item não encontrado'
      });
    });

    test('should handle service errors when removing item', async () => {
      const error = new Error('Database error');

      req.params = { item_id: '1' };
      BaixaService.removerItem = jest.fn().mockRejectedValue(error);

      await BaixaController.removerItem(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database error'
      });
    });
  });

  describe('gerarRelatorio', () => {
    test('should generate report successfully', async () => {
      const relatorio = {
        periodo: { inicio: '2024-01-01', fim: '2024-01-31' },
        total_baixas: 10,
        itens_detalhes: []
      };

      req.query = { data_inicio: '2024-01-01', data_fim: '2024-01-31' };
      BaixaService.relatorioBaixasPeriodo = jest.fn().mockResolvedValue(relatorio);

      await BaixaController.gerarRelatorio(req, res);

      expect(BaixaService.relatorioBaixasPeriodo).toHaveBeenCalledWith('2024-01-01', '2024-01-31');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Relatório gerado com sucesso',
        data: relatorio
      });
    });

    test('should handle missing data_inicio parameter', async () => {
      req.query = { data_fim: '2024-01-31' };

      await BaixaController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'É necessário informar data_inicio e data_fim'
      });
    });

    test('should handle missing data_fim parameter', async () => {
      req.query = { data_inicio: '2024-01-01' };

      await BaixaController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'É necessário informar data_inicio e data_fim'
      });
    });

    test('should handle missing both date parameters', async () => {
      req.query = {};

      await BaixaController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'É necessário informar data_inicio e data_fim'
      });
    });

    test('should handle service errors when generating report', async () => {
      const error = new Error('Database connection failed');

      req.query = { data_inicio: '2024-01-01', data_fim: '2024-01-31' };
      BaixaService.relatorioBaixasPeriodo = jest.fn().mockRejectedValue(error);

      await BaixaController.gerarRelatorio(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Database connection failed'
      });
    });
  });

  describe('adicionarItem - additional error cases', () => {
    test('should handle "não encontrada" error in adicionarItem', async () => {
      const itemData = { roupa_id: 1, quantidade: 10, motivo: 'defeito' };
      const error = new Error('Roupa não encontrada');

      req.params = { id: '1' };
      req.body = itemData;
      BaixaSchema.addItem = { 
        parse: jest.fn().mockReturnValue(itemData) 
      };
      BaixaService.adicionarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Roupa não encontrada'
      });
    });

    test('should handle "não encontrado" error in adicionarItem', async () => {
      const itemData = { roupa_id: 1, quantidade: 10, motivo: 'defeito' };
      const error = new Error('Produto não encontrado');

      req.params = { id: '1' };
      req.body = itemData;
      BaixaSchema.addItem = { 
        parse: jest.fn().mockReturnValue(itemData) 
      };
      BaixaService.adicionarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Produto não encontrado'
      });
    });

    test('should handle "Estoque insuficiente" error in adicionarItem', async () => {
      const itemData = { roupa_id: 1, quantidade: 1000, motivo: 'defeito' };
      const error = new Error('Estoque insuficiente para realizar baixa');

      req.params = { id: '1' };
      req.body = itemData;
      BaixaSchema.addItem = { 
        parse: jest.fn().mockReturnValue(itemData) 
      };
      BaixaService.adicionarItem = jest.fn().mockRejectedValue(error);

      await BaixaController.adicionarItem(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Estoque insuficiente para realizar baixa'
      });
    });
  });
});
