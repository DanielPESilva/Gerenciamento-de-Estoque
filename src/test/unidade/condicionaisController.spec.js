import CondicionaisController from '../../controllers/condicionaisController.js';
import CondicionaisService from '../../services/condicionaisService.js';

// Mock dos módulos
jest.mock('../../services/condicionaisService.js');
jest.mock('../../schemas/condicionaisSchema.js', () => ({
    create: {
        safeParse: jest.fn()
    },
    update: {
        safeParse: jest.fn()
    },
    devolverItem: {
        safeParse: jest.fn()
    },
    finalizarCondicional: {
        safeParse: jest.fn()
    },
    id: {
        safeParse: jest.fn()
    },
    converterVenda: {
        safeParse: jest.fn()
    }
}));

import CondicionaisSchema from '../../schemas/condicionaisSchema.js';

describe('CondicionaisController', () => {
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

    describe('listarCondicionais', () => {
        it('deve retornar lista de condicionais com sucesso', async () => {
            const mockCondicionais = [
                { id: 1, condicao: 'Novo', descricao: 'Produto novo' },
                { id: 2, condicao: 'Usado', descricao: 'Produto usado' }
            ];

            CondicionaisService.listarCondicionais.mockResolvedValue({
                success: true,
                message: 'Condicionais listadas com sucesso',
                data: mockCondicionais
            });

            await CondicionaisController.listarCondicionais(req, res);

            expect(CondicionaisService.listarCondicionais).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Condicionais listadas com sucesso',
                data: mockCondicionais
            });
        });

        it('deve retornar erro quando o serviço falha', async () => {
            CondicionaisService.listarCondicionais.mockResolvedValue({
                success: false,
                message: 'Erro ao buscar condicionais',
                code: 'FETCH_ERROR'
            });

            await CondicionaisController.listarCondicionais(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro ao buscar condicionais',
                code: 'FETCH_ERROR'
            });
        });

        it('deve tratar erro interno do servidor', async () => {
            CondicionaisService.listarCondicionais.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.listarCondicionais(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro interno do servidor: Erro interno',
                code: 'INTERNAL_SERVER_ERROR'
            });
        });
    });

    describe('buscarCondicionalPorId', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('deve retornar condicional por ID com sucesso', async () => {
            const mockCondicional = { id: 1, condicao: 'Novo', descricao: 'Produto novo' };

            CondicionaisService.buscarCondicionalPorId.mockResolvedValue({
                success: true,
                message: 'Condicional encontrada',
                data: mockCondicional
            });

            await CondicionaisController.buscarCondicionalPorId(req, res);

            expect(CondicionaisService.buscarCondicionalPorId).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Condicional encontrada',
                data: mockCondicional
            });
        });

        it('deve retornar 404 quando condicional não encontrada', async () => {
            CondicionaisService.buscarCondicionalPorId.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.buscarCondicionalPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('deve tratar erro interno do servidor', async () => {
            CondicionaisService.buscarCondicionalPorId.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.buscarCondicionalPorId(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro interno do servidor: Erro interno',
                code: 'INTERNAL_SERVER_ERROR'
            });
        });
    });

    describe('criarCondicional', () => {
        beforeEach(() => {
            req.body = {
                condicao: 'Novo',
                descricao: 'Produto novo'
            };
        });

        it('deve criar condicional com sucesso', async () => {
            const mockCondicional = { id: 1, condicao: 'Novo', descricao: 'Produto novo' };

            // Mock do schema validation
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.criarCondicional.mockResolvedValue({
                success: true,
                message: 'Condicional criada com sucesso',
                data: mockCondicional
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(CondicionaisSchema.create.safeParse).toHaveBeenCalledWith(req.body);
            expect(CondicionaisService.criarCondicional).toHaveBeenCalledWith(req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Condicional criada com sucesso',
                data: mockCondicional
            });
        });

        it('deve retornar erro quando o serviço falha', async () => {
            // Mock do schema validation
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.criarCondicional.mockResolvedValue({
                success: false,
                message: 'Condicional já existe',
                code: 'DUPLICATE_ENTRY'
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Condicional já existe',
                code: 'DUPLICATE_ENTRY'
            });
        });

        it('deve retornar erro de validação', async () => {
            // Mock do schema validation com erro
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [
                        { path: ['condicao'], message: 'Campo obrigatório' },
                        { path: ['descricao'], message: 'Campo obrigatório' }
                    ]
                }
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Dados inválidos',
                code: 'VALIDATION_ERROR',
                errors: [
                    { field: 'condicao', message: 'Campo obrigatório' },
                    { field: 'descricao', message: 'Campo obrigatório' }
                ]
            });
        });

        it('deve tratar erro interno do servidor', async () => {
            // Mock schema para lançar erro
            CondicionaisSchema.create.safeParse.mockImplementation(() => {
                throw new Error('Erro interno');
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro interno do servidor: Erro interno',
                code: 'INTERNAL_SERVER_ERROR'
            });
        });

        it('deve retornar 404 quando CLIENT_NOT_FOUND na criação', async () => {
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.criarCondicional.mockResolvedValue({
                success: false,
                message: 'Cliente não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Cliente não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });
        });

        it('deve retornar 404 quando ITEM_NOT_FOUND na criação', async () => {
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.criarCondicional.mockResolvedValue({
                success: false,
                message: 'Item não encontrado',
                code: 'ITEM_NOT_FOUND'
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Item não encontrado',
                code: 'ITEM_NOT_FOUND'
            });
        });

        it('deve retornar 409 quando INSUFFICIENT_STOCK na criação', async () => {
            CondicionaisSchema.create.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.criarCondicional.mockResolvedValue({
                success: false,
                message: 'Estoque insuficiente',
                code: 'INSUFFICIENT_STOCK'
            });

            await CondicionaisController.criarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Estoque insuficiente',
                code: 'INSUFFICIENT_STOCK'
            });
        });
    });

    describe('deletarCondicional', () => {
        beforeEach(() => {
            req.params = { id: '1' };
        });

        it('deve deletar condicional com sucesso', async () => {
            CondicionaisService.deletarCondicional.mockResolvedValue({
                success: true,
                message: 'Condicional deletada com sucesso'
            });

            await CondicionaisController.deletarCondicional(req, res);

            expect(CondicionaisService.deletarCondicional).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Condicional deletada com sucesso'
            });
        });

        it('deve retornar 404 quando condicional não encontrada', async () => {
            CondicionaisService.deletarCondicional.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.deletarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('deve tratar erro interno do servidor', async () => {
            CondicionaisService.deletarCondicional.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.deletarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro interno do servidor: Erro interno',
                code: 'INTERNAL_SERVER_ERROR'
            });
        });
    });

    describe('atualizarCondicional', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = { cliente_id: 2, devolvido: false };
        });

        it('deve atualizar condicional com sucesso', async () => {
            const mockCondicional = { id: 1, cliente_id: 2, devolvido: false };

            CondicionaisSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.atualizarCondicional.mockResolvedValue({
                success: true,
                message: 'Condicional atualizada com sucesso',
                data: mockCondicional
            });

            await CondicionaisController.atualizarCondicional(req, res);

            expect(CondicionaisService.atualizarCondicional).toHaveBeenCalledWith('1', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Condicional atualizada com sucesso',
                data: mockCondicional
            });
        });

        it('deve retornar 404 quando condicional não encontrada na atualização', async () => {
            CondicionaisSchema.update.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.atualizarCondicional.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.atualizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('deve retornar erro de validação na atualização', async () => {
            CondicionaisSchema.update.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [
                        { path: ['cliente_id'], message: 'ID deve ser um número válido' }
                    ]
                }
            });

            await CondicionaisController.atualizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Dados inválidos',
                code: 'VALIDATION_ERROR',
                errors: [
                    { field: 'cliente_id', message: 'ID deve ser um número válido' }
                ]
            });
        });

        it('deve tratar erro interno do servidor na atualização', async () => {
            CondicionaisSchema.update.safeParse.mockImplementation(() => {
                throw new Error('Erro interno');
            });

            await CondicionaisController.atualizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro interno do servidor: Erro interno',
                code: 'INTERNAL_SERVER_ERROR'
            });
        });
    });

    describe('devolverItem', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = { roupas_id: 1, quantidade: 2 };
        });

        it('deve devolver item com sucesso', async () => {
            CondicionaisSchema.devolverItem.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.devolverItem.mockResolvedValue({
                success: true,
                message: 'Item devolvido com sucesso',
                data: { devolvido: true }
            });

            await CondicionaisController.devolverItem(req, res);

            expect(CondicionaisService.devolverItem).toHaveBeenCalledWith('1', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Item devolvido com sucesso',
                data: { devolvido: true }
            });
        });

        it('deve retornar 404 quando condicional não encontrada na devolução', async () => {
            CondicionaisSchema.devolverItem.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.devolverItem.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.devolverItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deve retornar 404 quando item não está na condicional', async () => {
            CondicionaisSchema.devolverItem.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.devolverItem.mockResolvedValue({
                success: false,
                message: 'Item não encontrado na condicional',
                code: 'ITEM_NOT_IN_CONDICIONAL'
            });

            await CondicionaisController.devolverItem(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deve retornar erro de validação na devolução', async () => {
            CondicionaisSchema.devolverItem.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [
                        { path: ['quantidade'], message: 'Quantidade deve ser pelo menos 1' }
                    ]
                }
            });

            await CondicionaisController.devolverItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Dados inválidos',
                code: 'VALIDATION_ERROR',
                errors: [
                    { field: 'quantidade', message: 'Quantidade deve ser pelo menos 1' }
                ]
            });
        });

        it('deve tratar erro interno do servidor na devolução', async () => {
            CondicionaisSchema.devolverItem.safeParse.mockImplementation(() => {
                throw new Error('Erro interno');
            });

            await CondicionaisController.devolverItem(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('finalizarCondicional', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = { observacoes: 'Finalizado com sucesso' };
        });

        it('deve finalizar condicional com sucesso', async () => {
            CondicionaisSchema.finalizarCondicional.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.finalizarCondicional.mockResolvedValue({
                success: true,
                message: 'Condicional finalizada com sucesso',
                data: { finalizada: true }
            });

            await CondicionaisController.finalizarCondicional(req, res);

            expect(CondicionaisService.finalizarCondicional).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve finalizar condicional sem body', async () => {
            req.body = {};

            CondicionaisService.finalizarCondicional.mockResolvedValue({
                success: true,
                message: 'Condicional finalizada com sucesso',
                data: { finalizada: true }
            });

            await CondicionaisController.finalizarCondicional(req, res);

            expect(CondicionaisService.finalizarCondicional).toHaveBeenCalledWith('1');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar 404 quando condicional não encontrada na finalização', async () => {
            req.body = {};

            CondicionaisService.finalizarCondicional.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.finalizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deve retornar erro de validação na finalização', async () => {
            CondicionaisSchema.finalizarCondicional.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [
                        { path: ['observacoes'], message: 'Observações inválidas' }
                    ]
                }
            });

            await CondicionaisController.finalizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve tratar erro interno do servidor na finalização', async () => {
            req.body = {};

            CondicionaisService.finalizarCondicional.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.finalizarCondicional(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('obterEstatisticas', () => {
        beforeEach(() => {
            req.query = { data_inicio: '2024-01-01', data_fim: '2024-12-31' };
        });

        it('deve obter estatísticas com sucesso', async () => {
            const mockStats = { total: 10, ativas: 5, finalizadas: 5 };

            CondicionaisService.obterEstatisticas.mockResolvedValue({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: mockStats
            });

            await CondicionaisController.obterEstatisticas(req, res);

            expect(CondicionaisService.obterEstatisticas).toHaveBeenCalledWith(req.query);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: mockStats
            });
        });

        it('deve retornar erro do serviço ao obter estatísticas', async () => {
            CondicionaisService.obterEstatisticas.mockResolvedValue({
                success: false,
                message: 'Erro ao obter estatísticas',
                code: 'STATS_ERROR'
            });

            await CondicionaisController.obterEstatisticas(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('deve tratar erro interno do servidor ao obter estatísticas', async () => {
            CondicionaisService.obterEstatisticas.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.obterEstatisticas(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('converterEmVenda', () => {
        beforeEach(() => {
            req.params = { id: '1' };
            req.body = {
                itens_vendidos: 'todos',
                forma_pagamento: 'Pix',
                desconto: 0
            };
        });

        it('deve converter condicional em venda com sucesso', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            CondicionaisSchema.converterVenda.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.converterEmVenda.mockResolvedValue({
                success: true,
                message: 'Venda criada com sucesso',
                data: { venda_id: 1 }
            });

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('deve retornar erro de validação de ID na conversão', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [{ path: ['id'], message: 'ID inválido' }]
                }
            });

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'ID inválido',
                errors: [{ path: ['id'], message: 'ID inválido' }],
                code: 'INVALID_ID'
            });
        });

        it('deve retornar erro de validação de dados na conversão', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            CondicionaisSchema.converterVenda.safeParse.mockReturnValue({
                success: false,
                error: {
                    errors: [{ path: ['forma_pagamento'], message: 'Forma de pagamento inválida' }]
                }
            });

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Dados inválidos para conversão em venda',
                errors: [{ path: ['forma_pagamento'], message: 'Forma de pagamento inválida' }],
                code: 'INVALID_DATA'
            });
        });

        it('deve retornar 404 quando condicional não encontrada na conversão', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            CondicionaisSchema.converterVenda.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.converterEmVenda.mockResolvedValue({
                success: false,
                message: 'Condicional não encontrada',
                code: 'CONDICIONAL_NOT_FOUND'
            });

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        it('deve retornar 409 quando quantidade inválida na conversão', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            CondicionaisSchema.converterVenda.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.converterEmVenda.mockResolvedValue({
                success: false,
                message: 'Quantidade inválida',
                code: 'INVALID_QUANTITY'
            });

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });

        it('deve tratar erro interno do servidor na conversão', async () => {
            CondicionaisSchema.id.safeParse.mockReturnValue({
                success: true,
                data: { id: 1 }
            });

            CondicionaisSchema.converterVenda.safeParse.mockReturnValue({
                success: true,
                data: req.body
            });

            CondicionaisService.converterEmVenda.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.converterEmVenda(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('obterRelatorioAtivos', () => {
        beforeEach(() => {
            req.query = {
                cliente_id: '1',
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31',
                vencidos: 'true'
            };
        });

        it('deve obter relatório de ativos com sucesso', async () => {
            const mockRelatorio = [{ id: 1, cliente: 'João', ativo: true }];

            CondicionaisService.obterRelatorioAtivos.mockResolvedValue({
                success: true,
                message: 'Relatório obtido com sucesso',
                data: mockRelatorio
            });

            await CondicionaisController.obterRelatorioAtivos(req, res);

            expect(CondicionaisService.obterRelatorioAtivos).toHaveBeenCalledWith({
                cliente_id: 1,
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31',
                vencidos: true
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve tratar erro interno do servidor no relatório de ativos', async () => {
            CondicionaisService.obterRelatorioAtivos.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.obterRelatorioAtivos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('obterRelatorioDevolvidos', () => {
        beforeEach(() => {
            req.query = {
                cliente_id: '2',
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31'
            };
        });

        it('deve obter relatório de devolvidos com sucesso', async () => {
            const mockRelatorio = [{ id: 2, cliente: 'Maria', devolvido: true }];

            CondicionaisService.obterRelatorioDevolvidos.mockResolvedValue({
                success: true,
                message: 'Relatório obtido com sucesso',
                data: mockRelatorio
            });

            await CondicionaisController.obterRelatorioDevolvidos(req, res);

            expect(CondicionaisService.obterRelatorioDevolvidos).toHaveBeenCalledWith({
                cliente_id: 2,
                data_inicio: '2024-01-01',
                data_fim: '2024-12-31'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve tratar erro interno do servidor no relatório de devolvidos', async () => {
            CondicionaisService.obterRelatorioDevolvidos.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.obterRelatorioDevolvidos(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('atualizarStatusItens', () => {
        beforeEach(() => {
            req.body = {
                roupas_ids: [1, 2, 3],
                novo_status: 'disponivel'
            };
        });

        it('deve atualizar status dos itens com sucesso', async () => {
            CondicionaisService.atualizarStatusItens.mockResolvedValue({
                success: true,
                message: 'Status atualizado com sucesso',
                data: { updated: 3 }
            });

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(CondicionaisService.atualizarStatusItens).toHaveBeenCalledWith([1, 2, 3], 'disponivel');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('deve retornar erro quando roupas_ids não é array', async () => {
            req.body.roupas_ids = 'invalid';

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'roupas_ids deve ser um array não vazio',
                code: 'INVALID_ROUPAS_IDS'
            });
        });

        it('deve retornar erro quando roupas_ids é array vazio', async () => {
            req.body.roupas_ids = [];

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'roupas_ids deve ser um array não vazio',
                code: 'INVALID_ROUPAS_IDS'
            });
        });

        it('deve retornar erro quando novo_status não é fornecido', async () => {
            req.body.novo_status = '';

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'novo_status é obrigatório',
                code: 'MISSING_STATUS'
            });
        });

        it('deve tratar erro interno do servidor na atualização de status', async () => {
            CondicionaisService.atualizarStatusItens.mockRejectedValue(new Error('Erro interno'));

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it('deve retornar erro do serviço na atualização de status (linha 498)', async () => {
            req.body = {
                roupas_ids: [1, 2, 3],
                novo_status: 'disponivel'
            };

            CondicionaisService.atualizarStatusItens.mockResolvedValue({
                success: false,
                message: 'Erro ao atualizar status',
                code: 'UPDATE_ERROR'
            });

            await CondicionaisController.atualizarStatusItens(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro ao atualizar status',
                code: 'UPDATE_ERROR'
            });
        });
    });

    describe('obterRelatorioAtivos - error cases', () => {
        it('deve retornar erro do serviço no relatório de ativos (linha 409)', async () => {
            req.query = { cliente_id: '1' };

            CondicionaisService.obterRelatorioAtivos.mockResolvedValue({
                success: false,
                message: 'Erro ao obter relatório',
                code: 'REPORT_ERROR'
            });

            await CondicionaisController.obterRelatorioAtivos(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro ao obter relatório',
                code: 'REPORT_ERROR'
            });
        });
    });

    describe('obterRelatorioDevolvidos - error cases', () => {
        it('deve retornar erro do serviço no relatório de devolvidos (linha 451)', async () => {
            req.query = { cliente_id: '2' };

            CondicionaisService.obterRelatorioDevolvidos.mockResolvedValue({
                success: false,
                message: 'Erro ao obter relatório devolvidos',
                code: 'REPORT_ERROR'
            });

            await CondicionaisController.obterRelatorioDevolvidos(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Erro ao obter relatório devolvidos',
                code: 'REPORT_ERROR'
            });
        });
    });
});
