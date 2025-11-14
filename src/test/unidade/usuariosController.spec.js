import * as UsuariosController from '../../controllers/usuariosController.js';
import UsuariosService from '../../services/usuariosService.js';
import UsuariosSchema from '../../schemas/usuariosSchema.js';
import { APIError } from '../../utils/wrapException.js';

// Mock dos módulos
jest.mock('../../services/usuariosService.js');
jest.mock('../../schemas/usuariosSchema.js');

describe('UsuariosController', () => {
    let req, res;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };

        jest.clearAllMocks();
        console.error = jest.fn();
    });

    describe('getAll', () => {
        it('should get all users successfully', async () => {
            const mockUsers = [
                { id: 1, nome: 'João Silva', email: 'joao@teste.com' },
                { id: 2, nome: 'Maria Santos', email: 'maria@teste.com' }
            ];

            UsuariosSchema.query.safeParse.mockReturnValue({
                success: true,
                data: { page: 1, limit: 10 }
            });

            UsuariosService.getAllUsuarios.mockResolvedValue({
                data: mockUsers,
                pagination: { page: 1, limit: 10, total: 2 }
            });

            await UsuariosController.getAll(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers,
                pagination: { page: 1, limit: 10, total: 2 }
            });
        });

        it('should handle validation errors', async () => {
            const validationError = {
                success: false,
                error: { issues: [{ path: ['page'], message: 'Página deve ser um número positivo' }] }
            };

            UsuariosSchema.query.safeParse.mockReturnValue(validationError);

            await expect(UsuariosController.getAll(req, res)).rejects.toThrow(APIError);
        });
    });

    describe('getById', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should get user by id successfully', async () => {
            const mockUser = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosService.getUsuarioById.mockResolvedValue(mockUser);

            await UsuariosController.getById(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        it('should handle user not found', async () => {
            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosService.getUsuarioById.mockResolvedValue(null);

            await expect(UsuariosController.getById(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Usuário não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('create', () => {
        beforeEach(() => {
            req.body = {
                nome: 'João Silva',
                email: 'joao@teste.com',
                senha: 'password123'
            };
        });

        it('should create user successfully', async () => {
            const createdUser = { id: 1, ...req.body };

            UsuariosSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            UsuariosService.getUsuarioByEmail.mockResolvedValue(null);
            UsuariosService.createUsuario.mockResolvedValue(createdUser);

            await UsuariosController.create(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: createdUser
            });
        });

        it('should handle existing email error', async () => {
            UsuariosSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            UsuariosService.getUsuarioByEmail.mockResolvedValue({ id: 2, email: req.body.email });

            await expect(UsuariosController.create(req, res)).rejects.toThrow(
                new APIError([{ path: "email", message: "Email já está em uso por outro usuário" }], 400)
            );
        });
    });

    describe('patch', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = {
                nome: 'João Silva Atualizado'
            };
        });

        it('should update user successfully', async () => {
            const existingUser = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };
            const updatedUser = { id: 1, ...req.body, email: 'joao@teste.com' };

            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            UsuariosService.getUsuarioById.mockResolvedValue(existingUser);
            UsuariosService.updateUsuario.mockResolvedValue(updatedUser);

            await UsuariosController.patch(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser,
                message: "Usuário atualizado com sucesso"
            });
        });

        it('should handle user not found on update', async () => {
            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            UsuariosService.getUsuarioById.mockResolvedValue(null);

            await expect(UsuariosController.patch(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Usuário não encontrado com o ID informado" }], 404)
            );
        });
    });

    describe('deleteUser', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('should remove user successfully', async () => {
            const existingUser = { id: 1, nome: 'João Silva', email: 'joao@teste.com' };

            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosService.getUsuarioById.mockResolvedValue(existingUser);
            UsuariosService.deleteUsuario.mockResolvedValue(true);

            await UsuariosController.deleteUser(req, res);

            expect(res.status).toHaveBeenCalledWith(204);
            expect(res.send).toHaveBeenCalled();
        });

        it('should handle user not found on delete', async () => {
            UsuariosSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            UsuariosService.getUsuarioById.mockResolvedValue(null);

            await expect(UsuariosController.deleteUser(req, res)).rejects.toThrow(
                new APIError([{ path: "ID", message: "Usuário não encontrado com o ID informado" }], 404)
            );
        });
    });
});
