import ComprasRepository from '../repository/comprasRepository.js';

class ComprasService {
    // Listar compras com filtros e paginação
    static async listarCompras(filters, pagination) {
        try {
            const resultado = await ComprasRepository.getAllCompras(filters, pagination);
            
            // Calcular totais e estatísticas adicionais
            const comprasComTotais = resultado.data.map(compra => {
                const totalItens = compra.ComprasItens.reduce((acc, item) => acc + item.quatidade, 0);
                const valorTotalItens = compra.ComprasItens.reduce((acc, item) => 
                    acc + (item.quatidade * item.valor_peça), 0);

                return {
                    ...compra,
                    total_itens: totalItens,
                    valor_total_itens: valorTotalItens,
                    itens: compra.ComprasItens.map(item => ({
                        id: item.id,
                        roupa: {
                            id: item.Roupa.id,
                            nome: item.Roupa.nome,
                            categoria: item.Roupa.categoria,
                            marca: item.Roupa.marca
                        },
                        quantidade: item.quatidade,
                        valor_unitario: item.valor_peça,
                        valor_total: item.quatidade * item.valor_peça
                    }))
                };
            });

            return {
                ...resultado,
                data: comprasComTotais
            };
        } catch (error) {
            throw new Error(`Erro ao listar compras: ${error.message}`);
        }
    }

    // Buscar compra específica
    static async buscarCompraPorId(id) {
        try {
            const compra = await ComprasRepository.getCompraById(id);
            
            if (!compra) {
                return null;
            }

            // Calcular totais
            const totalItens = compra.ComprasItens.reduce((acc, item) => acc + item.quatidade, 0);
            const valorTotalItens = compra.ComprasItens.reduce((acc, item) => 
                acc + (item.quatidade * item.valor_peça), 0);

            return {
                ...compra,
                total_itens: totalItens,
                valor_total_itens: valorTotalItens,
                itens: compra.ComprasItens.map(item => ({
                    id: item.id,
                    roupa: {
                        id: item.Roupa.id,
                        nome: item.Roupa.nome,
                        categoria: item.Roupa.categoria,
                        marca: item.Roupa.marca,
                        estoque_atual: item.Roupa.quantidade
                    },
                    quantidade: item.quatidade,
                    valor_unitario: item.valor_peça,
                    valor_total: item.quatidade * item.valor_peça
                }))
            };
        } catch (error) {
            throw new Error(`Erro ao buscar compra: ${error.message}`);
        }
    }

    // Criar nova compra
    static async criarCompra(dadosCompra) {
        try {
            // Validar se há itens
            if (!dadosCompra.itens || dadosCompra.itens.length === 0) {
                throw new Error('É necessário informar pelo menos um item');
            }

            // Validar valor pago vs valor dos itens
            const valorTotalItens = dadosCompra.itens.reduce((acc, item) => 
                acc + (item.quantidade * item.valor_peca), 0);

            if (dadosCompra.valor_pago > valorTotalItens * 1.5) {
                console.warn(`Valor pago (${dadosCompra.valor_pago}) muito superior ao valor dos itens (${valorTotalItens})`);
            }

            const novaCompra = await ComprasRepository.createCompra(dadosCompra);
            
            return await this.buscarCompraPorId(novaCompra.id);
        } catch (error) {
            throw new Error(`Erro ao criar compra: ${error.message}`);
        }
    }

    // Atualizar compra
    static async atualizarCompra(id, dadosAtualizacao) {
        try {
            // Verificar se compra existe
            const compraExistente = await ComprasRepository.getCompraById(id);
            if (!compraExistente) {
                throw new Error('Compra não encontrada');
            }

            const compraAtualizada = await ComprasRepository.updateCompra(id, dadosAtualizacao);
            
            return await this.buscarCompraPorId(compraAtualizada.id);
        } catch (error) {
            throw new Error(`Erro ao atualizar compra: ${error.message}`);
        }
    }

    // Deletar compra
    static async deletarCompra(id) {
        try {
            // Verificar se compra existe
            const compraExistente = await ComprasRepository.getCompraById(id);
            if (!compraExistente) {
                throw new Error('Compra não encontrada');
            }

            await ComprasRepository.deleteCompra(id);
            
            return { message: 'Compra deletada com sucesso' };
        } catch (error) {
            throw new Error(`Erro ao deletar compra: ${error.message}`);
        }
    }

    // Adicionar item à compra
    static async adicionarItem(compraId, dadosItem) {
        try {
            // Verificar se compra existe
            const compraExistente = await ComprasRepository.getCompraById(compraId);
            if (!compraExistente) {
                throw new Error('Compra não encontrada');
            }

            const novoItem = await ComprasRepository.addItemToCompra(compraId, dadosItem);
            
            return {
                id: novoItem.id,
                roupa: {
                    id: novoItem.Roupa.id,
                    nome: novoItem.Roupa.nome,
                    categoria: novoItem.Roupa.categoria,
                    marca: novoItem.Roupa.marca
                },
                quantidade: novoItem.quatidade,
                valor_unitario: novoItem.valor_peça,
                valor_total: novoItem.quatidade * novoItem.valor_peça
            };
        } catch (error) {
            throw new Error(`Erro ao adicionar item: ${error.message}`);
        }
    }

    // Listar itens da compra
    static async listarItensCompra(compraId) {
        try {
            const itens = await ComprasRepository.getItensCompra(compraId);
            
            return itens.map(item => ({
                id: item.id,
                roupa: {
                    id: item.Roupa.id,
                    nome: item.Roupa.nome,
                    categoria: item.Roupa.categoria,
                    marca: item.Roupa.marca,
                    estoque_atual: item.Roupa.quantidade
                },
                quantidade: item.quatidade,
                valor_unitario: item.valor_peça,
                valor_total: item.quatidade * item.valor_peça
            }));
        } catch (error) {
            throw new Error(`Erro ao listar itens: ${error.message}`);
        }
    }

    // Atualizar item da compra
    static async atualizarItem(itemId, dadosAtualizacao) {
        try {
            const itemAtualizado = await ComprasRepository.updateItemCompra(itemId, dadosAtualizacao);
            
            return {
                id: itemAtualizado.id,
                roupa: {
                    id: itemAtualizado.Roupa.id,
                    nome: itemAtualizado.Roupa.nome,
                    categoria: itemAtualizado.Roupa.categoria,
                    marca: itemAtualizado.Roupa.marca
                },
                quantidade: itemAtualizado.quatidade,
                valor_unitario: itemAtualizado.valor_peça,
                valor_total: itemAtualizado.quatidade * itemAtualizado.valor_peça
            };
        } catch (error) {
            throw new Error(`Erro ao atualizar item: ${error.message}`);
        }
    }

    // Remover item da compra
    static async removerItem(itemId) {
        try {
            await ComprasRepository.removeItemFromCompra(itemId);
            
            return { message: 'Item removido com sucesso' };
        } catch (error) {
            throw new Error(`Erro ao remover item: ${error.message}`);
        }
    }

    // Finalizar compra (adicionar ao estoque)
    static async finalizarCompra(compraId, observacoes = null) {
        try {
            // Verificar se compra existe
            const compraExistente = await ComprasRepository.getCompraById(compraId);
            if (!compraExistente) {
                throw new Error('Compra não encontrada');
            }

            // Verificar se compra tem itens
            if (!compraExistente.ComprasItens || compraExistente.ComprasItens.length === 0) {
                throw new Error('Compra não possui itens para finalizar');
            }

            const compraFinalizada = await ComprasRepository.finalizarCompra(compraId, observacoes);
            
            // Retornar resumo da finalização
            const resumo = {
                compra_id: compraFinalizada.id,
                data_finalizacao: new Date(),
                itens_adicionados_estoque: compraFinalizada.ComprasItens.map(item => ({
                    roupa_nome: item.Roupa.nome,
                    quantidade_adicionada: item.quatidade,
                    novo_estoque: item.Roupa.quantidade + item.quatidade
                })),
                valor_total: compraFinalizada.valor_pago
            };

            return resumo;
        } catch (error) {
            throw new Error(`Erro ao finalizar compra: ${error.message}`);
        }
    }

    // Obter estatísticas
    static async obterEstatisticas(filtros = {}) {
        try {
            return await ComprasRepository.getComprasStats(filtros);
        } catch (error) {
            throw new Error(`Erro ao obter estatísticas: ${error.message}`);
        }
    }

    // Relatório de compras por período
    static async relatorioCompasPeriodo(dataInicio, dataFim) {
        try {
            const filtros = {
                data_inicio: dataInicio,
                data_fim: dataFim
            };

            const [compras, estatisticas] = await Promise.all([
                this.listarCompras(filtros, { page: 1, limit: 1000 }),
                this.obterEstatisticas(filtros)
            ]);

            return {
                periodo: {
                    data_inicio: dataInicio,
                    data_fim: dataFim
                },
                resumo: estatisticas,
                compras: compras.data,
                total_compras: compras.total
            };
        } catch (error) {
            throw new Error(`Erro ao gerar relatório: ${error.message}`);
        }
    }
}

export default ComprasService;