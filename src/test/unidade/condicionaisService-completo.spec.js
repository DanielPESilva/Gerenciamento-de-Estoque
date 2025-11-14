import CondicionaisService from '../../services/condicionaisService.js';
import CondicionaisRepository from '../../repository/condicionaisRepository.js';
import VendasService from '../../services/vendasService.js';

// Mock dos módulos
jest.mock('../../repository/condicionaisRepository.js');
jest.mock('../../services/vendasService.js');

describe('CondicionaisService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('listarCondicionais', () => {
        const mockCondicionais = {
            data: [{ id: 1, cliente_id: 1 }],
            total: 1,
            page: 1,
            limit: 10
        };

        it('should list condicionais successfully', async () => {
            CondicionaisRepository.getAllCondicionais.mockResolvedValue(mockCondicionais);

            const result = await CondicionaisService.listarCondicionais({});

            expect(result).toEqual({
                success: true,
                message: 'Condicionais listados com sucesso',
                data: mockCondicionais
            });
        });

        it('should apply cliente_id filter with valid ID', async () => {
            CondicionaisRepository.getAllCondicionais.mockResolvedValue(mockCondicionais);

            const query = { cliente_id: '123' };
            await CondicionaisService.listarCondicionais(query);

            expect(CondicionaisRepository.getAllCondicionais).toHaveBeenCalledWith(
                { cliente_id: 123 },
                {}
            );
        });

        it('should return error for invalid cliente_id', async () => {
            const query = { cliente_id: 'invalid' };
            const result = await CondicionaisService.listarCondicionais(query);

            expect(result).toEqual({
                success: false,
                message: 'ID do cliente deve ser um número válido',
                code: 'INVALID_CLIENT_ID'
            });
        });

        it('should apply devolvido filter', async () => {
            CondicionaisRepository.getAllCondicionais.mockResolvedValue(mockCondicionais);

            const query = { devolvido: 'true' };
            await CondicionaisService.listarCondicionais(query);

            expect(CondicionaisRepository.getAllCondicionais).toHaveBeenCalledWith(
                { devolvido: true },
                {}
            );
        });

        it('should apply date filters', async () => {
            CondicionaisRepository.getAllCondicionais.mockResolvedValue(mockCondicionais);

            const query = { data_inicio: '2023-01-01', data_fim: '2023-01-31' };
            await CondicionaisService.listarCondicionais(query);

            expect(CondicionaisRepository.getAllCondicionais).toHaveBeenCalledWith(
                { data_inicio: '2023-01-01', data_fim: '2023-01-31' },
                {}
            );
        });

        it('should apply pagination with valid values', async () => {
            CondicionaisRepository.getAllCondicionais.mockResolvedValue(mockCondicionais);

            const query = { page: '2', limit: '20' };
            await CondicionaisService.listarCondicionais(query);

            expect(CondicionaisRepository.getAllCondicionais).toHaveBeenCalledWith(
                {},
                { page: 2, limit: 20 }
            );
        });

        it('should return error for invalid page', async () => {
            const query = { page: '0' };
            const result = await CondicionaisService.listarCondicionais(query);

            expect(result).toEqual({
                success: false,
                message: 'Número da página deve ser um número positivo',
                code: 'INVALID_PAGE'
            });
        });

        it('should return error for invalid limit', async () => {
            const query = { limit: '101' };
            const result = await CondicionaisService.listarCondicionais(query);

            expect(result).toEqual({
                success: false,
                message: 'Limite deve ser um número entre 1 e 100',
                code: 'INVALID_LIMIT'
            });
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.getAllCondicionais.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.listarCondicionais({});

            expect(result).toEqual({
                success: false,
                message: 'Erro ao listar condicionais: Database error',
                code: 'LIST_ERROR'
            });
        });
    });

    describe('buscarCondicionalPorId', () => {
        const mockCondicional = { id: 1, cliente_id: 1, devolvido: false };

        it('should find condicional by valid ID', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);

            const result = await CondicionaisService.buscarCondicionalPorId('1');

            expect(result).toEqual({
                success: true,
                message: 'Condicional encontrado com sucesso',
                data: mockCondicional
            });
        });

        it('should return error for invalid ID', async () => {
            const result = await CondicionaisService.buscarCondicionalPorId('invalid');

            expect(result).toEqual({
                success: false,
                message: 'ID do condicional deve ser um número válido',
                code: 'INVALID_ID'
            });
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(null);

            const result = await CondicionaisService.buscarCondicionalPorId('999');

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.getCondicionalById.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.buscarCondicionalPorId('1');

            expect(result).toEqual({
                success: false,
                message: 'Erro ao buscar condicional: Database error',
                code: 'SEARCH_ERROR'
            });
        });
    });

    describe('criarCondicional', () => {
        // Mock da data atual para testes consistentes
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-01'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const validCondicionalData = {
            cliente_id: 1,
            data_devolucao: '2023-01-15',
            itens: [
                { roupas_id: 1, quantidade: 2 },
                { nome_item: 'Camisa', quantidade: 1 }
            ]
        };

        const mockNovoCondicional = { id: 1, ...validCondicionalData };

        it('should create condicional successfully', async () => {
            CondicionaisRepository.createCondicional.mockResolvedValue(mockNovoCondicional);

            const result = await CondicionaisService.criarCondicional(validCondicionalData);

            expect(result).toEqual({
                success: true,
                message: 'Condicional criado com sucesso',
                data: mockNovoCondicional
            });
        });

        it('should return error for past return date', async () => {
            const invalidData = {
                ...validCondicionalData,
                data_devolucao: '2022-12-31'
            };

            const result = await CondicionaisService.criarCondicional(invalidData);

            expect(result).toEqual({
                success: false,
                message: 'Data de devolução não pode ser no passado',
                code: 'INVALID_RETURN_DATE'
            });
        });

        it('should return error for no items', async () => {
            const invalidData = {
                ...validCondicionalData,
                itens: []
            };

            const result = await CondicionaisService.criarCondicional(invalidData);

            expect(result).toEqual({
                success: false,
                message: 'É necessário informar pelo menos um item para o condicional',
                code: 'NO_ITEMS'
            });
        });

        it('should return error for invalid item quantity', async () => {
            const invalidData = {
                ...validCondicionalData,
                itens: [{ roupas_id: 1, quantidade: 0 }]
            };

            const result = await CondicionaisService.criarCondicional(invalidData);

            expect(result).toEqual({
                success: false,
                message: 'Quantidade do item 1 deve ser maior que zero',
                code: 'INVALID_QUANTITY'
            });
        });

        it('should return error for missing item identifier', async () => {
            const invalidData = {
                ...validCondicionalData,
                itens: [{ quantidade: 1 }]
            };

            const result = await CondicionaisService.criarCondicional(invalidData);

            expect(result).toEqual({
                success: false,
                message: 'Item 1 deve ter ID ou nome informado',
                code: 'MISSING_ITEM_IDENTIFIER'
            });
        });

        it('should handle client not found error', async () => {
            CondicionaisRepository.createCondicional.mockRejectedValue(
                new Error('Cliente com ID 999 não encontrado')
            );

            const result = await CondicionaisService.criarCondicional(validCondicionalData);

            expect(result).toEqual({
                success: false,
                message: 'Cliente com ID 999 não encontrado',
                code: 'CLIENT_NOT_FOUND'
            });
        });

        it('should handle item not found error', async () => {
            CondicionaisRepository.createCondicional.mockRejectedValue(
                new Error('Item não encontrado com ID 999')
            );

            const result = await CondicionaisService.criarCondicional(validCondicionalData);

            expect(result).toEqual({
                success: false,
                message: 'Item não encontrado com ID 999',
                code: 'ITEM_NOT_FOUND'
            });
        });

        it('should handle insufficient stock error', async () => {
            CondicionaisRepository.createCondicional.mockRejectedValue(
                new Error('Estoque insuficiente para Camisa')
            );

            const result = await CondicionaisService.criarCondicional(validCondicionalData);

            expect(result).toEqual({
                success: false,
                message: 'Estoque insuficiente para Camisa',
                code: 'INSUFFICIENT_STOCK'
            });
        });

        it('should handle generic errors', async () => {
            CondicionaisRepository.createCondicional.mockRejectedValue(new Error('Generic error'));

            const result = await CondicionaisService.criarCondicional(validCondicionalData);

            expect(result).toEqual({
                success: false,
                message: 'Erro ao criar condicional: Generic error',
                code: 'CREATE_ERROR'
            });
        });
    });

    describe('atualizarCondicional', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-01'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const mockCondicional = { id: 1, devolvido: false };
        const mockCondicionalAtualizado = { id: 1, data_devolucao: '2023-01-15' };

        it('should update condicional successfully', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.updateCondicional.mockResolvedValue(mockCondicionalAtualizado);

            const updateData = { data_devolucao: '2023-01-15' };
            const result = await CondicionaisService.atualizarCondicional('1', updateData);

            expect(result).toEqual({
                success: true,
                message: 'Condicional atualizado com sucesso',
                data: mockCondicionalAtualizado
            });
        });

        it('should return error for invalid ID', async () => {
            const result = await CondicionaisService.atualizarCondicional('invalid', {});

            expect(result).toEqual({
                success: false,
                message: 'ID do condicional deve ser um número válido',
                code: 'INVALID_ID'
            });
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(null);

            const result = await CondicionaisService.atualizarCondicional('999', {});

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should return error for already returned condicional', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue({ id: 1, devolvido: true });

            const result = await CondicionaisService.atualizarCondicional('1', {});

            expect(result).toEqual({
                success: false,
                message: 'Não é possível atualizar um condicional já devolvido',
                code: 'CONDICIONAL_ALREADY_RETURNED'
            });
        });

        it('should return error for past return date', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);

            const updateData = { data_devolucao: '2022-12-31' };
            const result = await CondicionaisService.atualizarCondicional('1', updateData);

            expect(result).toEqual({
                success: false,
                message: 'Data de devolução não pode ser no passado',
                code: 'INVALID_RETURN_DATE'
            });
        });

        it('should return error for invalid cliente_id', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);

            const updateData = { cliente_id: 'invalid' };
            const result = await CondicionaisService.atualizarCondicional('1', updateData);

            expect(result).toEqual({
                success: false,
                message: 'ID do cliente deve ser um número válido',
                code: 'INVALID_CLIENT_ID'
            });
        });

        it('should handle Prisma P2025 error', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.updateCondicional.mockRejectedValue({ code: 'P2025' });

            const result = await CondicionaisService.atualizarCondicional('1', {});

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should handle generic errors', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.updateCondicional.mockRejectedValue(new Error('Generic error'));

            const result = await CondicionaisService.atualizarCondicional('1', {});

            expect(result).toEqual({
                success: false,
                message: 'Erro ao atualizar condicional: Generic error',
                code: 'UPDATE_ERROR'
            });
        });
    });

    describe('devolverItem', () => {
        const mockCondicional = { id: 1, devolvido: false };
        const mockResultado = { quantidadeDevolvida: 2, itensRestantes: 1 };

        it('should return item successfully', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.devolverItem.mockResolvedValue(mockResultado);

            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: true,
                message: 'Item devolvido com sucesso. Quantidade devolvida: 2. Itens restantes no condicional: 1',
                data: mockResultado
            });
        });

        it('should return error for invalid condicional ID', async () => {
            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('invalid', itemData);

            expect(result).toEqual({
                success: false,
                message: 'ID do condicional deve ser um número válido',
                code: 'INVALID_ID'
            });
        });

        it('should return error for invalid item ID', async () => {
            const itemData = { roupas_id: 'invalid', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'ID do item deve ser um número válido',
                code: 'INVALID_ITEM_ID'
            });
        });

        it('should return error for invalid quantity', async () => {
            const itemData = { roupas_id: '1', quantidade: '0' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Quantidade deve ser um número maior que zero',
                code: 'INVALID_QUANTITY'
            });
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(null);

            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('999', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should return error for already returned condicional', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue({ id: 1, devolvido: true });

            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Condicional já foi devolvido completamente',
                code: 'CONDICIONAL_ALREADY_RETURNED'
            });
        });

        it('should handle item not in condicional error', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.devolverItem.mockRejectedValue(
                new Error('Item não encontrado no condicional')
            );

            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Item não encontrado neste condicional',
                code: 'ITEM_NOT_IN_CONDICIONAL'
            });
        });

        it('should handle invalid return quantity error', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.devolverItem.mockRejectedValue(
                new Error('Quantidade a devolver (5) é maior que disponível (3)')
            );

            const itemData = { roupas_id: '1', quantidade: '5' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Quantidade a devolver (5) é maior que disponível (3)',
                code: 'INVALID_RETURN_QUANTITY'
            });
        });

        it('should handle generic errors', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.devolverItem.mockRejectedValue(new Error('Generic error'));

            const itemData = { roupas_id: '1', quantidade: '2' };
            const result = await CondicionaisService.devolverItem('1', itemData);

            expect(result).toEqual({
                success: false,
                message: 'Erro ao devolver item: Generic error',
                code: 'RETURN_ERROR'
            });
        });
    });

    describe('finalizarCondicional', () => {
        const mockCondicional = { id: 1, devolvido: false };
        const mockCondicionalFinalizado = { id: 1, devolvido: true };

        it('should finalize condicional successfully', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.finalizarCondicional.mockResolvedValue(mockCondicionalFinalizado);

            const result = await CondicionaisService.finalizarCondicional('1');

            expect(result).toEqual({
                success: true,
                message: 'Condicional finalizado com sucesso. Todos os itens foram devolvidos ao estoque',
                data: mockCondicionalFinalizado
            });
        });

        it('should return error for invalid ID', async () => {
            const result = await CondicionaisService.finalizarCondicional('invalid');

            expect(result).toEqual({
                success: false,
                message: 'ID do condicional deve ser um número válido',
                code: 'INVALID_ID'
            });
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(null);

            const result = await CondicionaisService.finalizarCondicional('999');

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should return error for already finalized condicional', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue({ id: 1, devolvido: true });

            const result = await CondicionaisService.finalizarCondicional('1');

            expect(result).toEqual({
                success: false,
                message: 'Condicional já foi finalizado',
                code: 'CONDICIONAL_ALREADY_FINALIZED'
            });
        });

        it('should handle no items to finalize error', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.finalizarCondicional.mockRejectedValue(
                new Error('Condicional não possui itens ou já foi finalizado')
            );

            const result = await CondicionaisService.finalizarCondicional('1');

            expect(result).toEqual({
                success: false,
                message: 'Condicional não possui itens para finalizar ou já foi finalizado',
                code: 'NO_ITEMS_TO_FINALIZE'
            });
        });

        it('should handle generic errors', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.finalizarCondicional.mockRejectedValue(new Error('Generic error'));

            const result = await CondicionaisService.finalizarCondicional('1');

            expect(result).toEqual({
                success: false,
                message: 'Erro ao finalizar condicional: Generic error',
                code: 'FINALIZE_ERROR'
            });
        });
    });

    describe('deletarCondicional', () => {
        const mockCondicional = { id: 1, devolvido: false };

        it('should delete condicional successfully', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.deleteCondicional.mockResolvedValue(undefined);

            const result = await CondicionaisService.deletarCondicional('1');

            expect(result).toEqual({
                success: true,
                message: 'Condicional deletado com sucesso. Estoque foi restaurado',
                data: { id: 1 }
            });
        });

        it('should return error for invalid ID', async () => {
            const result = await CondicionaisService.deletarCondicional('invalid');

            expect(result).toEqual({
                success: false,
                message: 'ID do condicional deve ser um número válido',
                code: 'INVALID_ID'
            });
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(null);

            const result = await CondicionaisService.deletarCondicional('999');

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should handle Prisma P2025 error', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.deleteCondicional.mockRejectedValue({ code: 'P2025' });

            const result = await CondicionaisService.deletarCondicional('1');

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should handle generic errors', async () => {
            CondicionaisRepository.getCondicionalById.mockResolvedValue(mockCondicional);
            CondicionaisRepository.deleteCondicional.mockRejectedValue(new Error('Generic error'));

            const result = await CondicionaisService.deletarCondicional('1');

            expect(result).toEqual({
                success: false,
                message: 'Erro ao deletar condicional: Generic error',
                code: 'DELETE_ERROR'
            });
        });
    });

    describe('obterEstatisticas', () => {
        const mockStats = {
            total_condicionais: 10,
            condicionais_ativos: 3,
            condicionais_devolvidos: 7
        };

        it('should get statistics successfully', async () => {
            CondicionaisRepository.getCondicionaisStats.mockResolvedValue(mockStats);

            const result = await CondicionaisService.obterEstatisticas({});

            expect(result).toEqual({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: mockStats
            });
        });

        it('should apply date filters', async () => {
            CondicionaisRepository.getCondicionaisStats.mockResolvedValue(mockStats);

            const query = { data_inicio: '2023-01-01', data_fim: '2023-01-31' };
            await CondicionaisService.obterEstatisticas(query);

            expect(CondicionaisRepository.getCondicionaisStats).toHaveBeenCalledWith({
                data_inicio: '2023-01-01',
                data_fim: '2023-01-31'
            });
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.getCondicionaisStats.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.obterEstatisticas({});

            expect(result).toEqual({
                success: false,
                message: 'Erro ao obter estatísticas: Database error',
                code: 'STATS_ERROR'
            });
        });
    });

    describe('converterEmVenda', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-01'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const mockCondicional = {
            id: 1,
            devolvido: false,
            Cliente: { nome: 'João Silva', telefone: '11999999999' },
            CondicionaisItens: [
                {
                    roupas_id: 1,
                    quatidade: 2,
                    Roupa: { id: 1, nome: 'Camisa', preco: 50.00 }
                },
                {
                    roupas_id: 2,
                    quatidade: 1,
                    Roupa: { id: 2, nome: 'Calça', preco: 80.00 }
                }
            ]
        };

        const mockVenda = { id: 1, valor_total: 180.00 };

        it('should convert all items to sale successfully', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(mockCondicional);
            VendasService.createVenda.mockResolvedValue(mockVenda);
            CondicionaisRepository.finalizarCondicional.mockResolvedValue({ id: 1, devolvido: true });
            CondicionaisRepository.buscarPorId.mockResolvedValueOnce(mockCondicional); // segunda chamada

            const dadosVenda = {
                itens_vendidos: 'todos',
                forma_pagamento: 'dinheiro',
                desconto: 10
            };

            const result = await CondicionaisService.converterEmVenda(1, dadosVenda);

            expect(result.success).toBe(true);
            expect(result.data.resumo.valor_total_venda).toBe(180);
            expect(result.data.resumo.desconto_aplicado).toBe(10);
            expect(result.data.resumo.valor_final).toBe(170);
            expect(result.data.resumo.condicional_finalizado).toBe(true);
        });

        it('should convert specific items to sale', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(mockCondicional);
            VendasService.createVenda.mockResolvedValue(mockVenda);
            CondicionaisRepository.atualizarItensCondicional.mockResolvedValue(undefined);
            CondicionaisRepository.devolverItemAoEstoque.mockResolvedValue(undefined);
            CondicionaisRepository.buscarPorId.mockResolvedValueOnce(mockCondicional); // segunda chamada

            const dadosVenda = {
                itens_vendidos: [
                    { roupas_id: 1, quantidade: 1 }
                ],
                forma_pagamento: 'cartao'
            };

            const result = await CondicionaisService.converterEmVenda(1, dadosVenda);

            expect(result.success).toBe(true);
            expect(result.data.resumo.condicional_finalizado).toBe(false);
        });

        it('should return error when condicional not found', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(null);

            const result = await CondicionaisService.converterEmVenda(999, {});

            expect(result).toEqual({
                success: false,
                message: 'Condicional não encontrado',
                code: 'CONDICIONAL_NOT_FOUND'
            });
        });

        it('should return error for already finished condicional', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue({ ...mockCondicional, devolvido: true });

            const result = await CondicionaisService.converterEmVenda(1, {});

            expect(result).toEqual({
                success: false,
                message: 'Condicional já foi finalizado',
                code: 'CONDICIONAL_ALREADY_FINISHED'
            });
        });

        it('should return error when item not in condicional', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(mockCondicional);

            const dadosVenda = {
                itens_vendidos: [
                    { roupas_id: 999, quantidade: 1 }
                ]
            };

            const result = await CondicionaisService.converterEmVenda(1, dadosVenda);

            expect(result).toEqual({
                success: false,
                message: 'Item 999 não encontrado no condicional',
                code: 'ITEM_NOT_IN_CONDICIONAL'
            });
        });

        it('should return error for invalid quantity', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(mockCondicional);

            const dadosVenda = {
                itens_vendidos: [
                    { roupas_id: 1, quantidade: 5 }
                ]
            };

            const result = await CondicionaisService.converterEmVenda(1, dadosVenda);

            expect(result).toEqual({
                success: false,
                message: 'Quantidade solicitada (5) maior que disponível (2) para item Camisa',
                code: 'INVALID_QUANTITY'
            });
        });

        it('should handle conversion errors', async () => {
            CondicionaisRepository.buscarPorId.mockResolvedValue(mockCondicional);
            VendasService.createVenda.mockRejectedValue(new Error('Sale creation failed'));

            const dadosVenda = { itens_vendidos: 'todos', forma_pagamento: 'dinheiro' };
            const result = await CondicionaisService.converterEmVenda(1, dadosVenda);

            expect(result).toEqual({
                success: false,
                message: 'Erro ao converter condicional em venda: Sale creation failed',
                code: 'CONVERSION_ERROR'
            });
        });
    });

    describe('obterRelatorioAtivos', () => {
        beforeEach(() => {
            jest.useFakeTimers();
            jest.setSystemTime(new Date('2023-01-10'));
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        const mockRelatorio = {
            estatisticas: { total_ativos: 2, valor_total: 200 },
            condicionais: [
                {
                    id: 1,
                    data: new Date('2023-01-01'),
                    data_devolucao: new Date('2023-01-15'),
                    Cliente: { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                    CondicionaisItens: [
                        {
                            id: 1,
                            quatidade: 2,
                            Roupa: { id: 1, nome: 'Camisa', tipo: 'camisa', tamanho: 'M', cor: 'azul', preco: 50 }
                        }
                    ]
                }
            ]
        };

        it('should get active condicionais report successfully', async () => {
            CondicionaisRepository.relatorioCondicionaisAtivos.mockResolvedValue(mockRelatorio);

            const result = await CondicionaisService.obterRelatorioAtivos();

            expect(result.success).toBe(true);
            expect(result.data.resumo).toEqual(mockRelatorio.estatisticas);
            expect(result.data.condicionais).toHaveLength(1);
            expect(result.data.condicionais[0].dias_restantes).toBe(5);
            expect(result.data.condicionais[0].status).toBe('ativo');
        });

        it('should calculate expired status correctly', async () => {
            const mockRelatorioVencido = {
                ...mockRelatorio,
                condicionais: [{
                    ...mockRelatorio.condicionais[0],
                    data_devolucao: new Date('2023-01-05') // Data no passado
                }]
            };

            CondicionaisRepository.relatorioCondicionaisAtivos.mockResolvedValue(mockRelatorioVencido);

            const result = await CondicionaisService.obterRelatorioAtivos();

            expect(result.data.condicionais[0].status).toBe('vencido');
        });

        it('should apply filters', async () => {
            CondicionaisRepository.relatorioCondicionaisAtivos.mockResolvedValue(mockRelatorio);

            const filtros = { cliente_id: 1 };
            await CondicionaisService.obterRelatorioAtivos(filtros);

            expect(CondicionaisRepository.relatorioCondicionaisAtivos).toHaveBeenCalledWith(filtros);
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.relatorioCondicionaisAtivos.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.obterRelatorioAtivos();

            expect(result).toEqual({
                success: false,
                message: 'Erro ao obter relatório de condicionais ativos: Database error',
                code: 'REPORT_ERROR'
            });
        });
    });

    describe('obterRelatorioDevolvidos', () => {
        const mockRelatorio = {
            estatisticas: { total_devolvidos: 1, valor_total_devolvido: 100 },
            condicionais: [
                {
                    id: 1,
                    data: new Date('2023-01-01'),
                    data_devolucao: new Date('2023-01-15'),
                    devolvido: true,
                    Cliente: { id: 1, nome: 'João', email: 'joao@email.com', telefone: '11999999999' },
                    CondicionaisItens: [
                        {
                            id: 1,
                            quatidade: 2,
                            Roupa: { id: 1, nome: 'Camisa', tipo: 'camisa', tamanho: 'M', cor: 'azul', preco: 50 }
                        }
                    ]
                }
            ]
        };

        it('should get returned condicionais report successfully', async () => {
            CondicionaisRepository.relatorioCondicionaisDevolvidos.mockResolvedValue(mockRelatorio);

            const result = await CondicionaisService.obterRelatorioDevolvidos();

            expect(result.success).toBe(true);
            expect(result.data.resumo).toEqual(mockRelatorio.estatisticas);
            expect(result.data.condicionais).toHaveLength(1);
        });

        it('should apply filters', async () => {
            CondicionaisRepository.relatorioCondicionaisDevolvidos.mockResolvedValue(mockRelatorio);

            const filtros = { data_inicio: '2023-01-01', data_fim: '2023-01-31' };
            await CondicionaisService.obterRelatorioDevolvidos(filtros);

            expect(CondicionaisRepository.relatorioCondicionaisDevolvidos).toHaveBeenCalledWith(filtros);
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.relatorioCondicionaisDevolvidos.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.obterRelatorioDevolvidos();

            expect(result).toEqual({
                success: false,
                message: 'Erro ao obter relatório de condicionais devolvidos: Database error',
                code: 'REPORT_ERROR'
            });
        });
    });

    describe('atualizarStatusItens', () => {
        const roupasIds = [1, 2, 3];
        const mockResultado = [
            { id: 1, nome: 'Camisa', status_anterior: 'disponivel', status_novo: 'em_condicional' },
            { id: 2, nome: 'Calça', status_anterior: 'disponivel', status_novo: 'em_condicional' }
        ];

        it('should update items status successfully', async () => {
            CondicionaisRepository.atualizarStatusItens.mockResolvedValue(mockResultado);

            const result = await CondicionaisService.atualizarStatusItens(roupasIds, 'em_condicional');

            expect(result).toEqual({
                success: true,
                message: 'Status de 2 item(ns) atualizado(s) com sucesso',
                data: {
                    itens_atualizados: mockResultado,
                    novo_status: 'em_condicional'
                }
            });
        });

        it('should return error for invalid status', async () => {
            const result = await CondicionaisService.atualizarStatusItens(roupasIds, 'status_invalido');

            expect(result).toEqual({
                success: false,
                message: 'Status inválido. Valores permitidos: disponivel, em_condicional, vendido',
                code: 'INVALID_STATUS'
            });
        });

        it('should handle repository errors', async () => {
            CondicionaisRepository.atualizarStatusItens.mockRejectedValue(new Error('Database error'));

            const result = await CondicionaisService.atualizarStatusItens(roupasIds, 'disponivel');

            expect(result).toEqual({
                success: false,
                message: 'Erro ao atualizar status dos itens: Database error',
                code: 'STATUS_UPDATE_ERROR'
            });
        });
    });
});