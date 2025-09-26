import CondicionaisRepository from '../repository/condicionaisRepository.js';

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
}

export default CondicionaisService;