import ComprasService from '../../services/comprasService.js';
import ComprasRepository from '../../repository/comprasRepository.js';

// Mock do ComprasRepository
jest.mock('../../repository/comprasRepository.js');

describe('ComprasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Limpar warnings do console
        console.warn = jest.fn();
    });

    // Mock data
    const mockCompra = {
        id: 1,
        fornecedor_nome: 'Fornecedor Teste',
        data_compra: new Date('2024-01-15'),
        valor_pago: 500.00,
        finalizada: false
    };

    const mockCompraCompleta = {
        id: 1,
        fornecedor_nome: 'Fornecedor Teste',
        data_compra: new Date('2024-01-15'),
        valor_pago: 500.00,
        finalizada: false,
        ComprasItens: [
            {
                id: 1,
                roupa_id: 1,
                quatidade: 10,
                valor_peça: 50.00,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Polo',
                    categoria: 'Camisas',
                    marca: 'Nike',
                    quantidade: 100
                }
            }
        ]
    };

    const mockCompraFinalizada = {
        id: 1,
        fornecedor_nome: 'Fornecedor Teste',
        data_compra: new Date('2024-01-15'),
        valor_pago: 500.00,
        finalizada: true,
        ComprasItens: [
            {
                id: 1,
                roupa_id: 1,
                quatidade: 10,
                valor_peça: 50.00,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Polo',
                    categoria: 'Camisas',
                    marca: 'Nike',
                    quantidade: 110 // Estoque após adição
                }
            }
        ]
    };

    const validDadosCompra = {
        fornecedor_nome: 'Fornecedor Teste',
        data_compra: new Date('2024-01-15'),
        valor_pago: 500.00,
        itens: [
            {
                roupa_id: 1,
                quantidade: 10,
                valor_peca: 50.00
            }
        ]
    };

    describe('listarCompras', () => {
        it('should list compras with calculated totals', async () => {
            const mockResultado = {
                data: [mockCompraCompleta],
                total: 1,
                page: 1,
                totalPages: 1
            };
            ComprasRepository.getAllCompras.mockResolvedValue(mockResultado);

            const result = await ComprasService.listarCompras();

            expect(result.data).toHaveLength(1);
            expect(result.data[0].valor_total_itens).toBe(500.00);
            expect(result.data[0].total_itens).toBe(10);
            expect(ComprasRepository.getAllCompras).toHaveBeenCalledWith(undefined, undefined);
        });

        it('should handle empty compras list', async () => {
            const mockResultado = {
                data: [],
                total: 0,
                page: 1,
                totalPages: 0
            };
            ComprasRepository.getAllCompras.mockResolvedValue(mockResultado);

            const result = await ComprasService.listarCompras();

            expect(result.data).toEqual([]);
            expect(ComprasRepository.getAllCompras).toHaveBeenCalledTimes(1);
        });

        it('should handle compras without items', async () => {
            const comprasSemItens = [{ ...mockCompra, ComprasItens: [] }];
            const mockResultado = {
                data: comprasSemItens,
                total: 1,
                page: 1,
                totalPages: 1
            };
            ComprasRepository.getAllCompras.mockResolvedValue(mockResultado);

            const result = await ComprasService.listarCompras();

            expect(result.data[0].valor_total_itens).toBe(0);
            expect(result.data[0].total_itens).toBe(0);
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.getAllCompras.mockRejectedValue(new Error('Database error'));

            await expect(ComprasService.listarCompras()).rejects.toThrow('Erro ao listar compras: Database error');
        });
    });

    describe('buscarCompraPorId', () => {
        it('should find compra by id with calculated totals', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);

            const result = await ComprasService.buscarCompraPorId(1);

            expect(result.valor_total_itens).toBe(500.00);
            expect(result.total_itens).toBe(10);
            expect(ComprasRepository.getCompraById).toHaveBeenCalledWith(1);
        });

        it('should return null when compra not found', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(null);

            const result = await ComprasService.buscarCompraPorId(999);

            expect(result).toBeNull();
        });

        it('should handle compra without items', async () => {
            const compraSemItens = { ...mockCompra, ComprasItens: [] };
            ComprasRepository.getCompraById.mockResolvedValue(compraSemItens);

            const result = await ComprasService.buscarCompraPorId(1);

            expect(result.valor_total_itens).toBe(0);
            expect(result.total_itens).toBe(0);
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.getCompraById.mockRejectedValue(new Error('Database error'));

            await expect(ComprasService.buscarCompraPorId(1)).rejects.toThrow('Erro ao buscar compra: Database error');
        });
    });

    describe('criarCompra', () => {
        it('should create compra successfully', async () => {
            ComprasRepository.createCompra.mockResolvedValue(mockCompra);
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);

            const result = await ComprasService.criarCompra(validDadosCompra);

            expect(result.id).toBe(1);
            expect(result.valor_total_itens).toBe(500.00);
            expect(ComprasRepository.createCompra).toHaveBeenCalledWith(validDadosCompra);
        });

        it('should throw error when no items provided', async () => {
            const dadosSemItens = { ...validDadosCompra, itens: [] };

            await expect(ComprasService.criarCompra(dadosSemItens)).rejects.toThrow(
                'É necessário informar pelo menos um item'
            );
        });

        it('should throw error when itens is undefined', async () => {
            const dadosSemItens = { ...validDadosCompra };
            delete dadosSemItens.itens;

            await expect(ComprasService.criarCompra(dadosSemItens)).rejects.toThrow(
                'É necessário informar pelo menos um item'
            );
        });

        it('should warn when valor_pago is much higher than items value', async () => {
            const dadosValorAlto = {
                ...validDadosCompra,
                valor_pago: 500,
                itens: [
                    { 
                        roupa_id: 1, 
                        quantidade: 10, 
                        valor_peca: 30 // Total: 300, mas valor_pago: 500 (1.67x > 1.5x)
                    }
                ]
            };

            ComprasRepository.createCompra.mockResolvedValue(mockCompra);
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);

            await ComprasService.criarCompra(dadosValorAlto);

            expect(console.warn).toHaveBeenCalledWith(
                'Valor pago (500) muito superior ao valor dos itens (300)'
            );
        });

        it('should not warn when valor_pago is reasonable', async () => {
            ComprasRepository.createCompra.mockResolvedValue(mockCompra);
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);

            await ComprasService.criarCompra(validDadosCompra);

            expect(console.warn).not.toHaveBeenCalled();
        });

        it('should throw error when repository createCompra fails', async () => {
            ComprasRepository.createCompra.mockRejectedValue(new Error('Create failed'));

            await expect(ComprasService.criarCompra(validDadosCompra)).rejects.toThrow('Erro ao criar compra: Create failed');
        });

        it('should throw error when buscarCompraPorId fails after creation', async () => {
            ComprasRepository.createCompra.mockResolvedValue(mockCompra);
            ComprasRepository.getCompraById.mockRejectedValue(new Error('Search failed'));

            await expect(ComprasService.criarCompra(validDadosCompra)).rejects.toThrow('Erro ao criar compra: Erro ao buscar compra: Search failed');
        });
    });

    describe('atualizarCompra', () => {
        it('should update compra successfully', async () => {
            const mockCompraAtualizada = { ...mockCompra, fornecedor_nome: 'Novo Fornecedor' };
            ComprasRepository.updateCompra.mockResolvedValue(mockCompraAtualizada);
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);

            const result = await ComprasService.atualizarCompra(1, { fornecedor_nome: 'Novo Fornecedor' });

            expect(result.fornecedor_nome).toBe('Fornecedor Teste'); // retorna o resultado do buscarCompraPorId
            expect(ComprasRepository.updateCompra).toHaveBeenCalledWith(1, { fornecedor_nome: 'Novo Fornecedor' });
        });

        it('should throw error when compra not found', async () => {
            ComprasRepository.updateCompra.mockRejectedValue(new Error('Compra não encontrada'));

            await expect(ComprasService.atualizarCompra(999, {})).rejects.toThrow('Erro ao atualizar compra: Compra não encontrada');
        });

        it('should throw error when repository update fails', async () => {
            ComprasRepository.updateCompra.mockRejectedValue(new Error('Update failed'));

            await expect(ComprasService.atualizarCompra(1, {})).rejects.toThrow('Erro ao atualizar compra: Update failed');
        });

        it('should throw error when buscarCompraPorId fails after update', async () => {
            const mockCompraAtualizada = { ...mockCompra, fornecedor_nome: 'Novo Fornecedor' };
            ComprasRepository.updateCompra.mockResolvedValue(mockCompraAtualizada);
            ComprasRepository.getCompraById.mockRejectedValue(new Error('Search failed'));

            await expect(ComprasService.atualizarCompra(1, {})).rejects.toThrow('Erro ao atualizar compra: Search failed');
        });
    });

    describe('deletarCompra', () => {
        it('should delete compra successfully', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompra);
            ComprasRepository.deleteCompra.mockResolvedValue();

            const result = await ComprasService.deletarCompra(1);

            expect(result.message).toBe('Compra deletada com sucesso');
            expect(ComprasRepository.deleteCompra).toHaveBeenCalledWith(1);
        });

        it('should throw error when compra not found', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(null);

            await expect(ComprasService.deletarCompra(999)).rejects.toThrow('Erro ao deletar compra: Compra não encontrada');
        });

        it('should throw error when repository delete fails', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompra);
            ComprasRepository.deleteCompra.mockRejectedValue(new Error('Delete failed'));

            await expect(ComprasService.deletarCompra(1)).rejects.toThrow('Erro ao deletar compra: Delete failed');
        });
    });

    describe('adicionarItem', () => {
        it('should add item to compra successfully', async () => {
            const dadosItem = {
                roupa_id: 2,
                quantidade: 5,
                valor_peca: 30.00
            };

            const mockItem = {
                id: 2,
                roupa_id: 2,
                quatidade: 5,
                valor_peça: 30.00,
                Roupa: {
                    id: 2,
                    nome: 'Calça Jeans',
                    categoria: 'Calças',
                    marca: 'Levi\'s'
                }
            };

            // Mock para verificar se compra existe
            ComprasRepository.getCompraById.mockResolvedValue(mockCompra);
            ComprasRepository.addItemToCompra.mockResolvedValue(mockItem);

            const result = await ComprasService.adicionarItem(1, dadosItem);

            expect(result.roupa.nome).toBe('Calça Jeans');
            expect(result.quantidade).toBe(5);
            expect(result.valor_total).toBe(150.00);
            expect(ComprasRepository.addItemToCompra).toHaveBeenCalledWith(1, dadosItem);
        });

        it('should throw error when compra not found', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(null);

            await expect(ComprasService.adicionarItem(999, {})).rejects.toThrow('Erro ao adicionar item: Compra não encontrada');
        });

        it('should throw error when repository addItemToCompra fails', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompra);
            ComprasRepository.addItemToCompra.mockRejectedValue(new Error('Add item failed'));

            await expect(ComprasService.adicionarItem(1, {})).rejects.toThrow('Erro ao adicionar item: Add item failed');
        });
    });

    describe('listarItensCompra', () => {
        it('should list compra items successfully', async () => {
            const mockItens = [
                {
                    id: 1,
                    roupa_id: 1,
                    quatidade: 10,
                    valor_peça: 50.00,
                    Roupa: {
                        id: 1,
                        nome: 'Camisa Polo',
                        categoria: 'Camisas',
                        marca: 'Nike',
                        quantidade: 100
                    }
                }
            ];

            ComprasRepository.getItensCompra.mockResolvedValue(mockItens);

            const result = await ComprasService.listarItensCompra(1);

            expect(result).toHaveLength(1);
            expect(result[0].roupa.nome).toBe('Camisa Polo');
            expect(result[0].valor_total).toBe(500.00);
            expect(ComprasRepository.getItensCompra).toHaveBeenCalledWith(1);
        });

        it('should return empty array when no items found', async () => {
            ComprasRepository.getItensCompra.mockResolvedValue([]);

            const result = await ComprasService.listarItensCompra(1);

            expect(result).toEqual([]);
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.getItensCompra.mockRejectedValue(new Error('Get items failed'));

            await expect(ComprasService.listarItensCompra(1)).rejects.toThrow('Erro ao listar itens: Get items failed');
        });
    });

    describe('atualizarItem', () => {
        it('should update item successfully', async () => {
            const mockItemAtualizado = {
                id: 1,
                quatidade: 15,
                valor_peça: 45.00,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Polo',
                    categoria: 'Camisas',
                    marca: 'Nike'
                }
            };

            ComprasRepository.updateItemCompra.mockResolvedValue(mockItemAtualizado);

            const result = await ComprasService.atualizarItem(1, { quantidade: 15 });

            expect(result.quantidade).toBe(15);
            expect(result.valor_total).toBe(675.00); // 15 * 45.00
            expect(ComprasRepository.updateItemCompra).toHaveBeenCalledWith(1, { quantidade: 15 });
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.updateItemCompra.mockRejectedValue(new Error('Update item failed'));

            await expect(ComprasService.atualizarItem(1, {})).rejects.toThrow('Erro ao atualizar item: Update item failed');
        });
    });

    describe('removerItem', () => {
        it('should remove item successfully', async () => {
            ComprasRepository.removeItemFromCompra.mockResolvedValue();

            const result = await ComprasService.removerItem(1);

            expect(result.message).toBe('Item removido com sucesso');
            expect(ComprasRepository.removeItemFromCompra).toHaveBeenCalledWith(1);
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.removeItemFromCompra.mockRejectedValue(new Error('Remove item failed'));

            await expect(ComprasService.removerItem(1)).rejects.toThrow('Erro ao remover item: Remove item failed');
        });
    });

    describe('finalizarCompra', () => {
        it('should finalize compra successfully', async () => {
            // Mock da compra existente
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);
            
            // Mock da finalização
            ComprasRepository.finalizarCompra.mockResolvedValue(mockCompraFinalizada);

            const result = await ComprasService.finalizarCompra(1, 'Compra finalizada');

            expect(result.compra_id).toBe(1);
            expect(result.valor_total).toBe(500.00);
            expect(result.itens_adicionados_estoque).toHaveLength(1);
            expect(result.itens_adicionados_estoque[0]).toEqual({
                roupa_nome: 'Camisa Polo',
                quantidade_adicionada: 10,
                novo_estoque: 120 // 110 + 10
            });
        });

        it('should finalize compra without observacoes', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);
            ComprasRepository.finalizarCompra.mockResolvedValue(mockCompraFinalizada);

            const result = await ComprasService.finalizarCompra(1);

            expect(result.compra_id).toBe(1);
            expect(ComprasRepository.finalizarCompra).toHaveBeenCalledWith(1, null);
        });

        it('should throw error when compra not found', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(null);

            await expect(ComprasService.finalizarCompra(999)).rejects.toThrow('Erro ao finalizar compra: Compra não encontrada');
        });

        it('should throw error when compra has no items', async () => {
            const compraSemItens = { ...mockCompra, ComprasItens: [] };
            ComprasRepository.getCompraById.mockResolvedValue(compraSemItens);

            await expect(ComprasService.finalizarCompra(1)).rejects.toThrow('Erro ao finalizar compra: Compra não possui itens para finalizar');
        });

        it('should throw error when ComprasItens is undefined', async () => {
            const compraSemItens = { ...mockCompra };
            delete compraSemItens.ComprasItens;
            ComprasRepository.getCompraById.mockResolvedValue(compraSemItens);

            await expect(ComprasService.finalizarCompra(1)).rejects.toThrow('Erro ao finalizar compra: Compra não possui itens para finalizar');
        });

        it('should throw error when repository finalizarCompra fails', async () => {
            ComprasRepository.getCompraById.mockResolvedValue(mockCompraCompleta);
            ComprasRepository.finalizarCompra.mockRejectedValue(new Error('Finalize failed'));

            await expect(ComprasService.finalizarCompra(1)).rejects.toThrow('Erro ao finalizar compra: Finalize failed');
        });
    });

    describe('obterEstatisticas', () => {
        it('should get statistics successfully', async () => {
            const mockEstatisticas = {
                total_compras: 5,
                valor_total_investido: 2500.00,
                media_valor_compra: 500.00,
                total_itens_comprados: 50
            };

            ComprasRepository.getComprasStats.mockResolvedValue(mockEstatisticas);

            const result = await ComprasService.obterEstatisticas();

            expect(result).toEqual(mockEstatisticas);
            expect(ComprasRepository.getComprasStats).toHaveBeenCalledWith({});
        });

        it('should get statistics with filters', async () => {
            const filtros = {
                data_inicio: new Date('2024-01-01'),
                data_fim: new Date('2024-01-31')
            };

            const mockEstatisticas = {
                total_compras: 3,
                valor_total_investido: 1500.00,
                media_valor_compra: 500.00,
                total_itens_comprados: 30
            };

            ComprasRepository.getComprasStats.mockResolvedValue(mockEstatisticas);

            const result = await ComprasService.obterEstatisticas(filtros);

            expect(result).toEqual(mockEstatisticas);
            expect(ComprasRepository.getComprasStats).toHaveBeenCalledWith(filtros);
        });

        it('should throw error when repository fails', async () => {
            ComprasRepository.getComprasStats.mockRejectedValue(new Error('Stats failed'));

            await expect(ComprasService.obterEstatisticas()).rejects.toThrow('Erro ao obter estatísticas: Stats failed');
        });
    });

    describe('relatorioCompasPeriodo', () => {
        it('should generate period report successfully', async () => {
            const dataInicio = new Date('2024-01-01');
            const dataFim = new Date('2024-01-31');

            // Mock das funções do repository
            const mockResultado = {
                data: [mockCompraCompleta],
                total: 1,
                page: 1,
                totalPages: 1
            };
            
            const mockEstatisticas = {
                total_compras: 1,
                valor_total_investido: 500.00,
                media_valor_compra: 500.00,
                total_itens_comprados: 10
            };

            ComprasRepository.getAllCompras.mockResolvedValue(mockResultado);
            ComprasRepository.getComprasStats.mockResolvedValue(mockEstatisticas);

            const result = await ComprasService.relatorioCompasPeriodo(dataInicio, dataFim);

            expect(result.periodo.data_inicio).toEqual(dataInicio);
            expect(result.periodo.data_fim).toEqual(dataFim);
            expect(result.compras).toHaveLength(1);
            expect(result.resumo.total_compras).toBe(1);
            expect(result.total_compras).toBe(1);
        });

        it('should throw error when listarCompras fails', async () => {
            ComprasRepository.getAllCompras.mockRejectedValue(new Error('List failed'));

            await expect(ComprasService.relatorioCompasPeriodo(new Date(), new Date())).rejects.toThrow('Erro ao gerar relatório: Erro ao listar compras: List failed');
        });

        it('should throw error when obterEstatisticas fails', async () => {
            const mockResultado = {
                data: [],
                total: 0,
                page: 1,
                totalPages: 0
            };
            ComprasRepository.getAllCompras.mockResolvedValue(mockResultado);
            ComprasRepository.getComprasStats.mockRejectedValue(new Error('Stats failed'));

            await expect(ComprasService.relatorioCompasPeriodo(new Date(), new Date())).rejects.toThrow('Erro ao gerar relatório: Erro ao obter estatísticas: Stats failed');
        });
    });
});