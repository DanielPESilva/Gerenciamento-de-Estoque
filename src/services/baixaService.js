import BaixaRepository from '../repository/baixaRepository.js';

class BaixaService {
    // Listar baixas com filtros e paginação
    static async listarBaixas(filters, pagination) {
        try {
            console.log('Service - Filters:', filters);
            console.log('Service - Pagination:', pagination);
            
            const resultado = await BaixaRepository.getAllBaixas(filters, pagination);
            
            console.log('Service - Resultado:', resultado);
            
            if (!resultado || !resultado.data) {
                return {
                    data: [],
                    pagination: {
                        page: pagination.page || 1,
                        limit: pagination.limit || 10,
                        total: 0,
                        totalPages: 0
                    }
                };
            }
            
            // Simplificar formato das baixas conforme modelo atual
            const baixasFormatadas = resultado.data.map(baixa => ({
                id: baixa.id,
                roupa_id: baixa.roupa_id,
                quantidade: baixa.quantidade,
                motivo: baixa.motivo,
                observacao: baixa.observacao,
                data_baixa: baixa.data_baixa,
                Roupa: baixa.Roupa ? {
                    id: baixa.Roupa.id,
                    nome: baixa.Roupa.nome,
                    tipo: baixa.Roupa.tipo,
                    tamanho: baixa.Roupa.tamanho,
                    cor: baixa.Roupa.cor,
                    preco: baixa.Roupa.preco,
                    quantidade: baixa.Roupa.quantidade
                } : null
            }));

            return {
                data: baixasFormatadas,
                pagination: resultado.pagination
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error(`Erro ao listar baixas: ${error.message}`);
        }
    }

    // Buscar baixa por ID
    static async buscarBaixaPorId(id) {
        try {
            const baixa = await BaixaRepository.getBaixaById(id);
            
            if (!baixa) {
                throw new Error('Baixa não encontrada');
            }

            return {
                id: baixa.id,
                roupa_id: baixa.roupa_id,
                quantidade: baixa.quantidade,
                motivo: baixa.motivo,
                observacao: baixa.observacao,
                data_baixa: baixa.data_baixa,
                Roupa: baixa.Roupa ? {
                    id: baixa.Roupa.id,
                    nome: baixa.Roupa.nome,
                    tipo: baixa.Roupa.tipo,
                    tamanho: baixa.Roupa.tamanho,
                    cor: baixa.Roupa.cor,
                    preco: baixa.Roupa.preco,
                    quantidade: baixa.Roupa.quantidade
                } : null
            };
        } catch (error) {
            throw new Error(`Erro ao buscar baixa: ${error.message}`);
        }
    }

    // Criar nova baixa
    static async criarBaixa(dadosBaixa) {
        try {
            // Verificar se a roupa existe e tem estoque suficiente
            const verificacao = await BaixaRepository.verificarEstoque(dadosBaixa.roupa_id, dadosBaixa.quantidade);
            
            if (!verificacao.exists) {
                throw new Error('Roupa não encontrada');
            }
            
            if (!verificacao.hasStock) {
                throw new Error(`Estoque insuficiente. Disponível: ${verificacao.currentStock}, Solicitado: ${dadosBaixa.quantidade}`);
            }

            // Criar baixa
            const novaBaixa = await BaixaRepository.createBaixa(dadosBaixa);
            
            return {
                id: novaBaixa.id,
                roupa_id: novaBaixa.roupa_id,
                quantidade: novaBaixa.quantidade,
                motivo: novaBaixa.motivo,
                observacao: novaBaixa.observacao,
                data_baixa: novaBaixa.data_baixa,
                Roupa: novaBaixa.Roupa
            };
        } catch (error) {
            throw new Error(`Erro ao criar baixa: ${error.message}`);
        }
    }

    // Atualizar baixa
    static async atualizarBaixa(id, dadosAtualizacao) {
        try {
            const baixaExistente = await BaixaRepository.getBaixaById(id);
            
            if (!baixaExistente) {
                throw new Error('Baixa não encontrada');
            }

            const baixaAtualizada = await BaixaRepository.updateBaixa(id, dadosAtualizacao);
            
            return {
                id: baixaAtualizada.id,
                roupa_id: baixaAtualizada.roupa_id,
                quantidade: baixaAtualizada.quantidade,
                motivo: baixaAtualizada.motivo,
                observacao: baixaAtualizada.observacao,
                data_baixa: baixaAtualizada.data_baixa,
                Roupa: baixaAtualizada.Roupa
            };
        } catch (error) {
            throw new Error(`Erro ao atualizar baixa: ${error.message}`);
        }
    }

    // Deletar baixa
    static async deletarBaixa(id) {
        try {
            const baixaExistente = await BaixaRepository.getBaixaById(id);
            
            if (!baixaExistente) {
                throw new Error('Baixa não encontrada');
            }

            // Deletar baixa (o repository se encarrega de restaurar o estoque)
            await BaixaRepository.deleteBaixa(id);
            
            return {
                message: 'Baixa deletada com sucesso',
                estoque_restaurado: baixaExistente.quantidade
            };
        } catch (error) {
            throw new Error(`Erro ao deletar baixa: ${error.message}`);
        }
    }

    // Obter motivos disponíveis
    static async obterMotivos() {
        return [
            'Perda',
            'Roubo', 
            'Uso interno',
            'Descarte por obsolescência',
            'Manchada',
            'Defeito',
            'Doação'
        ];
    }

    // Obter estatísticas
    static async obterEstatisticas(periodo = 'mes') {
        try {
            return await BaixaRepository.getEstatisticas(periodo);
        } catch (error) {
            throw new Error(`Erro ao obter estatísticas: ${error.message}`);
        }
    }

    // Gerar relatório
    static async gerarRelatorio(dataInicio, dataFim, motivo = null) {
        try {
            const filters = {
                data_inicio: dataInicio,
                data_fim: dataFim
            };

            if (motivo) {
                filters.motivo = motivo;
            }

            const resultado = await BaixaRepository.getRelatorio(filters);
            
            return {
                periodo: {
                    inicio: dataInicio,
                    fim: dataFim
                },
                filtros: {
                    motivo: motivo || 'Todos'
                },
                resumo: {
                    total_baixas: resultado.baixas.length,
                    quantidade_total: resultado.baixas.reduce((acc, baixa) => acc + baixa.quantidade, 0),
                    valor_total: resultado.baixas.reduce((acc, baixa) => acc + (baixa.quantidade * (baixa.Roupa?.preco || 0)), 0)
                },
                baixas: resultado.baixas.map(baixa => ({
                    id: baixa.id,
                    roupa_id: baixa.roupa_id,
                    quantidade: baixa.quantidade,
                    motivo: baixa.motivo,
                    observacao: baixa.observacao,
                    data_baixa: baixa.data_baixa,
                    Roupa: baixa.Roupa ? {
                        id: baixa.Roupa.id,
                        nome: baixa.Roupa.nome,
                        tipo: baixa.Roupa.tipo,
                        tamanho: baixa.Roupa.tamanho,
                        cor: baixa.Roupa.cor,
                        preco: baixa.Roupa.preco
                    } : null
                }))
            };
        } catch (error) {
            throw new Error(`Erro ao gerar relatório: ${error.message}`);
        }
    }
}

export default BaixaService;