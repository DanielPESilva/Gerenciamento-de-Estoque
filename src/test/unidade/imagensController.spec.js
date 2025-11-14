import ImagensController from '../../controllers/imagensController.js';
import ImagensService from '../../services/imagensService.js';
import { sendResponse, sendError } from '../../utils/messages.js';
import { ZodError } from 'zod';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../services/imagensService.js');
jest.mock('../../utils/messages.js');

describe('ImagensController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
            file: null,
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
        console.error = jest.fn();

        // Mock do ImagensService
        ImagensService.listar = jest.fn();
        ImagensService.deletar = jest.fn();
    });

    describe('listar', () => {
        it('should list images successfully', async () => {
            const mockImages = [
                { id: 1, filename: 'image1.jpg', path: '/uploads/image1.jpg' },
                { id: 2, filename: 'image2.jpg', path: '/uploads/image2.jpg' }
            ];

            req.query = { item_id: 1 };
            ImagensService.listar.mockResolvedValue(mockImages);
            sendResponse.mockImplementation((res, status, data) => {
                res.status(status).json(data);
            });

            await ImagensController.listar(req, res);

            expect(ImagensService.listar).toHaveBeenCalledWith({ item_id: 1 });
            expect(sendResponse).toHaveBeenCalledWith(res, 200, { data: mockImages });
        });

        it('should handle service errors when listing', async () => {
            const error = new Error('Database error');
            req.query = { item_id: 1 };

            ImagensService.listar.mockRejectedValue(error);
            sendError.mockImplementation((res, status, message) => {
                res.status(status).json({ error: message });
            });

            await ImagensController.listar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 500, 'Ocorreu um erro interno no servidor!');
        });

        it('should handle ZodError when listing', async () => {
            req.query = { item_id: 1 };

            const zodError = new ZodError([
                {
                    path: ['item_id'],
                    message: 'ID deve ser um número válido',
                    code: 'invalid_type'
                }
            ]);

            ImagensService.listar.mockRejectedValue(zodError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.listar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 400, [
                { path: 'item_id', message: 'ID deve ser um número válido' }
            ]);
        });

        it('should handle APIError when listing', async () => {
            req.query = { item_id: 1 };

            const apiError = new APIError(['Item não encontrado'], 404);

            ImagensService.listar.mockRejectedValue(apiError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.listar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 404, ['Item não encontrado']);
        });
    });

    describe('inserir', () => {
        beforeEach(() => {
            ImagensService.create = jest.fn();
        });

        it('should insert images successfully', async () => {
            req.files = {
                images: [
                    { filename: 'image1.jpg', path: '/tmp/image1.jpg' },
                    { filename: 'image2.jpg', path: '/tmp/image2.jpg' }
                ]
            };
            req.body = { item_id: 1 };

            const mockResult = [
                { id: 1, filename: 'image1.jpg', item_id: 1 },
                { id: 2, filename: 'image2.jpg', item_id: 1 }
            ];

            ImagensService.create.mockResolvedValue(mockResult);
            sendResponse.mockImplementation((res, status, data) => {
                res.status(status).json(data);
            });

            await ImagensController.inserir(req, res);

            expect(ImagensService.create).toHaveBeenCalledWith(
                { item_id: 1 },
                req.files.images
            );
            expect(sendResponse).toHaveBeenCalledWith(res, 201, { data: mockResult });
        });

        it('should handle no images sent', async () => {
            req.files = { images: [] };
            req.body = { item_id: 1 };

            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.inserir(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 400, ['Nenhuma imagem enviada.']);
        });

        it('should handle no files object', async () => {
            req.files = {};
            req.body = { item_id: 1 };

            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.inserir(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 400, ['Nenhuma imagem enviada.']);
        });

        it('should handle ZodError when inserting', async () => {
            req.files = {
                images: [{ filename: 'image1.jpg', path: '/tmp/image1.jpg' }]
            };
            req.body = { item_id: 'invalid' };

            const zodError = new ZodError([
                {
                    path: ['item_id'],
                    message: 'ID deve ser um número válido',
                    code: 'invalid_type'
                }
            ]);

            ImagensService.create.mockRejectedValue(zodError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.inserir(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 400, [
                { path: 'item_id', message: 'ID deve ser um número válido' }
            ]);
        });

        it('should handle APIError when inserting', async () => {
            req.files = {
                images: [{ filename: 'image1.jpg', path: '/tmp/image1.jpg' }]
            };
            req.body = { item_id: 999 };

            const apiError = new APIError(['Item não encontrado'], 404);

            ImagensService.create.mockRejectedValue(apiError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.inserir(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 404, ['Item não encontrado']);
        });

        it('should handle generic error when inserting', async () => {
            req.files = {
                images: [{ filename: 'image1.jpg', path: '/tmp/image1.jpg' }]
            };
            req.body = { item_id: 1 };

            const error = new Error('Database error');

            ImagensService.create.mockRejectedValue(error);
            sendError.mockImplementation((res, status, message) => {
                res.status(status).json({ error: message });
            });

            await ImagensController.inserir(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 500, 'Ocorreu um erro interno no servidor!');
        });
    });

    describe('buscar_imagem', () => {
        it('should find image by id successfully', async () => {
            req.params = { itemId: '1', filename: 'image1.jpg' };
            
            // Mock res.sendFile
            res.sendFile = jest.fn((filePath, callback) => {
                callback(null); // No error, successful response
            });

            await ImagensController.buscar_imagem(req, res);

            expect(res.sendFile).toHaveBeenCalled();
        });

        it('should handle image not found', async () => {
            req.params = { itemId: '999', filename: 'nonexistent.jpg' };
            
            // Mock res.sendFile with error
            res.sendFile = jest.fn((filePath, callback) => {
                callback(new Error('File not found')); // Error callback
            });
            
            sendError.mockImplementation((res, status, message) => {
                res.status(status).json({ error: message });
            });

            await ImagensController.buscar_imagem(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 404, ['Imagem não foi encontrada']);
        });

        it('should handle internal server error in buscar_imagem', async () => {
            // Force an error by mocking path.join to throw
            const originalJoin = require('path').join;
            require('path').join = jest.fn(() => {
                throw new Error('Path error');
            });

            req.params = { itemId: '1', filename: 'image1.jpg' };
            
            sendError.mockImplementation((res, status, message) => {
                res.status(status).json({ error: message });
            });

            await ImagensController.buscar_imagem(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 500, 'Ocorreu um erro interno no servidor!');

            // Restore original function
            require('path').join = originalJoin;
        });
    });

    describe('deletar', () => {
        it('should delete image successfully', async () => {
            req.params = { id: '1' };

            ImagensService.deletar.mockResolvedValue(true);
            sendResponse.mockImplementation((res, status, data) => {
                res.status(status).json(data);
            });

            await ImagensController.deletar(req, res);

            expect(ImagensService.deletar).toHaveBeenCalledWith({ id: 1 });
            expect(sendResponse).toHaveBeenCalledWith(res, 200, {
                data: true
            });
        });

        it('should handle image not found on delete', async () => {
            req.params = { id: '999' };

            // Mock service para rejeitar com erro
            ImagensService.deletar.mockRejectedValue(new Error('Imagem não encontrada'));
            sendError.mockImplementation((res, status, message) => {
                res.status(status).json({ error: message });
            });

            await ImagensController.deletar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 500, 'Ocorreu um erro interno no servidor!');
        });

        it('should handle ZodError when deleting', async () => {
            req.params = { id: 'invalid' };

            const zodError = new ZodError([
                {
                    path: ['id'],
                    message: 'ID deve ser um número válido',
                    code: 'invalid_type'
                }
            ]);

            ImagensService.deletar.mockRejectedValue(zodError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.deletar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 400, [
                { path: 'id', message: 'ID deve ser um número válido' }
            ]);
        });

        it('should handle APIError when deleting', async () => {
            req.params = { id: '999' };

            const apiError = new APIError(['Imagem não encontrada'], 404);

            ImagensService.deletar.mockRejectedValue(apiError);
            sendError.mockImplementation((res, status, errors) => {
                res.status(status).json({ errors });
            });

            await ImagensController.deletar(req, res);

            expect(sendError).toHaveBeenCalledWith(res, 404, ['Imagem não encontrada']);
        });
    });
});
