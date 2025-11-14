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

      expect(ClientesSchema.query.safeParse).toHaveBeenCalledWith(queryData);
      expect(ClientesService.getAllClientes).toHaveBeenCalledWith({ nome: 'João' }, { page: 1, limit: 10 });
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: serviceResult.data,  
        pagination: serviceResult.pagination
      });
    });

    test('should handle validation errors', async () => {
      const queryData = { page: 'invalid', limit: 10 };
      const zodError = {
        issues: [{ path: ['page'], message: 'Page must be a number' }]
      };

      req.query = queryData;
      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: zodError
        })
      };

      await ClientesController.getAll(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { field: 'page', message: 'Page must be a number' }
      ]);
    });

    test('should handle service errors', async () => {
      const queryData = { page: 1, limit: 10 };
      const error = new Error('Database connection failed');

      req.query = queryData;
      ClientesSchema.query = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: queryData
        })
      };
      ClientesService.getAllClientes.mockRejectedValue(error);

      await ClientesController.getAll(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('getById', () => {
    test('should get client by id successfully', async () => {
      const clientId = 1;
      const clientData = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(clientData);

      await ClientesController.getById(req, res);

      expect(ClientesSchema.id.safeParse).toHaveBeenCalledWith(req.params);
      expect(ClientesService.getClienteById).toHaveBeenCalledWith(clientId);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: clientData });
    });

    test('should handle client not found', async () => {
      const clientId = 999;

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: 'Cliente não encontrado com o ID informado',
        field: 'id'
      });
    });

    test('should handle validation errors', async () => {
      const invalidId = 'abc';

      req.params = { id: invalidId };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ path: ['id'], message: 'ID must be a number' }]
          }
        })
      };

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { field: 'id', message: 'ID must be a number' }
      ]);
    });

    test('should handle service errors', async () => {
      const clientId = 1;
      const error = new Error('Database error');

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockRejectedValue(error);

      await ClientesController.getById(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('create', () => {
    test('should create client successfully', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901'
      };
      const createdClient = { id: 1, ...clientData, telefone: null, endereco: null };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(null);
      ClientesService.createCliente.mockResolvedValue(createdClient);

      await ClientesController.create(req, res);

      expect(ClientesSchema.create.safeParse).toHaveBeenCalledWith(clientData);
      expect(ClientesService.createCliente).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: 'joao@teste.com', 
        cpf: '12345678901',
        telefone: null,
        endereco: null
      });
      expect(sendResponse).toHaveBeenCalledWith(res, 201, {
        data: createdClient,
        message: 'Cliente criado com sucesso'
      });
    });

    test('should handle validation errors', async () => {
      const invalidData = { nome: 'A', email: 'invalid-email' };

      req.body = invalidData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [
              { path: ['nome'], message: 'Nome deve ter pelo menos 2 caracteres' },
              { path: ['email'], message: 'Email inválido' }
            ]
          }
        })
      };

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [
        { field: 'nome', message: 'Nome deve ter pelo menos 2 caracteres' },
        { field: 'email', message: 'Email inválido' }
      ]);
    });

    test('should handle duplicate email error', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901'
      };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };
      ClientesService.getClienteByEmail.mockResolvedValue({ id: 1 });

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'Email já está sendo usado por outro cliente',
        field: 'email'
      });
    });

    test('should handle duplicate CPF error', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901'
      };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue({ id: 1 });

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'CPF já está sendo usado por outro cliente',
        field: 'cpf'
      });
    });

    test('should handle service errors', async () => {
      const clientData = {
        nome: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901'
      };
      const error = new Error('Database connection failed');

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };
      ClientesService.getClienteByEmail.mockRejectedValue(error);

      await ClientesController.create(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });

    test('should handle create with optional fields as null or undefined', async () => {
      const clientData = {
        nome: 'João Silva',
        email: undefined, // Campo opcional
        cpf: null, // Campo opcional
        telefone: 'teste',
        endereco: 'endereco teste'
      };
      const createdClient = { id: 1, nome: 'João Silva', email: null, cpf: null, telefone: 'teste', endereco: 'endereco teste' };

      req.body = clientData;
      ClientesSchema.create = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: clientData
        })
      };
      ClientesService.createCliente.mockResolvedValue(createdClient);

      await ClientesController.create(req, res);

      expect(ClientesService.createCliente).toHaveBeenCalledWith({
        nome: 'João Silva',
        email: null,
        cpf: null,
        telefone: 'teste',
        endereco: 'endereco teste'
      });
      expect(sendResponse).toHaveBeenCalledWith(res, 201, {
        data: createdClient,
        message: 'Cliente criado com sucesso'
      });
    });
  });

  describe('update', () => {
    test('should update client successfully', async () => {
      const clientId = 1;
      const updateData = { nome: 'João Santos' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const updatedClient = { id: 1, nome: 'João Santos', email: 'joao@teste.com' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(ClientesService.getClienteById).toHaveBeenCalledWith(clientId);
      expect(ClientesService.updateCliente).toHaveBeenCalledWith(clientId, updateData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: 'Cliente atualizado com sucesso'
      });
    });

    test('should handle client not found on update', async () => {
      const clientId = 999;
      const updateData = { nome: 'João Santos' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: 'Cliente não encontrado com o ID informado',
        field: 'id'
      });
    });

    test('should handle duplicate email on update', async () => {
      const clientId = 1;
      const updateData = { email: 'outro@teste.com' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const emailClient = { id: 2, email: 'outro@teste.com' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.getClienteByEmail.mockResolvedValue(emailClient);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'Email já está sendo usado por outro cliente',
        field: 'email'
      });
    });

    test('should handle empty string fields conversion to null', async () => {
      const clientId = 1;
      const updateData = { nome: 'João Santos', telefone: '', endereco: '' };
      const existingClient = { id: 1, nome: 'João Silva', telefone: '123456789', endereco: 'Rua A' };
      const expectedData = { nome: 'João Santos', telefone: null, endereco: null };
      const updatedClient = { id: 1, nome: 'João Santos', telefone: null, endereco: null };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(ClientesService.updateCliente).toHaveBeenCalledWith(clientId, expectedData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: 'Cliente atualizado com sucesso'
      });
    });

    test('should handle duplicate CPF on update when CPF is different from existing', async () => {
      const clientId = 1;
      const updateData = { cpf: '98765432100' };
      const existingClient = { id: 1, nome: 'João Silva', cpf: '12345678901' };
      const cpfClient = { id: 2, cpf: '98765432100' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.getClienteByEmail.mockResolvedValue(null);
      ClientesService.getClienteByCpf.mockResolvedValue(cpfClient);

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'CPF já está sendo usado por outro cliente',
        field: 'cpf'
      });
    });

    test('should allow update when email is the same as existing client', async () => {
      const clientId = 1;
      const updateData = { email: 'joao@teste.com', nome: 'João Santos' };
      const existingClient = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
      const updatedClient = { id: 1, nome: 'João Santos', email: 'joao@teste.com' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(ClientesService.updateCliente).toHaveBeenCalledWith(clientId, updateData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: 'Cliente atualizado com sucesso'
      });
    });

    test('should allow update when CPF is the same as existing client', async () => {
      const clientId = 1;
      const updateData = { cpf: '12345678901', nome: 'João Santos' };
      const existingClient = { id: 1, nome: 'João Silva', cpf: '12345678901' };
      const updatedClient = { id: 1, nome: 'João Santos', cpf: '12345678901' };

      req.params = { id: clientId.toString() };
      req.body = updateData;
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: updateData
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.updateCliente.mockResolvedValue(updatedClient);

      await ClientesController.update(req, res);

      expect(ClientesService.updateCliente).toHaveBeenCalledWith(clientId, updateData);
      expect(sendResponse).toHaveBeenCalledWith(res, 200, {
        data: updatedClient,
        message: 'Cliente atualizado com sucesso'
      });
    });
  });

  describe('remove', () => {
    test('should remove client successfully', async () => {
      const clientId = 1;
      const existingClient = { id: 1, nome: 'João Silva' };

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockResolvedValue(true);

      await ClientesController.remove(req, res);

      expect(ClientesService.getClienteById).toHaveBeenCalledWith(clientId);
      expect(ClientesService.deleteCliente).toHaveBeenCalledWith(clientId);
      expect(sendResponse).toHaveBeenCalledWith(res, 204, {
        message: 'Cliente removido com sucesso'
      });
    });

    test('should handle client not found on delete', async () => {
      const clientId = 999;

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(null);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 404, {
        message: 'Cliente não encontrado com o ID informado',
        field: 'id'
      });
    });

    test('should handle foreign key constraint error', async () => {
      const clientId = 1;
      const existingClient = { id: 1, nome: 'João Silva' };
      const error = new Error('Foreign key constraint');
      error.code = 'P2003';

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 409, {
        message: 'Não é possível remover cliente que possui vendas ou outros registros associados',
        field: 'relacionamentos'
      });
    });

    test('should handle general service errors on delete', async () => {
      const clientId = 1;
      const existingClient = { id: 1, nome: 'João Silva' };
      const error = new Error('Database connection failed');

      req.params = { id: clientId.toString() };
      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: clientId }
        })
      };
      ClientesService.getClienteById.mockResolvedValue(existingClient);
      ClientesService.deleteCliente.mockRejectedValue(error);

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('update - validation error cases', () => {
    test('should handle param validation errors (lines 134-138)', async () => {
      req.params = { id: 'invalid' };
      req.body = { nome: 'João', email: 'joao@email.com' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ 
              message: 'ID deve ser um número válido', 
              path: ['id'] 
            }]
          }
        })
      };

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        message: 'ID deve ser um número válido',
        field: 'id'
      }]);
    });

    test('should handle body validation errors (lines 145-149)', async () => {
      req.params = { id: '1' };
      req.body = { nome: 'J', email: 'invalid-email' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 1 }
        })
      };

      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ 
              message: 'Email deve ter formato válido', 
              path: ['email'] 
            }]
          }
        })
      };

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        message: 'Email deve ter formato válido',
        field: 'email'
      }]);
    });

    test('should handle catch block error in update (lines 199-200)', async () => {
      req.params = { id: '1' };
      req.body = { nome: 'João', email: 'joao@email.com' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: { id: 1 }
        })
      };

      ClientesSchema.update = {
        safeParse: jest.fn().mockReturnValue({
          success: true,
          data: req.body
        })
      };

      ClientesService.updateCliente.mockRejectedValue(new Error('Database connection failed'));

      await ClientesController.update(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 500, 'Erro interno do servidor');
    });
  });

  describe('remove - validation error cases', () => {
    test('should handle param validation errors in remove (lines 210-214)', async () => {
      req.params = { id: 'invalid' };

      ClientesSchema.id = {
        safeParse: jest.fn().mockReturnValue({
          success: false,
          error: {
            issues: [{ 
              message: 'ID deve ser um número válido', 
              path: ['id'] 
            }]
          }
        })
      };

      await ClientesController.remove(req, res);

      expect(sendError).toHaveBeenCalledWith(res, 400, [{
        message: 'ID deve ser um número válido',
        field: 'id'
      }]);
    });
  });
});
