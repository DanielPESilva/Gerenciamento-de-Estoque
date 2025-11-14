import BaixaService from '../../services/baixaService.js';
import BaixaRepository from '../../repository/baixaRepository.js';

// Mock do BaixaRepository
jest.mock('../../repository/baixaRepository.js');

describe('BaixaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock console methods
        console.log = jest.fn();
        console.error = jest.fn();
    });

    // Mock data
    const mockBaixa = {
        id: 1,
        roupa_id: 1,
        quantidade: 5,
        motivo: 'Perda',
        observacao: 'Item danificado',
        data_baixa: new Date('2024-01-15'),
        Roupa: {
            id: 1,
            nome: 'Camisa Polo',
            tipo: 'Camisa',
            tamanho: 'M',
            cor: 'Azul',
            preco: 50.00,
            quantidade: 95
        }
    };

    const mockBaixaCompleta = {
        id: 1,
        roupa_id: 1,
        quantidade: 5,
        motivo: 'Perda',
        observacao: 'Item danificado',
        data_baixa: new Date('2024-01-15'),
        Roupa: {
            id: 1,
            nome: 'Camisa Polo',
            tipo: 'Camisa',
            tamanho: 'M',
            cor: 'Azul',
            preco: 50.00,
            quantidade: 95
        }
    };

    const validDadosBaixa = {
        roupa_id: 1,
        quantidade: 5,
        motivo: 'Perda',
        observacao: 'Item danificado'
    };

    describe('listarBaixas', () => {
        it('should list baixas with formatted data successfully', async () => {
            const mockResultado = {
                data: [mockBaixaCompleta],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1
                }
            };

            BaixaRepository.getAllBaixas.mockResolvedValue(mockResultado);

            const result = await BaixaService.listarBaixas({}, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe(1);
            expect(result.data[0].Roupa.nome).toBe('Camisa Polo');
            expect(result.pagination.total).toBe(1);
            expect(BaixaRepository.getAllBaixas).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
            expect(console.log).toHaveBeenCalledWith('Service - Filters:', {});
        });

        it('should handle empty result from repository', async () => {
            BaixaRepository.getAllBaixas.mockResolvedValue(null);

            const result = await BaixaService.listarBaixas({}, { page: 1, limit: 10 });

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(10);
        });

        it('should handle baixas without Roupa data', async () => {
            const baixaSemRoupa = { ...mockBaixaCompleta, Roupa: null };
            const mockResultado = {
                data: [baixaSemRoupa],
                pagination: {
                    page: 1,
                    limit: 10,
                    total: 1,
                    totalPages: 1
                }
            };

            BaixaRepository.getAllBaixas.mockResolvedValue(mockResultado);

            const result = await BaixaService.listarBaixas({}, { page: 1, limit: 10 });

            expect(result.data[0].Roupa).toBeNull();
        });

        it('should handle repository errors', async () => {
            BaixaRepository.getAllBaixas.mockRejectedValue(new Error('Database error'));

            await expect(BaixaService.listarBaixas({}, {})).rejects.toThrow('Erro ao listar baixas: Database error');
            expect(console.error).toHaveBeenCalledWith('Service Error:', expect.any(Error));
        });
    });

    describe('buscarBaixaPorId', () => {
        it('should find baixa by id successfully', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(mockBaixaCompleta);

            const result = await BaixaService.buscarBaixaPorId(1);

            expect(result.id).toBe(1);
            expect(result.Roupa.nome).toBe('Camisa Polo');
            expect(result.quantidade).toBe(5);
            expect(BaixaRepository.getBaixaById).toHaveBeenCalledWith(1);
        });

        it('should throw error when baixa not found', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(null);

            await expect(BaixaService.buscarBaixaPorId(999)).rejects.toThrow('Erro ao buscar baixa: Baixa não encontrada');
        });

        it('should handle baixa without Roupa data', async () => {
            const baixaSemRoupa = { ...mockBaixaCompleta, Roupa: null };
            BaixaRepository.getBaixaById.mockResolvedValue(baixaSemRoupa);

            const result = await BaixaService.buscarBaixaPorId(1);

            expect(result.Roupa).toBeNull();
        });

        it('should handle repository errors', async () => {
            BaixaRepository.getBaixaById.mockRejectedValue(new Error('Database error'));

            await expect(BaixaService.buscarBaixaPorId(1)).rejects.toThrow('Erro ao buscar baixa: Database error');
        });
    });

    describe('criarBaixa', () => {
        it('should create baixa successfully when stock is sufficient', async () => {
            const mockVerificacao = {
                exists: true,
                hasStock: true,
                currentStock: 100
            };

            BaixaRepository.verificarEstoque.mockResolvedValue(mockVerificacao);
            BaixaRepository.createBaixa.mockResolvedValue(mockBaixaCompleta);

            const result = await BaixaService.criarBaixa(validDadosBaixa);

            expect(result.id).toBe(1);
            expect(result.quantidade).toBe(5);
            expect(result.motivo).toBe('Perda');
            expect(BaixaRepository.verificarEstoque).toHaveBeenCalledWith(1, 5);
            expect(BaixaRepository.createBaixa).toHaveBeenCalledWith(validDadosBaixa);
        });

        it('should throw error when roupa not found', async () => {
            const mockVerificacao = {
                exists: false,
                hasStock: false,
                currentStock: 0
            };

            BaixaRepository.verificarEstoque.mockResolvedValue(mockVerificacao);

            await expect(BaixaService.criarBaixa(validDadosBaixa)).rejects.toThrow('Erro ao criar baixa: Roupa não encontrada');
        });

        it('should throw error when insufficient stock', async () => {
            const mockVerificacao = {
                exists: true,
                hasStock: false,
                currentStock: 3
            };

            BaixaRepository.verificarEstoque.mockResolvedValue(mockVerificacao);

            await expect(BaixaService.criarBaixa(validDadosBaixa)).rejects.toThrow('Erro ao criar baixa: Estoque insuficiente. Disponível: 3, Solicitado: 5');
        });

        it('should handle verificarEstoque errors', async () => {
            BaixaRepository.verificarEstoque.mockRejectedValue(new Error('Stock check failed'));

            await expect(BaixaService.criarBaixa(validDadosBaixa)).rejects.toThrow('Erro ao criar baixa: Stock check failed');
        });

        it('should handle createBaixa errors', async () => {
            const mockVerificacao = {
                exists: true,
                hasStock: true,
                currentStock: 100
            };

            BaixaRepository.verificarEstoque.mockResolvedValue(mockVerificacao);
            BaixaRepository.createBaixa.mockRejectedValue(new Error('Create failed'));

            await expect(BaixaService.criarBaixa(validDadosBaixa)).rejects.toThrow('Erro ao criar baixa: Create failed');
        });
    });

    describe('atualizarBaixa', () => {
        it('should update baixa successfully', async () => {
            const dadosAtualizacao = { observacao: 'Observação atualizada' };
            const baixaAtualizada = { ...mockBaixaCompleta, observacao: 'Observação atualizada' };

            BaixaRepository.getBaixaById.mockResolvedValue(mockBaixaCompleta);
            BaixaRepository.updateBaixa.mockResolvedValue(baixaAtualizada);

            const result = await BaixaService.atualizarBaixa(1, dadosAtualizacao);

            expect(result.observacao).toBe('Observação atualizada');
            expect(BaixaRepository.getBaixaById).toHaveBeenCalledWith(1);
            expect(BaixaRepository.updateBaixa).toHaveBeenCalledWith(1, dadosAtualizacao);
        });

        it('should throw error when baixa not found', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(null);

            await expect(BaixaService.atualizarBaixa(999, {})).rejects.toThrow('Erro ao atualizar baixa: Baixa não encontrada');
        });

        it('should handle getBaixaById errors', async () => {
            BaixaRepository.getBaixaById.mockRejectedValue(new Error('Get failed'));

            await expect(BaixaService.atualizarBaixa(1, {})).rejects.toThrow('Erro ao atualizar baixa: Get failed');
        });

        it('should handle updateBaixa errors', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(mockBaixaCompleta);
            BaixaRepository.updateBaixa.mockRejectedValue(new Error('Update failed'));

            await expect(BaixaService.atualizarBaixa(1, {})).rejects.toThrow('Erro ao atualizar baixa: Update failed');
        });
    });

    describe('deletarBaixa', () => {
        it('should delete baixa successfully', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(mockBaixaCompleta);
            BaixaRepository.deleteBaixa.mockResolvedValue();

            const result = await BaixaService.deletarBaixa(1);

            expect(result.message).toBe('Baixa deletada com sucesso');
            expect(result.estoque_restaurado).toBe(5);
            expect(BaixaRepository.getBaixaById).toHaveBeenCalledWith(1);
            expect(BaixaRepository.deleteBaixa).toHaveBeenCalledWith(1);
        });

        it('should throw error when baixa not found', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(null);

            await expect(BaixaService.deletarBaixa(999)).rejects.toThrow('Erro ao deletar baixa: Baixa não encontrada');
        });

        it('should handle getBaixaById errors', async () => {
            BaixaRepository.getBaixaById.mockRejectedValue(new Error('Get failed'));

            await expect(BaixaService.deletarBaixa(1)).rejects.toThrow('Erro ao deletar baixa: Get failed');
        });

        it('should handle deleteBaixa errors', async () => {
            BaixaRepository.getBaixaById.mockResolvedValue(mockBaixaCompleta);
            BaixaRepository.deleteBaixa.mockRejectedValue(new Error('Delete failed'));

            await expect(BaixaService.deletarBaixa(1)).rejects.toThrow('Erro ao deletar baixa: Delete failed');
        });
    });

    describe('obterMotivos', () => {
        it('should return list of available motivos', async () => {
            const result = await BaixaService.obterMotivos();

            expect(result).toEqual([
                'Perda',
                'Roubo', 
                'Uso interno',
                'Descarte por obsolescência',
                'Manchada',
                'Defeito',
                'Doação'
            ]);
            expect(result).toHaveLength(7);
        });

        it('should return same motivos consistently', async () => {
            const result1 = await BaixaService.obterMotivos();
            const result2 = await BaixaService.obterMotivos();

            expect(result1).toEqual(result2);
        });
    });

    describe('obterEstatisticas', () => {
        it('should get statistics successfully with default period', async () => {
            const mockEstatisticas = {
                total_baixas: 10,
                quantidade_total: 50,
                valor_total: 1000.00,
                motivos: {
                    'Perda': 5,
                    'Defeito': 3,
                    'Roubo': 2
                }
            };

            BaixaRepository.getEstatisticas.mockResolvedValue(mockEstatisticas);

            const result = await BaixaService.obterEstatisticas();

            expect(result).toEqual(mockEstatisticas);
            expect(BaixaRepository.getEstatisticas).toHaveBeenCalledWith('mes');
        });

        it('should get statistics with custom period', async () => {
            const mockEstatisticas = {
                total_baixas: 25,
                quantidade_total: 125,
                valor_total: 2500.00
            };

            BaixaRepository.getEstatisticas.mockResolvedValue(mockEstatisticas);

            const result = await BaixaService.obterEstatisticas('ano');

            expect(result).toEqual(mockEstatisticas);
            expect(BaixaRepository.getEstatisticas).toHaveBeenCalledWith('ano');
        });

        it('should handle repository errors', async () => {
            BaixaRepository.getEstatisticas.mockRejectedValue(new Error('Stats failed'));

            await expect(BaixaService.obterEstatisticas()).rejects.toThrow('Erro ao obter estatísticas: Stats failed');
        });
    });

    describe('gerarRelatorio', () => {
        const dataInicio = new Date('2024-01-01');
        const dataFim = new Date('2024-01-31');

        it('should generate report successfully without motivo filter', async () => {
            const mockRelatorio = {
                baixas: [
                    mockBaixaCompleta,
                    { ...mockBaixaCompleta, id: 2, quantidade: 3, motivo: 'Defeito' }
                ]
            };

            BaixaRepository.getRelatorio.mockResolvedValue(mockRelatorio);

            const result = await BaixaService.gerarRelatorio(dataInicio, dataFim);

            expect(result.periodo.inicio).toEqual(dataInicio);
            expect(result.periodo.fim).toEqual(dataFim);
            expect(result.filtros.motivo).toBe('Todos');
            expect(result.resumo.total_baixas).toBe(2);
            expect(result.resumo.quantidade_total).toBe(8); // 5 + 3
            expect(result.resumo.valor_total).toBe(400.00); // (5 * 50) + (3 * 50)
            expect(result.baixas).toHaveLength(2);
            expect(BaixaRepository.getRelatorio).toHaveBeenCalledWith({
                data_inicio: dataInicio,
                data_fim: dataFim
            });
        });

        it('should generate report with motivo filter', async () => {
            const mockRelatorio = {
                baixas: [mockBaixaCompleta]
            };

            BaixaRepository.getRelatorio.mockResolvedValue(mockRelatorio);

            const result = await BaixaService.gerarRelatorio(dataInicio, dataFim, 'Perda');

            expect(result.filtros.motivo).toBe('Perda');
            expect(result.resumo.total_baixas).toBe(1);
            expect(BaixaRepository.getRelatorio).toHaveBeenCalledWith({
                data_inicio: dataInicio,
                data_fim: dataFim,
                motivo: 'Perda'
            });
        });

        it('should handle baixas without Roupa data in report', async () => {
            const baixaSemRoupa = { ...mockBaixaCompleta, Roupa: null };
            const mockRelatorio = {
                baixas: [baixaSemRoupa]
            };

            BaixaRepository.getRelatorio.mockResolvedValue(mockRelatorio);

            const result = await BaixaService.gerarRelatorio(dataInicio, dataFim);

            expect(result.resumo.valor_total).toBe(0); // Roupa.preco is null/undefined
            expect(result.baixas[0].Roupa).toBeNull();
        });

        it('should handle baixas with missing price in report calculation', async () => {
            const baixaSemPreco = { 
                ...mockBaixaCompleta, 
                Roupa: { ...mockBaixaCompleta.Roupa, preco: undefined }
            };
            const mockRelatorio = {
                baixas: [baixaSemPreco]
            };

            BaixaRepository.getRelatorio.mockResolvedValue(mockRelatorio);

            const result = await BaixaService.gerarRelatorio(dataInicio, dataFim);

            expect(result.resumo.valor_total).toBe(0); // Should handle undefined price
        });

        it('should handle empty report', async () => {
            const mockRelatorio = {
                baixas: []
            };

            BaixaRepository.getRelatorio.mockResolvedValue(mockRelatorio);

            const result = await BaixaService.gerarRelatorio(dataInicio, dataFim);

            expect(result.resumo.total_baixas).toBe(0);
            expect(result.resumo.quantidade_total).toBe(0);
            expect(result.resumo.valor_total).toBe(0);
            expect(result.baixas).toEqual([]);
        });

        it('should handle repository errors', async () => {
            BaixaRepository.getRelatorio.mockRejectedValue(new Error('Report failed'));

            await expect(BaixaService.gerarRelatorio(dataInicio, dataFim)).rejects.toThrow('Erro ao gerar relatório: Report failed');
        });
    });
});