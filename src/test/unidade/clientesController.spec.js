import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import * as ClientesController from '../../controllers/clientesController.js';
import ClientesService from '../../services/clientesService.js';
import ClientesSchema from '../../schemas/clientesSchema.js';
import { sendResponse, sendError } from '../../utils/messages.js';

jest.mock('../../services/clientesService.js');
jest.mock('../../schemas/clientesSchema.js');
jest.mock('../../utils/messages.js');

describe('ClientesController', () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getAll', () => {
    test('should handle service errors', async () => {
      const error = new Error('Database error');
      req.query = { page: 1, limit: 10 };

      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { page: 1, limit: 10 } })
      };
      ClientesService.getAllClientes.mockRejectedValue(error);

      await ClientesController.getAll(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao buscar clientes:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });

    test('should handle validation errors', async () => {
      const invalidQuery = { page: 'invalid' };
      req.query = invalidQuery;

      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['page'],
              message: 'Expected number, received string'
            }]
          }
        })
      };

      await ClientesController.getAll(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'page',
        message: 'Expected number, received string'
      }]);
    });
  });

  describe('getById', () => {
    test('should handle validation errors', async () => {
      req.params = { id: 'invalid' };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['id'],
              message: 'Expected number, received string'
            }]
          }
        })
      };

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'id',
        message: 'Expected number, received string'
      }]);
    });

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      req.params = { id: '1' };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockRejectedValue(error);

      await ClientesController.getById(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao buscar cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('create', () => {
    test('should handle validation errors', async () => {
      const invalidData = { nome: '', email: 'invalid-email' };
      req.body = invalidData;

      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [
              { path: ['nome'], message: 'Nome é obrigatório' },
              { path: ['email'], message: 'Email inválido' }
            ]
          }
        })
      };

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { field: 'nome', message: 'Nome é obrigatório' },
        { field: 'email', message: 'Email inválido' }
      ]);
    });

    test('should handle service errors', async () => {
      const clientData = { nome: 'João Silva', email: 'joao@teste.com', cpf: '12345678901' };
      const error = new Error('Database error');

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(null);
      ClientesService.createCliente.mockRejectedValue(error);

      await ClientesController.create(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao criar cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('update', () => {
    test('should handle validation errors on params', async () => {
      req.params = { id: 'invalid' };
      req.body = { nome: 'João Silva' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['id'],
              message: 'Expected number, received string'
            }]
          }
        })
      };

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'id',
        message: 'Expected number, received string'
      }]);
    });

    test('should handle validation errors on body', async () => {
      req.params = { id: '1' };
      req.body = { nome: '' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['nome'],
              message: 'Nome é obrigatório'
            }]
          }
        })
      };

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'nome',
        message: 'Nome é obrigatório'
      }]);
    });

    test('should handle service errors on update', async () => {
      const updateData = { nome: 'João Silva Atualizado' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const error = new Error('Database error');

      req.params = { id: '1' };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockRejectedValue(error);

      await ClientesController.update(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao atualizar cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('remove', () => {
    test('should handle validation errors on delete', async () => {
      req.params = { id: 'invalid' };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['id'],
              message: 'Expected number, received string'
            }]
          }
        })
      };

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'id',
        message: 'Expected number, received string'
      }]);
    });

    test('should handle foreign key constraint error', async () => {
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const error = new Error('Foreign key constraint');
      error.code = 'P2003';

      req.params = { id: '1' };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao remover cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'Não é possível remover cliente que possui vendas ou outros registros associados',
        field: 'relacionamentos'
      });
    });

    test('should handle general service errors on delete', async () => {
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const error = new Error('Database error');

      req.params = { id: '1' };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao remover cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });
});
