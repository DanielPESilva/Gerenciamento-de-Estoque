import { describe, expect, jest, test, beforeEach, afterEach } from '@jest/globals';
import * as ClientesController from '../../controllers/clientesController.js';
import ClientesService from '../../services/clientesService.js';
import ClientesSchema from '../../schemas/clientesSchema.js';
import { sendResponse, sendError } from '../../utils/messages.js';

// Mock dos módulos
jest.mock('../../services/clientesService.js');
jest.mock('../../schemas/clientesSchema.js');
jest.mock('../../utils/messages.js');

describe('ClientesController', () => {
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
    
    // Mock do console.error para evitar logs nos testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('getAll', () => {
    test('should get all clients successfully', async () => {
      const queryData = { page: 1, limit: 10, nome: 'João' };
      const serviceResult = {
        data: [{ id: 1, nome: 'João Silva', email: 'joao@teste.com' }],
        pagination: { page: 1, limit: 10, total: 1 }
      };

      req.query = queryData;
      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: queryData
        })
      };
      ClientesService.getAllClientes.mockResolvedValue(serviceResult);

      await ClientesController.getAll(req, res);

      expect(ClientesService.getAllClientes).toHaveBeenCalledWith({nome: 'João'}, { page: 1, limit: 10 });
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: serviceResult.data,
        pagination: serviceResult.pagination
      });
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

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      req.query = { page: 1, limit: 10 };

      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { page: 1, limit: 10 } })
      };
      ClientesService.getAllClientes.mockRejectedValue(error);

      await ClientesController.getAll(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao buscar clientes:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('getById', () => {
    test('should get client by id successfully', async () => {
      const clientData = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      req.params = { id: '1' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(clientData);

      await ClientesController.getById(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: clientData });
    });

    test('should handle client not found', async () => {
      req.params = { id: '999' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });

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
      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('create', () => {
    test('should create client successfully', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901',
        telefone: '11999999999',
        endereco: 'Rua A, 123'
      };
      const createdClient = { id: 1, ...clientData };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(null);
      ClientesService.createCliente.mockResolvedValue(createdClient);

      await ClientesController.create(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 201, {
        data: createdClient,
        message: "Cliente criado com sucesso"
      });
    });

    test('should handle validation errors', async () => {
      req.body = { nome: 'A' };

      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['nome'],
              message: 'Nome deve ter pelo menos 2 caracteres'
            }]
          }
        })
      };

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'nome',
        message: 'Nome deve ter pelo menos 2 caracteres'
      }]);
    });

    test('should handle duplicate email error', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com'
      };
      const existingClient = { id: 2, email: 'joao@teste.com' };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(existingClient);

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: "Email já está sendo usado por outro cliente",
        field: "email"
      });
    });

    test('should handle duplicate CPF error', async () => {
      const clientData = {
        nome: 'João Silva',
        cpf: '12345678901'
      };
      const existingClient = { id: 2, cpf: '12345678901' };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(existingClient);

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: "CPF já está sendo usado por outro cliente",
        field: "cpf"
      });
    });

    test('should handle service errors', async () => {
      const error = new Error('Database error');
      const clientData = { nome: 'João Silva' };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: clientData })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(null);
      ClientesService.createCliente.mockRejectedValue(error);

      await ClientesController.create(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao criar cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('update', () => {
    test('should update client successfully', async () => {
      const updateData = { nome: 'João Silva Updated' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const updatedClient = { id: 1, nome: 'João Silva Updated', email: 'joao@teste.com' };

      req.params = { id: '1' };
      req.body = updateData;
      
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: "Cliente atualizado com sucesso"
      });
    });

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
      req.body = { nome: 'A' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{
              path: ['nome'],
              message: 'Nome deve ter pelo menos 2 caracteres'
            }]
          }
        })
      };

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        field: 'nome',
        message: 'Nome deve ter pelo menos 2 caracteres'
      }]);
    });

    test('should handle client not found on update', async () => {
      req.params = { id: '999' };
      req.body = { nome: 'João Silva' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { nome: 'João Silva' } })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });

    test('should handle duplicate email on update', async () => {
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const anotherClient = { id: 2, email: 'novo@teste.com' };
      const updateData = { email: 'novo@teste.com' };

      req.params = { id: '1' };
      req.body = updateData;

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.getClienteByEmail.mockResolvedValue(anotherClient);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: "Email já está sendo usado por outro cliente",
        field: "email"
      });
    });

    test('should handle duplicate CPF on update', async () => {
      const existingClient = { id: 1, nome: 'João Silva', cpf: '12345678901' };
      const anotherClient = { id: 2, cpf: '98765432109' };
      const updateData = { cpf: '98765432109' };

      req.params = { id: '1' };
      req.body = updateData;

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(anotherClient);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: "CPF já está sendo usado por outro cliente",
        field: "cpf"
      });
    });

    test('should handle empty string fields conversion to null', async () => {
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const updateData = { telefone: '', endereco: '' };
      const expectedData = { telefone: null, endereco: null };
      const updatedClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com', telefone: null, endereco: null };

      req.params = { id: '1' };
      req.body = updateData;

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: updateData })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(ClientesService.updateCliente).toHaveBeenCalledWith(1, expectedData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: "Cliente atualizado com sucesso"
      });
    });

    test('should handle service errors on update', async () => {
      const error = new Error('Database error');
      const existingClient = { id: 1, nome: 'João Silva' };
      const updateData = { nome: 'João Updated' };

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
      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });

  describe('remove', () => {
    test('should remove client successfully', async () => {
      const existingClient = { id: 1, nome: 'João Silva' };
      req.params = { id: '1' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockResolvedValue(true);

      await ClientesController.remove(req, res);

      expect(sendResponse).toHaveBeenCalledWith(res, 204, {
        message: "Cliente removido com sucesso"
      });
    });

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

    test('should handle client not found on delete', async () => {
      req.params = { id: '999' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 999 } })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: "Cliente não encontrado com o ID informado",
        field: "id"
      });
    });

    test('should handle foreign key constraint error', async () => {
      const existingClient = { id: 1, nome: 'João Silva' };
      const error = { code: 'P2003' };
      req.params = { id: '1' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: "Não é possível remover cliente que possui vendas ou outros registros associados",
        field: "relacionamentos"
      });
    });

    test('should handle general service errors on delete', async () => {
      const existingClient = { id: 1, nome: 'João Silva' };
      const error = new Error('Database error');
      req.params = { id: '1' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({ success: true, data: { id: 1 } })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(console.error).toHaveBeenCalledWith('Erro ao remover cliente:', error);
      expect(sendError).toHaveBeenCalledWith(res, 500, "Erro interno do servidor");
    });
  });
});
