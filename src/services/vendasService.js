import VendasRepository from "../repository/vendasRepository.js";

class VendasService {
    // Buscar todas as vendas com filtros e paginação
    static async getAllVendas(filters = {}, pagination = { page: 1, limit: 10 }) {
        const result = await VendasRepository.getAllVendas(filters, pagination);
        
        // Processar os dados para melhor apresentação
        const processedData = result.data.map(venda => ({
            id: venda.id,
            data_venda: venda.data_venda,
            forma_pgto: venda.forma_pgto,
            valor_total: venda.valor_total,
            desconto: venda.desconto,
            valor_pago: venda.valor_pago,
            descricao_permuta: venda.descricao_permuta, // Incluir descrição da permuta
            quantidade_itens: venda.VendasItens.length,
            itens: venda.VendasItens.map(item => ({
                id: item.id,
                quantidade: item.quatidade,
                roupa: item.Roupa
            }))
        }));

        return {
            data: processedData,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            }
        };
    }

    // Buscar venda por ID
    static async getVendaById(id) {
        const venda = await VendasRepository.getVendaById(id);
        
        if (!venda) {
            return null;
        }

        // Processar os dados para melhor apresentação
        return {
            id: venda.id,
            data_venda: venda.data_venda,
            forma_pgto: venda.forma_pgto,
            valor_total: venda.valor_total,
            desconto: venda.desconto,
            valor_pago: venda.valor_pago,
            descricao_permuta: venda.descricao_permuta, // Incluir descrição da permuta
            quantidade_itens: venda.VendasItens.length,
            itens: venda.VendasItens.map(item => ({
                id: item.id,
                quantidade: item.quatidade,
                roupa: item.Roupa
            }))
        };
    }

    // Buscar estatísticas de vendas
    static async getVendasStats(filters = {}) {
        return await VendasRepository.getVendasStats(filters);
    }

    // Buscar vendas por período
    static async getVendasPorPeriodo(dataInicio, dataFim, pagination = { page: 1, limit: 10 }) {
        const filters = {
            data_inicio: dataInicio,
            data_fim: dataFim
        };
        
        return await this.getAllVendas(filters, pagination);
    }

    // Criar nova venda
    static async createVenda(vendaData) {
        try {
            const novaVenda = await VendasRepository.createVenda(vendaData);
            
            // Processar dados para resposta
            return {
                id: novaVenda.id,
                data_venda: novaVenda.data_venda,
                forma_pgto: novaVenda.forma_pgto,
                valor_total: novaVenda.valor_total,
                desconto: novaVenda.desconto,
                valor_pago: novaVenda.valor_pago,
                descricao_permuta: novaVenda.descricao_permuta,
                quantidade_itens: novaVenda.VendasItens.length,
                itens: novaVenda.VendasItens.map(item => ({
                    id: item.id,
                    quantidade: item.quatidade,
                    roupa: {
                        ...item.Roupa,
                        estoque_atualizado: item.Roupa.quantidade // Quantidade após a venda
                    }
                })),
                resumo: {
                    total_itens_vendidos: novaVenda.VendasItens.reduce((acc, item) => acc + item.quatidade, 0),
                    valor_com_desconto: novaVenda.valor_total - novaVenda.desconto,
                    diferenca_pagamento: novaVenda.valor_pago - (novaVenda.valor_total - novaVenda.desconto)
                }
            };
        } catch (error) {
            // Repassar erros de validação de estoque
            throw new Error(error.message);
        }
    }

    // Atualizar venda existente
    static async updateVenda(id, updateData) {
        try {
            const vendaAtualizada = await VendasRepository.updateVenda(id, updateData);
            
            return {
                id: vendaAtualizada.id,
                data_venda: vendaAtualizada.data_venda,
                forma_pgto: vendaAtualizada.forma_pgto,
                valor_total: vendaAtualizada.valor_total,
                desconto: vendaAtualizada.desconto,
                valor_pago: vendaAtualizada.valor_pago,
                descricao_permuta: vendaAtualizada.descricao_permuta,
                quantidade_itens: vendaAtualizada.VendasItens.length,
                itens: vendaAtualizada.VendasItens.map(item => ({
                    id: item.id,
                    quantidade: item.quatidade,
                    roupa: item.Roupa
                }))
            };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Deletar venda
    static async deleteVenda(id) {
        try {
            await VendasRepository.deleteVenda(id);
            return { message: "Venda deletada com sucesso e estoque restaurado" };
        } catch (error) {
            throw new Error(error.message);
        }
    }

    // Criar venda a partir de um condicional sem ajustar estoque
    static async createVendaFromCondicional(vendaData) {
        return await VendasRepository.createVendaFromCondicional(vendaData);
    }
}

export default VendasService;
