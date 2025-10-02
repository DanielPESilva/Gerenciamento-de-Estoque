import request from 'supertest';
import express from 'express';
import { describe, expect, jest, test, beforeEach } from '@jest/globals';
import vendasRoutes from '../../routes/vendasRoutes.js';
import VendasService from '../../services/vendasService.js';

jest.mock('../../services/vendasService.js');

const app = express();
app.use(express.json());
app.use('/vendas', vendasRoutes);

describe('VendasController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /vendas', () => {
    test('should create a new sale', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [
          { item_id: 1, quantidade: 2, preco: 50.00 }
        ],
        total: 100.00,
        metodo_pagamento: 'cartao'
      };

      const mockVenda = {
        id: 1,
        ...vendaData,
        data_venda: new Date()
      };

      VendasService.create.mockResolvedValue(mockVenda);

      const response = await request(app)
        .post('/vendas')
        .send(vendaData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: mockVenda,
        message: 'Venda criada com sucesso'
      });
      expect(VendasService.create).toHaveBeenCalledWith(vendaData);
    });

    test('should handle validation errors', async () => {
      const invalidData = {
        cliente_id: 'invalid',
        itens: [],
        total: -10
      };

      const response = await request(app)
        .post('/vendas')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('erro de validação');
    });

    test('should handle service errors', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [{ item_id: 1, quantidade: 2, preco: 50.00 }],
        total: 100.00,
        metodo_pagamento: 'cartao'
      };

      VendasService.create.mockRejectedValue(new Error('Cliente não encontrado'));

      const response = await request(app)
        .post('/vendas')
        .send(vendaData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Cliente não encontrado'
      });
      expect(VendasService.create).toHaveBeenCalledWith(vendaData);
    });

    test('should handle server errors', async () => {
      const vendaData = {
        cliente_id: 1,
        itens: [{ item_id: 1, quantidade: 2, preco: 50.00 }],
        total: 100.00,
        metodo_pagamento: 'cartao'
      };

      VendasService.create.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .post('/vendas')
        .send(vendaData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /vendas', () => {
    test('should get all sales', async () => {
      const mockVendas = [
        {
          id: 1,
          cliente_id: 1,
          total: 100.00,
          data_venda: new Date(),
          cliente: { nome: 'João Silva' }
        },
        {
          id: 2,
          cliente_id: 2,
          total: 80.00,
          data_venda: new Date(),
          cliente: { nome: 'Maria Santos' }
        }
      ];

      VendasService.getAll.mockResolvedValue(mockVendas);

      const response = await request(app)
        .get('/vendas');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockVendas,
        count: mockVendas.length
      });
      expect(VendasService.getAll).toHaveBeenCalled();
    });

    test('should handle empty sales list', async () => {
      VendasService.getAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/vendas');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: [],
        count: 0
      });
    });

    test('should handle server errors', async () => {
      VendasService.getAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/vendas');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('GET /vendas/:id', () => {
    test('should get sale by id', async () => {
      const vendaId = 1;
      const mockVenda = {
        id: 1,
        cliente_id: 1,
        total: 100.00,
        data_venda: new Date(),
        cliente: { nome: 'João Silva' },
        itens: [
          { id: 1, nome: 'Camisa', quantidade: 2, preco: 50.00 }
        ]
      };

      VendasService.getById.mockResolvedValue(mockVenda);

      const response = await request(app)
        .get(`/vendas/${vendaId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockVenda
      });
      expect(VendasService.getById).toHaveBeenCalledWith(vendaId);
    });

    test('should handle non-existent sale', async () => {
      const vendaId = 999;

      VendasService.getById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/vendas/${vendaId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Venda não encontrada'
      });
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .get('/vendas/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID deve ser um número válido'
      });
    });

    test('should handle server errors', async () => {
      const vendaId = 1;

      VendasService.getById.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/vendas/${vendaId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('PUT /vendas/:id', () => {
    test('should update sale', async () => {
      const vendaId = 1;
      const updateData = {
        metodo_pagamento: 'pix',
        observacoes: 'Pagamento via PIX'
      };

      const mockUpdatedVenda = {
        id: 1,
        cliente_id: 1,
        total: 100.00,
        ...updateData,
        data_venda: new Date()
      };

      VendasService.update.mockResolvedValue(mockUpdatedVenda);

      const response = await request(app)
        .put(`/vendas/${vendaId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockUpdatedVenda,
        message: 'Venda atualizada com sucesso'
      });
      expect(VendasService.update).toHaveBeenCalledWith(vendaId, updateData);
    });

    test('should handle non-existent sale', async () => {
      const vendaId = 999;
      const updateData = { metodo_pagamento: 'pix' };

      VendasService.update.mockResolvedValue(null);

      const response = await request(app)
        .put(`/vendas/${vendaId}`)
        .send(updateData);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Venda não encontrada'
      });
    });

    test('should handle validation errors', async () => {
      const vendaId = 1;
      const invalidData = {
        total: 'invalid'
      };

      const response = await request(app)
        .put(`/vendas/${vendaId}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('erro de validação');
    });

    test('should handle server errors', async () => {
      const vendaId = 1;
      const updateData = { metodo_pagamento: 'pix' };

      VendasService.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/vendas/${vendaId}`)
        .send(updateData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });

  describe('DELETE /vendas/:id', () => {
    test('should delete sale', async () => {
      const vendaId = 1;
      const mockDeletedVenda = {
        id: 1,
        cliente_id: 1,
        total: 100.00,
        data_venda: new Date()
      };

      VendasService.delete.mockResolvedValue(mockDeletedVenda);

      const response = await request(app)
        .delete(`/vendas/${vendaId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Venda removida com sucesso'
      });
      expect(VendasService.delete).toHaveBeenCalledWith(vendaId);
    });

    test('should handle non-existent sale', async () => {
      const vendaId = 999;

      VendasService.delete.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/vendas/${vendaId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        success: false,
        message: 'Venda não encontrada'
      });
    });

    test('should handle invalid id format', async () => {
      const response = await request(app)
        .delete('/vendas/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'ID deve ser um número válido'
      });
    });

    test('should handle server errors', async () => {
      const vendaId = 1;

      VendasService.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/vendas/${vendaId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Erro interno do servidor'
      });
    });
  });
});