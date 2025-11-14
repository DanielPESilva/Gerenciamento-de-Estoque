import ItensController from '../../controllers/itensController.js';
import ItensService from '../../services/itensService.js';
import ItensSchema from '../../schemas/itensSchema.js';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../services/itensService.js');
jest.mock('../../schemas/itensSchema.js');

describe('ItensController', () => {
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
    });

    describe('getAll', () => {
        it('should get all itens successfully', async () => {
            const mockItens = [
                { id: 1, nome: 'Camisa Azul', tipo: 'camisa', cor: 'azul' },
                { id: 2, nome: 'Calça Jeans', tipo: 'calça', cor: 'azul' }
            ];

            ItensSchema.query.safeParse.mockReturnValue({
                success: true,
                data: { page: 1, limit: 10 }
            });

            ItensService.getAllItens.mockResolvedValue({
                data: mockItens,
                pagination: { page: 1, limit: 10, total: 2 }
            });

            await ItensController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockItens,
                pagination: { page: 1, limit: 10, total: 2 }
            });
        });

        it('should handle validation errors', async () => {
            const validationError = {
                success: false,
                error: { issues: [{ path: ['page'], message: 'Página deve ser um número positivo' }] }
            };

            ItensSchema.query.safeParse.mockReturnValue(validationError);

            await expect(ItensController.getAll(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('getById', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should get item by id successfully', async () => {
            const mockItem = { id: 1, nome: 'Camisa Azul', tipo: 'camisa' };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensService.getItemById.mockResolvedValue(mockItem);

            await ItensController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockItem
            });
        });

        it('should handle item not found', async () => {
            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.getById(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Item não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('create', () => {
        beforeEach(() => {
            req.body = {
                nome: 'Camisa Azul',
                tipo: 'camisa',
                cor: 'azul',
                tamanho: 'M',
                preco: 50
            };
        });

        it('should create item successfully', async () => {
            const createdItem = { id: 1, ...req.body };

            ItensSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            ItensService.createItem.mockResolvedValue(createdItem);

            await ItensController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdItem
            });
        });

        it('should handle validation errors', async () => {
            const validationError = {
                success: false,
                error: { issues: [{ path: ['nome'], message: 'Nome é obrigatório' }] }
            };

            ItensSchema.create.safeParse.mockReturnValue(validationError);

            await expect(ItensController.create(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('update', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = {
                nome: 'Camisa Verde',
                cor: 'verde'
            };
        });

        it('should update item successfully', async () => {
            const existingItem = { id: 1, nome: 'Camisa Azul', cor: 'azul' };
            const updatedItem = { id: 1, nome: 'Camisa Verde', cor: 'verde' };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            ItensService.getItemById.mockResolvedValue(existingItem);
            ItensService.updateItem.mockResolvedValue(updatedItem);

            await ItensController.update(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedItem
            });
        });

        it('should handle item not found on update', async () => {
            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.update(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Item não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('delete', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should delete item successfully', async () => {
            const existingItem = { id: 1, nome: 'Camisa Azul' };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensService.getItemById.mockResolvedValue(existingItem);
            ItensService.deleteItem.mockResolvedValue(true);
            res.send = jest.fn();

            await ItensController.delete(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle item not found on delete', async () => {
            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.delete(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Item não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('patch', () => {
        it('should patch item successfully', async () => {
            const itemId = 1;
            const updateData = { nome: 'Camisa Atualizada' };
            const existingItem = { id: 1, nome: 'Camisa Teste', quantidade: 10 };
            const updatedItem = { id: 1, nome: 'Camisa Atualizada', quantidade: 10 };

            req.params = { id: itemId.toString() };
            req.body = updateData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.update.safeParse.mockReturnValue({
                success: true,
                data: updateData
            });

            ItensService.getItemById.mockResolvedValue(existingItem);
            ItensService.updateItem.mockResolvedValue(updatedItem);

            await ItensController.patch(req, res);

            expect(ItensService.getItemById).toHaveBeenCalledWith(itemId);
            expect(ItensService.updateItem).toHaveBeenCalledWith(itemId, updateData);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedItem
            });
        });

        it('should handle item not found on patch', async () => {
            const itemId = 999;
            const updateData = { nome: 'Camisa Atualizada' };

            req.params = { id: itemId.toString() };
            req.body = updateData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.update.safeParse.mockReturnValue({
                success: true,
                data: updateData
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.patch(req, res)).rejects.toThrow(APIError);
        });

        it('should handle validation error with fallback in patch (lines 186-187)', async () => {
            const itemId = 1;
            req.params = { id: itemId.toString() };
            req.body = { nome: 'Item' };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.update.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.patch(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });
    });

    describe('addQuantidade', () => {
        it('should add quantity successfully', async () => {
            const itemId = 1;
            const quantidadeData = { quantidade: 5 };
            const existingItem = { id: 1, nome: 'Camisa Teste', quantidade: 10 };
            const updatedItem = { id: 1, nome: 'Camisa Teste', quantidade: 15 };

            req.params = { id: itemId.toString() };
            req.body = quantidadeData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: true,
                data: quantidadeData
            });

            ItensService.getItemById.mockResolvedValue(existingItem);
            ItensService.updateQuantidade.mockResolvedValue(updatedItem);

            await ItensController.addQuantidade(req, res);

            expect(ItensService.getItemById).toHaveBeenCalledWith(itemId);
            expect(ItensService.updateQuantidade).toHaveBeenCalledWith(itemId, 15);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: '5 unidade(s) adicionada(s) ao estoque',
                data: {
                    id: 1,
                    nome: 'Camisa Teste',
                    quantidade_anterior: 10,
                    quantidade_adicionada: 5,
                    quantidade_atual: 15
                }
            });
        });

        it('should handle item not found when adding quantity', async () => {
            const itemId = 999;
            const quantidadeData = { quantidade: 5 };

            req.params = { id: itemId.toString() };
            req.body = quantidadeData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: true,
                data: quantidadeData
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.addQuantidade(req, res)).rejects.toThrow(APIError);
        });

        it('should handle param validation error with fallback in addQuantidade (lines 227-228)', async () => {
            req.params = { id: 'invalid' };
            req.body = { quantidade: 10 };

            ItensSchema.id.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.addQuantidade(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });

        it('should handle body validation error with fallback in addQuantidade (lines 240-241)', async () => {
            const itemId = 1;
            req.params = { id: itemId.toString() };
            req.body = { quantidade: -5 };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.addQuantidade(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });
    });

    describe('removeQuantidade', () => {
        it('should remove quantity successfully', async () => {
            const itemId = 1;
            const quantidadeData = { quantidade: 3 };
            const existingItem = { id: 1, nome: 'Camisa Teste', quantidade: 10 };
            const updatedItem = { id: 1, nome: 'Camisa Teste', quantidade: 7 };

            req.params = { id: itemId.toString() };
            req.body = quantidadeData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: true,
                data: quantidadeData
            });

            ItensService.getItemById.mockResolvedValue(existingItem);
            ItensService.updateQuantidade.mockResolvedValue(updatedItem);

            await ItensController.removeQuantidade(req, res);

            expect(ItensService.getItemById).toHaveBeenCalledWith(itemId);
            expect(ItensService.updateQuantidade).toHaveBeenCalledWith(itemId, 7);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: '3 unidade(s) removida(s) do estoque',
                data: {
                    id: 1,
                    nome: 'Camisa Teste',
                    quantidade_anterior: 10,
                    quantidade_removida: 3,
                    quantidade_atual: 7
                }
            });
        });

        it('should handle insufficient quantity when removing', async () => {
            const itemId = 1;
            const quantidadeData = { quantidade: 15 };
            const existingItem = { id: 1, nome: 'Camisa Teste', quantidade: 10 };

            req.params = { id: itemId.toString() };
            req.body = quantidadeData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: true,
                data: quantidadeData
            });

            ItensService.getItemById.mockResolvedValue(existingItem);

            await expect(ItensController.removeQuantidade(req, res)).rejects.toThrow(APIError);
        });

        it('should handle param validation error with fallback in removeQuantidade (lines 284-285)', async () => {
            req.params = { id: 'invalid' };
            req.body = { quantidade: 10 };

            ItensSchema.id.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.removeQuantidade(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });

        it('should handle body validation error with fallback in removeQuantidade (lines 297-298)', async () => {
            const itemId = 1;
            req.params = { id: itemId.toString() };
            req.body = { quantidade: -5 };

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.removeQuantidade(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });

        it('should handle item not found in removeQuantidade (line 312)', async () => {
            const itemId = 999;
            const quantidadeData = { quantidade: 10 };

            req.params = { id: itemId.toString() };
            req.body = quantidadeData;

            ItensSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: itemId }
            });

            ItensSchema.quantidade.safeParse.mockReturnValue({
                success: true,
                data: quantidadeData
            });

            ItensService.getItemById.mockResolvedValue(null);

            await expect(ItensController.removeQuantidade(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Item não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('searchByName', () => {
        it('should search items by name successfully', async () => {
            const searchTerm = 'Camisa';
            const searchResults = [
                { id: 1, nome: 'Camisa Azul' },
                { id: 2, nome: 'Camisa Vermelha' }
            ];

            req.query = { q: searchTerm };

            ItensSchema.search.safeParse.mockReturnValue({
                success: true,
                data: { q: searchTerm }
            });

            ItensService.searchByName.mockResolvedValue(searchResults);

            await ItensController.searchByName(req, res);

            expect(ItensService.searchByName).toHaveBeenCalledWith(searchTerm, undefined);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: searchResults,
                message: '2 itens encontrados'
            });
        });

        it('should handle validation errors in search', async () => {
            req.query = {};

            ItensSchema.search.safeParse.mockReturnValue({
                success: false,
                error: {
                    issues: [{ path: ['q'], message: 'Search term is required' }]
                }
            });

            await expect(ItensController.searchByName(req, res)).rejects.toThrow(APIError);
        });

        it('should handle validation error with fallback in searchByName (line 312)', async () => {
            req.query = {};

            ItensSchema.search.safeParse.mockReturnValue({
                success: false,
                error: {} // Error without issues property
            });

            await expect(ItensController.searchByName(req, res)).rejects.toThrow(
                new APIError([{ path: "validation", message: "Erro de validação" }], 400)
            );
        });
    });
});
