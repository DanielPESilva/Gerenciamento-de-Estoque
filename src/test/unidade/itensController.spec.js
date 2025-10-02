import request from 'supertest';
import express from 'express';
import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import itensRoutes from '../../routes/itensRoutes.js';
import ItensService from '../../services/itensService.js';

jest.mock('../../services/itensService.js');

const app = express();
app.use(express.json());
app.use('/itens', itensRoutes);

describe('ItensController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /itens', () => {
    test('should create a new item', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        descricao: 'Camisa polo masculina',
        preco: 89.90,
        estoque: 20,
        categoria: 'Vestuário',
        tamanho: 'M',
        cor: 'Azul'
      };

      const mockItem = {
        id: 1,
        ...itemData,
        data_cadastro: new Date()
      };

      ItensService.create.mockResolvedValue(mockItem);

      const response = await request(app)
        .post('/itens')
        .send(itemData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockItem,
        message: 'Item criado com sucesso'
      });
      expect(ItensService.create).toHaveBeenCalledWith(itemData);
    });

    test('should handle validation errors', async () => {
      const invalidData = {
        nome: '',
        preco: -10,
        estoque: 'invalid'
      };

      const response = await request(app)
        .post('/itens')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('erro de validação');
    });

    test('should handle duplicate item errors', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        descricao: 'Camisa polo masculina',
        preco: 89.90,
        estoque: 20
      };

      ItensService.create.mockRejectedValue(new Error('Item já existe'));

      const response = await request(app)
        .post('/itens')
        .send(itemData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Item já existe'
      });
    });

    test('should handle server errors', async () => {
      const itemData = {
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 20
      };

      ItensService.create.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/itens')
        .send(itemData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /itens', () => {
    test('should get all items', async () => {
      const mockItens = [
        {
          id: 1,
          nome: 'Camisa Polo',
          preco: 89.90,
          estoque: 20,
          categoria: 'Vestuário'
        },
        {
          id: 2,
          nome: 'Calça Jeans',
          preco: 120.00,
          estoque: 15,
          categoria: 'Vestuário'
        }
      ];

      ItensService.getAll.mockResolvedValue(mockItens);

      const response = await request(app)
        .get('/itens');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockItens,
        count: mockItens.length
      });
      expect(ItensService.getAll).toHaveBeenCalled();
    });

    test('should handle empty items list', async () => {
      ItensService.getAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/itens');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });

    test('should handle server errors', async () => {
      ItensService.getAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/itens');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /itens/:id', () => {
    test('should get item by id', async () => {
      const itemId = 1;
      const mockItem = {
        id: 1,
        nome: 'Camisa Polo',
        descricao: 'Camisa polo masculina',
        preco: 89.90,
        estoque: 20,
        categoria: 'Vestuário',
        tamanho: 'M',
        cor: 'Azul'
      };

      ItensService.getById.mockResolvedValue(mockItem);

      const response = await request(app)
        .get(`/itens/${itemId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockItem
      });
      expect(ItensService.getById).toHaveBeenCalledWith(itemId);
    });

    test('should handle non-existent item', async () => {
      const itemId = 999;

      ItensService.getById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/itens/${itemId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Item não encontrado'
      });
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .get('/itens/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID deve ser um número válido'
      });
    });

    test('should handle server errors', async () => {
      const itemId = 1;

      ItensService.getById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/itens/${itemId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('PUT /itens/:id', () => {
    test('should update item', async () => {
      const itemId = 1;
      const updateData = {
        nome: 'Camisa Polo Premium',
        preco: 99.90,
        estoque: 25
      };

      const mockUpdatedItem = {
        id: 1,
        descricao: 'Camisa polo masculina',
        categoria: 'Vestuário',
        ...updateData,
        data_atualizacao: new Date()
      };

      ItensService.update.mockResolvedValue(mockUpdatedItem);

      const response = await request(app)
        .put(`/itens/${itemId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedItem,
        message: 'Item atualizado com sucesso'
      });
      expect(ItensService.update).toHaveBeenCalledWith(itemId, updateData);
    });

    test('should handle non-existent item', async () => {
      const itemId = 999;
      const updateData = { nome: 'Novo Nome' };

      ItensService.update.mockResolvedValue(null);

      const response = await request(app)
        .put(`/itens/${itemId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Item não encontrado'
      });
    });

    test('should handle validation errors', async () => {
      const itemId = 1;
      const invalidData = {
        preco: 'invalid',
        estoque: -5
      };

      const response = await request(app)
        .put(`/itens/${itemId}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('erro de validação');
    });

    test('should handle server errors', async () => {
      const itemId = 1;
      const updateData = { nome: 'Novo Nome' };

      ItensService.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/itens/${itemId}`)
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('DELETE /itens/:id', () => {
    test('should delete item', async () => {
      const itemId = 1;
      const mockDeletedItem = {
        id: 1,
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 20
      };

      ItensService.delete.mockResolvedValue(mockDeletedItem);

      const response = await request(app)
        .delete(`/itens/${itemId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Item removido com sucesso'
      });
      expect(ItensService.delete).toHaveBeenCalledWith(itemId);
    });

    test('should handle non-existent item', async () => {
      const itemId = 999;

      ItensService.delete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/itens/${itemId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Item não encontrado'
      });
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .delete('/itens/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID deve ser um número válido'
      });
    });

    test('should handle items with sales history', async () => {
      const itemId = 1;

      ItensService.delete.mockRejectedValue(new Error('Item possui histórico de vendas'));

      const response = await request(app)
        .delete(`/itens/${itemId}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Item possui histórico de vendas'
      });
    });

    test('should handle server errors', async () => {
      const itemId = 1;

      ItensService.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/itens/${itemId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /itens/categoria/:categoria', () => {
    test('should get items by category', async () => {
      const categoria = 'Vestuário';
      const mockItens = [
        {
          id: 1,
          nome: 'Camisa Polo',
          preco: 89.90,
          categoria: 'Vestuário'
        },
        {
          id: 2,
          nome: 'Calça Jeans',
          preco: 120.00,
          categoria: 'Vestuário'
        }
      ];

      ItensService.getByCategory.mockResolvedValue(mockItens);

      const response = await request(app)
        .get(`/itens/categoria/${categoria}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockItens,
        count: mockItens.length
      });
      expect(ItensService.getByCategory).toHaveBeenCalledWith(categoria);
    });

    test('should handle empty category', async () => {
      const categoria = 'Eletrônicos';

      ItensService.getByCategory.mockResolvedValue([]);

      const response = await request(app)
        .get(`/itens/categoria/${categoria}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });

    test('should handle server errors', async () => {
      const categoria = 'Vestuário';

      ItensService.getByCategory.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/itens/categoria/${categoria}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('PUT /itens/:id/estoque', () => {
    test('should update item stock', async () => {
      const itemId = 1;
      const stockData = { quantidade: 10, operacao: 'adicionar' };

      const mockUpdatedItem = {
        id: 1,
        nome: 'Camisa Polo',
        preco: 89.90,
        estoque: 30 // Previous stock was 20
      };

      ItensService.updateStock.mockResolvedValue(mockUpdatedItem);

      const response = await request(app)
        .put(`/itens/${itemId}/estoque`)
        .send(stockData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedItem,
        message: 'Estoque atualizado com sucesso'
      });
      expect(ItensService.updateStock).toHaveBeenCalledWith(itemId, stockData);
    });

    test('should handle insufficient stock for removal', async () => {
      const itemId = 1;
      const stockData = { quantidade: 25, operacao: 'remover' };

      ItensService.updateStock.mockRejectedValue(new Error('Estoque insuficiente'));

      const response = await request(app)
        .put(`/itens/${itemId}/estoque`)
        .send(stockData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Estoque insuficiente'
      });
    });
  });
});