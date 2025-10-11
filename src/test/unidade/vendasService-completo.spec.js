import VendasService from '../../services/vendasService.js';
import VendasRepository from '../../repository/vendasRepository.js';

// Mock do VendasRepository
jest.mock('../../repository/vendasRepository.js');

describe('VendasService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mock data
    const mockVenda = {
        id: 1,
        data_venda: new Date('2024-01-15'),
        forma_pgto: 'Pix',
        valor_total: 150.00,
        desconto: 10.00,
        valor_pago: 140.00,
        descricao_permuta: null,
        VendasItens: [
            {
                id: 1,
                quatidade: 2,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Polo',
                    tipo: 'Camisa',
                    tamanho: 'M',
                    cor: 'Azul',
                    preco: 75.00,
                    quantidade: 98
                }
            }
        ]
    };

    const mockVendaCompleta = {
        id: 1,
        data_venda: new Date('2024-01-15'),
        forma_pgto: 'Pix',
        valor_total: 150.00,
        desconto: 10.00,
        valor_pago: 140.00,
        descricao_permuta: 'Permuta de calça por camisa',
        VendasItens: [
            {
                id: 1,
                quatidade: 2,
                Roupa: {
                    id: 1,
                    nome: 'Camisa Polo',
                    tipo: 'Camisa',
                    tamanho: 'M',
                    cor: 'Azul',
                    preco: 75.00,
                    quantidade: 98
                }
            }
        ]
    };

    const validVendaData = {
        forma_pgto: 'Pix',
        valor_total: 150.00,
        desconto: 10.00,
        valor_pago: 140.00,
        itens: [
            {
                roupa_id: 1,
                quantidade: 2
            }
        ]
    };

    describe('getAllVendas', () => {
        it('should get all vendas with processed data successfully', async () => {
            const mockResult = {
                data: [mockVendaCompleta],
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            };

            VendasRepository.getAllVendas.mockResolvedValue(mockResult);

            const result = await VendasService.getAllVendas({}, { page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe(1);
            expect(result.data[0].quantidade_itens).toBe(1);
            expect(result.data[0].itens[0].quantidade).toBe(2);
            expect(result.data[0].descricao_permuta).toBe('Permuta de calça por camisa');
            expect(result.pagination.total).toBe(1);
            expect(VendasRepository.getAllVendas).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
        });

        it('should handle empty vendas list', async () => {
            const mockResult = {
                data: [],
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            };

            VendasRepository.getAllVendas.mockResolvedValue(mockResult);

            const result = await VendasService.getAllVendas();

            expect(result.data).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });

        it('should handle vendas with default parameters', async () => {
            const mockResult = {
                data: [mockVenda],
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            };

            VendasRepository.getAllVendas.mockResolvedValue(mockResult);

            const result = await VendasService.getAllVendas();

            expect(VendasRepository.getAllVendas).toHaveBeenCalledWith({}, { page: 1, limit: 10 });
            expect(result.data[0].descricao_permuta).toBeNull();
        });

        it('should handle repository errors', async () => {
            VendasRepository.getAllVendas.mockRejectedValue(new Error('Database error'));

            await expect(VendasService.getAllVendas()).rejects.toThrow('Database error');
        });
    });

    describe('getVendaById', () => {
        it('should get venda by id successfully', async () => {
            VendasRepository.getVendaById.mockResolvedValue(mockVendaCompleta);

            const result = await VendasService.getVendaById(1);

            expect(result.id).toBe(1);
            expect(result.quantidade_itens).toBe(1);
            expect(result.itens[0].roupa.nome).toBe('Camisa Polo');
            expect(result.descricao_permuta).toBe('Permuta de calça por camisa');
            expect(VendasRepository.getVendaById).toHaveBeenCalledWith(1);
        });

        it('should return null when venda not found', async () => {
            VendasRepository.getVendaById.mockResolvedValue(null);

            const result = await VendasService.getVendaById(999);

            expect(result).toBeNull();
        });

        it('should handle repository errors', async () => {
            VendasRepository.getVendaById.mockRejectedValue(new Error('Database error'));

            await expect(VendasService.getVendaById(1)).rejects.toThrow('Database error');
        });
    });

    describe('getVendasStats', () => {
        it('should get vendas statistics successfully', async () => {
            const mockStats = {
                total_vendas: 10,
                valor_total: 1500.00,
                media_valor: 150.00,
                total_itens: 25
            };

            VendasRepository.getVendasStats.mockResolvedValue(mockStats);

            const result = await VendasService.getVendasStats();

            expect(result).toEqual(mockStats);
            expect(VendasRepository.getVendasStats).toHaveBeenCalledWith({});
        });

        it('should get statistics with filters', async () => {
            const filters = { data_inicio: new Date('2024-01-01') };
            const mockStats = {
                total_vendas: 5,
                valor_total: 750.00,
                media_valor: 150.00,
                total_itens: 12
            };

            VendasRepository.getVendasStats.mockResolvedValue(mockStats);

            const result = await VendasService.getVendasStats(filters);

            expect(result).toEqual(mockStats);
            expect(VendasRepository.getVendasStats).toHaveBeenCalledWith(filters);
        });

        it('should handle repository errors', async () => {
            VendasRepository.getVendasStats.mockRejectedValue(new Error('Stats error'));

            await expect(VendasService.getVendasStats()).rejects.toThrow('Stats error');
        });
    });

    describe('getVendasPorPeriodo', () => {
        it('should get vendas by period successfully', async () => {
            const dataInicio = new Date('2024-01-01');
            const dataFim = new Date('2024-01-31');
            
            const mockResult = {
                data: [mockVenda],
                page: 1,
                limit: 10,
                total: 1,
                totalPages: 1,
                hasNext: false,
                hasPrev: false
            };

            VendasRepository.getAllVendas.mockResolvedValue(mockResult);

            const result = await VendasService.getVendasPorPeriodo(dataInicio, dataFim);

            expect(result.data).toHaveLength(1);
            expect(VendasRepository.getAllVendas).toHaveBeenCalledWith(
                { data_inicio: dataInicio, data_fim: dataFim },
                { page: 1, limit: 10 }
            );
        });

        it('should handle custom pagination', async () => {
            const dataInicio = new Date('2024-01-01');
            const dataFim = new Date('2024-01-31');
            const pagination = { page: 2, limit: 20 };
            
            const mockResult = {
                data: [],
                page: 2,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: true
            };

            VendasRepository.getAllVendas.mockResolvedValue(mockResult);

            const result = await VendasService.getVendasPorPeriodo(dataInicio, dataFim, pagination);

            expect(VendasRepository.getAllVendas).toHaveBeenCalledWith(
                { data_inicio: dataInicio, data_fim: dataFim },
                pagination
            );
        });
    });

    describe('createVenda', () => {
        it('should create venda successfully', async () => {
            const novaVenda = {
                ...mockVendaCompleta,
                VendasItens: [
                    {
                        ...mockVendaCompleta.VendasItens[0],
                        Roupa: {
                            ...mockVendaCompleta.VendasItens[0].Roupa,
                            quantidade: 96 // Estoque após venda
                        }
                    }
                ]
            };

            VendasRepository.createVenda.mockResolvedValue(novaVenda);

            const result = await VendasService.createVenda(validVendaData);

            expect(result.id).toBe(1);
            expect(result.quantidade_itens).toBe(1);
            expect(result.itens[0].roupa.estoque_atualizado).toBe(96);
            expect(result.resumo.total_itens_vendidos).toBe(2);
            expect(result.resumo.valor_com_desconto).toBe(140.00); // 150 - 10
            expect(result.resumo.diferenca_pagamento).toBe(0.00); // 140 - 140
            expect(VendasRepository.createVenda).toHaveBeenCalledWith(validVendaData);
        });

        it('should handle venda without descricao_permuta', async () => {
            const vendaSemPermuta = { ...mockVenda };
            VendasRepository.createVenda.mockResolvedValue(vendaSemPermuta);

            const result = await VendasService.createVenda(validVendaData);

            expect(result.descricao_permuta).toBeNull();
        });

        it('should calculate resumo correctly with multiple items', async () => {
            const vendaMultiplosItens = {
                ...mockVenda,
                VendasItens: [
                    {
                        id: 1,
                        quatidade: 2,
                        Roupa: { id: 1, nome: 'Item 1', quantidade: 98 }
                    },
                    {
                        id: 2,
                        quatidade: 3,
                        Roupa: { id: 2, nome: 'Item 2', quantidade: 47 }
                    }
                ]
            };

            VendasRepository.createVenda.mockResolvedValue(vendaMultiplosItens);

            const result = await VendasService.createVenda(validVendaData);

            expect(result.resumo.total_itens_vendidos).toBe(5); // 2 + 3
            expect(result.quantidade_itens).toBe(2);
        });

        it('should handle repository errors and rethrow them', async () => {
            VendasRepository.createVenda.mockRejectedValue(new Error('Estoque insuficiente'));

            await expect(VendasService.createVenda(validVendaData)).rejects.toThrow('Estoque insuficiente');
        });

        it('should handle validation errors', async () => {
            VendasRepository.createVenda.mockRejectedValue(new Error('Item não encontrado'));

            await expect(VendasService.createVenda(validVendaData)).rejects.toThrow('Item não encontrado');
        });
    });

    describe('updateVenda', () => {
        it('should update venda successfully', async () => {
            const dadosAtualizacao = { desconto: 20.00, valor_pago: 130.00 };
            const vendaAtualizada = {
                ...mockVendaCompleta,
                desconto: 20.00,
                valor_pago: 130.00
            };

            VendasRepository.updateVenda.mockResolvedValue(vendaAtualizada);

            const result = await VendasService.updateVenda(1, dadosAtualizacao);

            expect(result.desconto).toBe(20.00);
            expect(result.valor_pago).toBe(130.00);
            expect(result.quantidade_itens).toBe(1);
            expect(VendasRepository.updateVenda).toHaveBeenCalledWith(1, dadosAtualizacao);
        });

        it('should handle repository errors and rethrow them', async () => {
            VendasRepository.updateVenda.mockRejectedValue(new Error('Venda não encontrada'));

            await expect(VendasService.updateVenda(999, {})).rejects.toThrow('Venda não encontrada');
        });

        it('should handle validation errors', async () => {
            VendasRepository.updateVenda.mockRejectedValue(new Error('Dados inválidos'));

            await expect(VendasService.updateVenda(1, {})).rejects.toThrow('Dados inválidos');
        });
    });

    describe('deleteVenda', () => {
        it('should delete venda successfully', async () => {
            VendasRepository.deleteVenda.mockResolvedValue();

            const result = await VendasService.deleteVenda(1);

            expect(result.message).toBe('Venda deletada com sucesso e estoque restaurado');
            expect(VendasRepository.deleteVenda).toHaveBeenCalledWith(1);
        });

        it('should handle repository errors and rethrow them', async () => {
            VendasRepository.deleteVenda.mockRejectedValue(new Error('Venda não encontrada'));

            await expect(VendasService.deleteVenda(999)).rejects.toThrow('Venda não encontrada');
        });

        it('should handle deletion errors', async () => {
            VendasRepository.deleteVenda.mockRejectedValue(new Error('Erro ao deletar'));

            await expect(VendasService.deleteVenda(1)).rejects.toThrow('Erro ao deletar');
        });
    });
});