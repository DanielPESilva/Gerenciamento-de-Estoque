import CondicionaisRepository from '../repository/condicionaisRepository.js';
import VendasService from './vendasService.js';

class CondicionaisService {
    // Listar condicionais com filtros
    static async listarCondicionais(query) {
        try {
            const filters = {};
            const pagination = {};

            // Aplicar filtros
            if (query.cliente_id) {
                const clienteId = parseInt(query.cliente_id);
                if (isNaN(clienteId)) {
                    return {
                        success: false,
                        message: 'ID do cliente deve ser um número válido',
                        code: 'INVALID_CLIENT_ID'
                    };
                }
                filters.cliente_id = clienteId;
            }

            if (query.devolvido !== undefined) {
                filters.devolvido = query.devolvido === 'true';
            }

            if (query.data_inicio) {
                filters.data_inicio = query.data_inicio;
            }

            if (query.data_fim) {
                filters.data_fim = query.data_fim;
            }

            // Aplicar paginação
            if (query.page) {
                const page = parseInt(query.page);
                if (isNaN(page) || page < 1) {
                    return {
                        success: false,
                        message: 'Número da página deve ser um número positivo',
                        code: 'INVALID_PAGE'
                    };
                }
                pagination.page = page;
            }

            if (query.limit) {
                const limit = parseInt(query.limit);
                if (isNaN(limit) || limit < 1 || limit > 100) {
                    return {
                        success: false,
                        message: 'Limite deve ser um número entre 1 e 100',
                        code: 'INVALID_LIMIT'
                    };
                }
                pagination.limit = limit;
            }

            const resultado = await CondicionaisRepository.getAllCondicionais(filters, pagination);

            return {
                success: true,
                message: 'Condicionais listados com sucesso',
                data: resultado
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro ao listar condicionais: ${error.message}`,
                code: 'LIST_ERROR'
            };
        }
    }

    // Buscar condicional por ID
    static async buscarCondicionalPorId(id) {
        try {
            const condicionalId = parseInt(id);
            if (isNaN(condicionalId)) {
                return {
                    success: false,
                    message: 'ID do condicional deve ser um número válido',
                    code: 'INVALID_ID'
                };
            }

            const condicional = await CondicionaisRepository.getCondicionalById(condicionalId);

            if (!condicional) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            return {
                success: true,
                message: 'Condicional encontrado com sucesso',
                data: condicional
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro ao buscar condicional: ${error.message}`,
                code: 'SEARCH_ERROR'
            };
        }
    }

    // Criar novo condicional
    static async criarCondicional(condicionalData) {
        try {
            // Validar data de devolução (não pode ser no passado)
            const dataDevolucao = new Date(condicionalData.data_devolucao);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);

            if (dataDevolucao < hoje) {
                return {
                    success: false,
                    message: 'Data de devolução não pode ser no passado',
                    code: 'INVALID_RETURN_DATE'
                };
            }

            // Validar se há itens
            if (!condicionalData.itens || condicionalData.itens.length === 0) {
                return {
                    success: false,
                    message: 'É necessário informar pelo menos um item para o condicional',
                    code: 'NO_ITEMS'
                };
            }

            // Validar quantidades dos itens
            for (let i = 0; i < condicionalData.itens.length; i++) {
                const item = condicionalData.itens[i];
                
                if (!item.quantidade || item.quantidade <= 0) {
                    return {
                        success: false,
                        message: `Quantidade do item ${i + 1} deve ser maior que zero`,
                        code: 'INVALID_QUANTITY'
                    };
                }

                if (!item.roupas_id && !item.nome_item) {
                    return {
                        success: false,
                        message: `Item ${i + 1} deve ter ID ou nome informado`,
                        code: 'MISSING_ITEM_IDENTIFIER'
                    };
                }
            }

            const novoCondicional = await CondicionaisRepository.createCondicional(condicionalData);

            return {
                success: true,
                message: 'Condicional criado com sucesso',
                data: novoCondicional
            };

        } catch (error) {
            // Tratamento específico para erros conhecidos
            if (error.message.includes('Cliente com ID')) {
                return {
                    success: false,
                    message: error.message,
                    code: 'CLIENT_NOT_FOUND'
                };
            }

            if (error.message.includes('Item não encontrado')) {
                return {
                    success: false,
                    message: error.message,
                    code: 'ITEM_NOT_FOUND'
                };
            }

            if (error.message.includes('Estoque insuficiente')) {
                return {
                    success: false,
                    message: error.message,
                    code: 'INSUFFICIENT_STOCK'
                };
            }

            return {
                success: false,
                message: `Erro ao criar condicional: ${error.message}`,
                code: 'CREATE_ERROR'
            };
        }
    }

    // Atualizar condicional
    static async atualizarCondicional(id, updateData) {
        try {
            const condicionalId = parseInt(id);
            if (isNaN(condicionalId)) {
                return {
                    success: false,
                    message: 'ID do condicional deve ser um número válido',
                    code: 'INVALID_ID'
                };
            }

            // Verificar se o condicional existe
            const condicionalExistente = await CondicionaisRepository.getCondicionalById(condicionalId);
            if (!condicionalExistente) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            // Verificar se já foi devolvido
            if (condicionalExistente.devolvido) {
                return {
                    success: false,
                    message: 'Não é possível atualizar um condicional já devolvido',
                    code: 'CONDICIONAL_ALREADY_RETURNED'
                };
            }

            // Validar data de devolução se fornecida
            if (updateData.data_devolucao) {
                const dataDevolucao = new Date(updateData.data_devolucao);
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);

                if (dataDevolucao < hoje) {
                    return {
                        success: false,
                        message: 'Data de devolução não pode ser no passado',
                        code: 'INVALID_RETURN_DATE'
                    };
                }
            }

            // Validar cliente se fornecido
            if (updateData.cliente_id) {
                const clienteId = parseInt(updateData.cliente_id);
                if (isNaN(clienteId)) {
                    return {
                        success: false,
                        message: 'ID do cliente deve ser um número válido',
                        code: 'INVALID_CLIENT_ID'
                    };
                }
                updateData.cliente_id = clienteId;
            }

            const condicionalAtualizado = await CondicionaisRepository.updateCondicional(condicionalId, updateData);

            return {
                success: true,
                message: 'Condicional atualizado com sucesso',
                data: condicionalAtualizado
            };

        } catch (error) {
            // Tratamento específico para erros conhecidos
            if (error.code === 'P2025') {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            return {
                success: false,
                message: `Erro ao atualizar condicional: ${error.message}`,
                code: 'UPDATE_ERROR'
            };
        }
    }

    // Devolver item específico
    static async devolverItem(condicionalId, itemData) {
        try {
            const id = parseInt(condicionalId);
            if (isNaN(id)) {
                return {
                    success: false,
                    message: 'ID do condicional deve ser um número válido',
                    code: 'INVALID_ID'
                };
            }

            const roupasId = parseInt(itemData.roupas_id);
            if (isNaN(roupasId)) {
                return {
                    success: false,
                    message: 'ID do item deve ser um número válido',
                    code: 'INVALID_ITEM_ID'
                };
            }

            const quantidade = parseInt(itemData.quantidade);
            if (isNaN(quantidade) || quantidade <= 0) {
                return {
                    success: false,
                    message: 'Quantidade deve ser um número maior que zero',
                    code: 'INVALID_QUANTITY'
                };
            }

            // Verificar se o condicional existe
            const condicional = await CondicionaisRepository.getCondicionalById(id);
            if (!condicional) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            if (condicional.devolvido) {
                return {
                    success: false,
                    message: 'Condicional já foi devolvido completamente',
                    code: 'CONDICIONAL_ALREADY_RETURNED'
                };
            }

            const resultado = await CondicionaisRepository.devolverItem(id, roupasId, quantidade);

            return {
                success: true,
                message: `Item devolvido com sucesso. Quantidade devolvida: ${resultado.quantidadeDevolvida}. Itens restantes no condicional: ${resultado.itensRestantes}`,
                data: resultado
            };

        } catch (error) {
            if (error.message.includes('Item não encontrado no condicional')) {
                return {
                    success: false,
                    message: 'Item não encontrado neste condicional',
                    code: 'ITEM_NOT_IN_CONDICIONAL'
                };
            }

            if (error.message.includes('Quantidade a devolver')) {
                return {
                    success: false,
                    message: error.message,
                    code: 'INVALID_RETURN_QUANTITY'
                };
            }

            return {
                success: false,
                message: `Erro ao devolver item: ${error.message}`,
                code: 'RETURN_ERROR'
            };
        }
    }

    // Finalizar condicional
    static async finalizarCondicional(id) {
        try {
            const condicionalId = parseInt(id);
            if (isNaN(condicionalId)) {
                return {
                    success: false,
                    message: 'ID do condicional deve ser um número válido',
                    code: 'INVALID_ID'
                };
            }

            // Verificar se o condicional existe
            const condicional = await CondicionaisRepository.getCondicionalById(condicionalId);
            if (!condicional) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            if (condicional.devolvido) {
                return {
                    success: false,
                    message: 'Condicional já foi finalizado',
                    code: 'CONDICIONAL_ALREADY_FINALIZED'
                };
            }

            const condicionalFinalizado = await CondicionaisRepository.finalizarCondicional(condicionalId);

            return {
                success: true,
                message: 'Condicional finalizado com sucesso. Todos os itens foram devolvidos ao estoque',
                data: condicionalFinalizado
            };

        } catch (error) {
            if (error.message.includes('não possui itens ou já foi finalizado')) {
                return {
                    success: false,
                    message: 'Condicional não possui itens para finalizar ou já foi finalizado',
                    code: 'NO_ITEMS_TO_FINALIZE'
                };
            }

            return {
                success: false,
                message: `Erro ao finalizar condicional: ${error.message}`,
                code: 'FINALIZE_ERROR'
            };
        }
    }

    // Deletar condicional
    static async deletarCondicional(id) {
        try {
            const condicionalId = parseInt(id);
            if (isNaN(condicionalId)) {
                return {
                    success: false,
                    message: 'ID do condicional deve ser um número válido',
                    code: 'INVALID_ID'
                };
            }

            // Verificar se o condicional existe
            const condicional = await CondicionaisRepository.getCondicionalById(condicionalId);
            if (!condicional) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            await CondicionaisRepository.deleteCondicional(condicionalId);

            return {
                success: true,
                message: 'Condicional deletado com sucesso. Estoque foi restaurado',
                data: { id: condicionalId }
            };

        } catch (error) {
            if (error.code === 'P2025') {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            return {
                success: false,
                message: `Erro ao deletar condicional: ${error.message}`,
                code: 'DELETE_ERROR'
            };
        }
    }

    // Obter estatísticas de condicionais
    static async obterEstatisticas(query) {
        try {
            const filters = {};

            if (query.data_inicio) {
                filters.data_inicio = query.data_inicio;
            }

            if (query.data_fim) {
                filters.data_fim = query.data_fim;
            }

            const stats = await CondicionaisRepository.getCondicionaisStats(filters);

            return {
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: stats
            };

        } catch (error) {
            return {
                success: false,
                message: `Erro ao obter estatísticas: ${error.message}`,
                code: 'STATS_ERROR'
            };
        }
    }

    // Converter condicional em venda
    static async converterEmVenda(condicionalId, dadosVenda) {
        try {
            // 1. Buscar o condicional
            const condicional = await CondicionaisRepository.buscarPorId(condicionalId);
            if (!condicional) {
                return {
                    success: false,
                    message: 'Condicional não encontrado',
                    code: 'CONDICIONAL_NOT_FOUND'
                };
            }

            if (condicional.devolvido) {
                return {
                    success: true,
                    message: 'Condicional já havia sido finalizado anteriormente',
                    data: {
                        venda: null,
                        condicional_atualizado: condicional,
                        itens_vendidos: [],
                        itens_devolvidos: [],
                        resumo: {
                            valor_total_venda: 0,
                            desconto_aplicado: 0,
                            valor_final: 0,
                            condicional_finalizado: true
                        }
                    },
                    code: 'CONDICIONAL_ALREADY_FINISHED'
                };
            }

            // 2. Processar itens para venda
            let itensVenda = [];
            let itensRestantes = [];
            
            if (dadosVenda.itens_vendidos === 'todos') {
                // Vender todos os itens
                itensVenda = condicional.CondicionaisItens.map(item => ({
                    roupas_id: item.roupas_id,
                    nome_item: item.Roupa.nome,
                    quantidade: item.quatidade, // Note o nome no banco
                    preco: item.Roupa.preco
                }));
            } else {
                // Vender itens específicos
                for (const itemVenda of dadosVenda.itens_vendidos) {
                    const itemCondicional = condicional.CondicionaisItens.find(
                        item => item.roupas_id === itemVenda.roupas_id
                    );

                    if (!itemCondicional) {
                        return {
                            success: false,
                            message: `Item ${itemVenda.roupas_id} não encontrado no condicional`,
                            code: 'ITEM_NOT_IN_CONDICIONAL'
                        };
                    }

                    if (itemVenda.quantidade > itemCondicional.quatidade) {
                        return {
                            success: false,
                            message: `Quantidade solicitada (${itemVenda.quantidade}) maior que disponível (${itemCondicional.quatidade}) para item ${itemCondicional.Roupa.nome}`,
                            code: 'INVALID_QUANTITY'
                        };
                    }

                    // Adicionar à venda
                    itensVenda.push({
                        roupas_id: itemVenda.roupas_id,
                        nome_item: itemCondicional.Roupa.nome,
                        quantidade: itemVenda.quantidade,
                        preco: itemCondicional.Roupa.preco
                    });

                    // Calcular itens restantes no condicional
                    const quantidadeRestante = itemCondicional.quatidade - itemVenda.quantidade;
                    if (quantidadeRestante > 0) {
                        itensRestantes.push({
                            roupas_id: itemVenda.roupas_id,
                            quantidade: quantidadeRestante
                        });
                    }
                }

                // Adicionar itens que não foram vendidos aos restantes
                for (const item of condicional.CondicionaisItens) {
                    const itemVendido = dadosVenda.itens_vendidos.find(
                        vendido => vendido.roupas_id === item.roupas_id
                    );
                    
                    if (!itemVendido) {
                        itensRestantes.push({
                            roupas_id: item.roupas_id,
                            quantidade: item.quatidade
                        });
                    }
                }
            }

            // 3. Calcular valor total da venda
            const valorTotal = itensVenda.reduce((total, item) => {
                return total + (item.preco * item.quantidade);
            }, 0);

            // 4. Criar venda
            const valorFinal = valorTotal - (dadosVenda.desconto || 0);
            const dadosVendaCompleta = {
                forma_pgto: dadosVenda.forma_pagamento,
                valor_total: parseFloat(valorTotal.toFixed(2)),
                desconto: parseFloat((dadosVenda.desconto || 0).toFixed(2)),
                valor_pago: parseFloat(valorFinal.toFixed(2)),
                nome_cliente: condicional.Cliente ? condicional.Cliente.nome : undefined,
                telefone_cliente: condicional.Cliente ? condicional.Cliente.telefone : undefined,
                descricao_permuta: dadosVenda.descricao_permuta || undefined,
                itens: itensVenda
            };

            const venda = await VendasService.createVendaFromCondicional(dadosVendaCompleta);

            // 5. Atualizar condicional
            if (itensRestantes.length === 0) {
                // Todos os itens foram vendidos - marcar condicional como finalizado sem devolver estoque
                await CondicionaisRepository.finalizarCondicionalSemDevolver(condicionalId);
            } else {
                // Atualizar quantidades dos itens restantes no condicional
                await CondicionaisRepository.atualizarItensCondicional(condicionalId, itensRestantes);
            }

            // 6. Buscar condicional atualizado
            const condicionalAtualizado = await CondicionaisRepository.buscarPorId(condicionalId);

            return {
                success: true,
                message: `Condicional convertido em venda com sucesso. ${itensVenda.length} item(ns) vendido(s)${itensRestantes.length > 0 ? `, ${itensRestantes.length} item(ns) ainda no condicional` : ', condicional finalizado'}`,
                data: {
                    venda: venda,
                    condicional_atualizado: condicionalAtualizado,
                    itens_vendidos: itensVenda,
                    itens_devolvidos: [], // Sem devolução automática ao estoque durante a venda
                    resumo: {
                        valor_total_venda: valorTotal,
                        desconto_aplicado: dadosVenda.desconto || 0,
                        valor_final: valorTotal - (dadosVenda.desconto || 0),
                        condicional_finalizado: itensRestantes.length === 0
                    }
                }
            };

        } catch (error) {
            console.error("Erro ao converter condicional em venda:", error);
            return {
                success: false,
                message: `Erro ao converter condicional em venda: ${error.message}`,
                code: 'CONVERSION_ERROR'
            };
        }
    }

    // Relatório de condicionais ativos
    static async obterRelatorioAtivos(filtros = {}) {
        try {
            const resultado = await CondicionaisRepository.relatorioCondicionaisAtivos(filtros);
            
            return {
                success: true,
                message: 'Relatório de condicionais ativos obtido com sucesso',
                data: {
                    resumo: resultado.estatisticas,
                    condicionais: resultado.condicionais.map(condicional => ({
                        id: condicional.id,
                        cliente: {
                            id: condicional.Cliente.id,
                            nome: condicional.Cliente.nome,
                            email: condicional.Cliente.email,
                            telefone: condicional.Cliente.telefone
                        },
                        data_criacao: condicional.data,
                        data_devolucao: condicional.data_devolucao,
                        dias_restantes: Math.ceil((new Date(condicional.data_devolucao) - new Date()) / (1000 * 60 * 60 * 24)),
                        status: new Date(condicional.data_devolucao) < new Date() ? 'vencido' : 'ativo',
                        itens: condicional.CondicionaisItens.map(item => ({
                            id: item.id,
                            quantidade: item.quatidade,
                            roupa: {
                                id: item.Roupa.id,
                                nome: item.Roupa.nome,
                                tipo: item.Roupa.tipo,
                                tamanho: item.Roupa.tamanho,
                                cor: item.Roupa.cor,
                                preco: item.Roupa.preco,
                                valor_total: item.quatidade * item.Roupa.preco
                            }
                        })),
                        valor_total: condicional.CondicionaisItens.reduce((acc, item) => 
                            acc + (item.quatidade * item.Roupa.preco), 0)
                    }))
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao obter relatório de condicionais ativos: ${error.message}`,
                code: 'REPORT_ERROR'
            };
        }
    }

    // Relatório de condicionais devolvidos
    static async obterRelatorioDevolvidos(filtros = {}) {
        try {
            const resultado = await CondicionaisRepository.relatorioCondicionaisDevolvidos(filtros);
            
            return {
                success: true,
                message: 'Relatório de condicionais devolvidos obtido com sucesso',
                data: {
                    resumo: resultado.estatisticas,
                    condicionais: resultado.condicionais.map(condicional => ({
                        id: condicional.id,
                        cliente: {
                            id: condicional.Cliente.id,
                            nome: condicional.Cliente.nome,
                            email: condicional.Cliente.email,
                            telefone: condicional.Cliente.telefone
                        },
                        data_criacao: condicional.data,
                        data_devolucao: condicional.data_devolucao,
                        data_efetiva_devolucao: condicional.devolvido ? condicional.data : null,
                        itens: condicional.CondicionaisItens.map(item => ({
                            id: item.id,
                            quantidade: item.quatidade,
                            roupa: {
                                id: item.Roupa.id,
                                nome: item.Roupa.nome,
                                tipo: item.Roupa.tipo,
                                tamanho: item.Roupa.tamanho,
                                cor: item.Roupa.cor,
                                preco: item.Roupa.preco,
                                valor_total: item.quatidade * item.Roupa.preco
                            }
                        })),
                        valor_total: condicional.CondicionaisItens.reduce((acc, item) => 
                            acc + (item.quatidade * item.Roupa.preco), 0)
                    }))
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao obter relatório de condicionais devolvidos: ${error.message}`,
                code: 'REPORT_ERROR'
            };
        }
    }

    // Atualizar status de itens
    static async atualizarStatusItens(roupasIds, novoStatus) {
        try {
            const statusValidos = ['disponivel', 'em_condicional', 'vendido'];
            
            if (!statusValidos.includes(novoStatus)) {
                return {
                    success: false,
                    message: `Status inválido. Valores permitidos: ${statusValidos.join(', ')}`,
                    code: 'INVALID_STATUS'
                };
            }

            const resultado = await CondicionaisRepository.atualizarStatusItens(roupasIds, novoStatus);
            
            return {
                success: true,
                message: `Status de ${resultado.length} item(ns) atualizado(s) com sucesso`,
                data: {
                    itens_atualizados: resultado,
                    novo_status: novoStatus
                }
            };
        } catch (error) {
            return {
                success: false,
                message: `Erro ao atualizar status dos itens: ${error.message}`,
                code: 'STATUS_UPDATE_ERROR'
            };
        }
    }
}

export default CondicionaisService;