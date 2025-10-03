import * as VendasController from '../../controllers/vendasController.js';
import VendasService from '../../services/vendasService.js';
import VendasSchema from '../../schemas/vendasSchema.js';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../services/vendasService.js');
jest.mock('../../schemas/vendasSchema.js');

describe('VendasController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('getAll', () => {
        beforeEach(() => {
            req.query = { page: 1, limit: 10 };
        });

        it('should get all vendas successfully', async () => {
            const mockVendas = [
                { id: 1, cliente_id: 1, total: 100.50, data_venda: new Date() },
                { id: 2, cliente_id: 2, total: 200.75, data_venda: new Date() }
            ];

            VendasSchema.query = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { page: 1, limit: 10 }
                })
            };

            VendasService.getAllVendas.mockResolvedValue({
                data: mockVendas,
                pagination: { page: 1, limit: 10, total: 2 }
            });

            await VendasController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockVendas,
                pagination: { page: 1, limit: 10, total: 2 }
            });
        });

        it('should handle validation errors', async () => {
            VendasSchema.query = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['page'], message: 'Invalid page number' }]
                    }
                })
            };

            await expect(VendasController.getAll(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('getById', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should get venda by id successfully', async () => {
            const mockVenda = { id: 1, cliente_id: 1, total: 100.50 };

            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasService.getVendaById.mockResolvedValue(mockVenda);

            await VendasController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockVenda
            });
        });

        it('should handle venda not found', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 999 }
                })
            };

            VendasService.getVendaById.mockResolvedValue(null);

            await expect(VendasController.getById(req, res)).rejects.toThrow(APIError);
        });

        it('should handle validation error with fallback message (lines 52-53)', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {} // Error object without issues property
                })
            };

            await expect(VendasController.getById(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });
    });

    describe('create', () => {
        beforeEach(() => {
            req.body = {
                cliente_id: 1,
                itens: [{ item_id: 1, quantidade: 2, preco: 50.00 }],
                total: 100.00,
                metodo_pagamento: 'cartao'
            };
        });

        it('should create venda successfully', async () => {
            const mockVenda = { id: 1, ...req.body, data_venda: new Date() };

            VendasSchema.create = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.body
                })
            };

            VendasService.createVenda.mockResolvedValue(mockVenda);

            await VendasController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Venda criada com sucesso',
                data: mockVenda
            });
        });

        it('should handle validation errors', async () => {
            VendasSchema.create = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['cliente_id'], message: 'Required field' }]
                    }
                })
            };

            await expect(VendasController.create(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = { forma_pgto: 'dinheiro' };
        });

        it('should update venda successfully', async () => {
            const mockUpdatedVenda = { id: 1, forma_pgto: 'dinheiro' };

            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasSchema.update = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.body
                })
            };

            VendasService.updateVenda.mockResolvedValue(mockUpdatedVenda);

            await VendasController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Venda atualizada com sucesso',
                data: mockUpdatedVenda
            });
        });

        it('should handle venda not found on update', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasSchema.update = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.body
                })
            };

            VendasService.updateVenda.mockRejectedValue(new Error('Venda não encontrada'));

            await expect(VendasController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Venda não encontrada" }], 404)
            );
        });
    });

    describe('getStats', () => {
        beforeEach(() => {
            req.query = { data_inicio: '2024-01-01', data_fim: '2024-12-31' };
        });

        it('should get stats successfully', async () => {
            const mockStats = {
                total_vendas: 100,
                total_valor: 15000.00,
                media_valor: 150.00
            };

            VendasSchema.query = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.query
                })
            };

            VendasService.getVendasStats.mockResolvedValue(mockStats);

            await VendasController.getStats(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats,
                message: "Estatísticas de vendas"
            });
        });

        it('should handle validation errors in getStats', async () => {
            VendasSchema.query = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['data_inicio'], message: 'Invalid date format' }]
                    }
                })
            };

            await expect(VendasController.getStats(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('create - additional error cases', () => {
        beforeEach(() => {
            req.body = {
                cliente_id: 1,
                itens: [{ item_id: 1, quantidade: 2, preco: 50.00 }],
                total: 100.00,
                metodo_pagamento: 'cartao'
            };

            VendasSchema.create = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.body
                })
            };
        });

        it('should handle stock insufficient error', async () => {
            VendasService.createVenda.mockRejectedValue(
                new Error('Estoque insuficiente para o item')
            );

            await expect(VendasController.create(req, res)).rejects.toThrow(
                new APIError([{ path: "estoque", message: "Estoque insuficiente para o item" }], 400)
            );
        });

        it('should handle item not found error', async () => {
            VendasService.createVenda.mockRejectedValue(
                new Error('Item não encontrado')
            );

            await expect(VendasController.create(req, res)).rejects.toThrow(
                new APIError([{ path: "estoque", message: "Item não encontrado" }], 400)
            );
        });

        it('should handle generic error in create', async () => {
            VendasService.createVenda.mockRejectedValue(
                new Error('Database connection error')
            );

            await expect(VendasController.create(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Database connection error" }], 500)
            );
        });

        it('should handle error without message in create', async () => {
            VendasService.createVenda.mockRejectedValue(new Error());

            await expect(VendasController.create(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Erro ao criar venda" }], 500)
            );
        });
    });

    describe('update - additional error cases', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = { forma_pgto: 'dinheiro' };

            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasSchema.update = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: req.body
                })
            };
        });

        it('should handle validation error in update params', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['id'], message: 'Invalid ID format' }]
                    }
                })
            };

            await expect(VendasController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "id", message: "Invalid ID format" }], 400)
            );
        });

        it('should handle validation error in update body', async () => {
            VendasSchema.update = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['forma_pgto'], message: 'Invalid payment method' }]
                    }
                })
            };

            await expect(VendasController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "forma_pgto", message: "Invalid payment method" }], 400)
            );
        });

        it('should handle generic error in update', async () => {
            VendasService.updateVenda.mockRejectedValue(
                new Error('Database error')
            );

            await expect(VendasController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Database error" }], 500)
            );
        });

        it('should handle error without message in update', async () => {
            VendasService.updateVenda.mockRejectedValue(new Error());

            await expect(VendasController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Erro ao atualizar venda" }], 500)
            );
        });
    });

    describe('remove', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should remove venda successfully', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasService.deleteVenda.mockResolvedValue({ message: 'Venda removida com sucesso' });

            await VendasController.remove(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Venda removida com sucesso'
            });
        });

        it('should handle venda not found on delete', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasService.deleteVenda.mockRejectedValue(new Error('Venda não encontrada'));

            await expect(VendasController.remove(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Venda não encontrada" }], 404)
            );
        });

        it('should handle validation error in remove params', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: false,
                    error: {
                        issues: [{ path: ['id'], message: 'Invalid ID format' }]
                    }
                })
            };

            await expect(VendasController.remove(req, res)).rejects.toThrow(
                new APIError([{ path: "id", message: "Invalid ID format" }], 400)
            );
        });

        it('should handle generic error in remove', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasService.deleteVenda.mockRejectedValue(
                new Error('Database error')
            );

            await expect(VendasController.remove(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Database error" }], 500)
            );
        });

        it('should handle error without message in remove', async () => {
            VendasSchema.id = {
                safeParse: jest.fn().mockReturnValue({
                    success: true,
                    data: { id: 1 }
                })
            };

            VendasService.deleteVenda.mockRejectedValue(new Error());

            await expect(VendasController.remove(req, res)).rejects.toThrow(
                new APIError([{ path: "venda", message: "Erro ao deletar venda" }], 500)
            );
        });
    });
});
