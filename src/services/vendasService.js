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
}

export default VendasService;
