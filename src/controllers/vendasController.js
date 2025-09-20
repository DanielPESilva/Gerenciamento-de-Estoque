import VendasService from "../services/vendasService.js";
import VendasSchema from "../schemas/vendasSchema.js";
import { APIError } from "../utils/wrapException.js";

export const getAll = async (req, res) => {
    // Validação dos query parameters
    const queryValidation = VendasSchema.query.safeParse(req.query);
    
    if (!queryValidation.success) {
        throw new APIError(
            queryValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { 
        page = 1, 
        limit = 10, 
        data_inicio, 
        data_fim, 
        forma_pgto, 
        valor_min, 
        valor_max 
    } = queryValidation.data;
    
    const filters = {};
    if (data_inicio) filters.data_inicio = data_inicio;
    if (data_fim) filters.data_fim = data_fim;
    if (forma_pgto) filters.forma_pgto = forma_pgto;
    if (valor_min) filters.valor_min = valor_min;
    if (valor_max) filters.valor_max = valor_max;

    const pagination = { page, limit };

    const result = await VendasService.getAllVendas(filters, pagination);
    
    return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination
    });
};

export const getById = async (req, res) => {
    // Validação do ID
    const paramValidation = VendasSchema.id.safeParse(req.params);
    
    if (!paramValidation.success) {
        throw new APIError(
            paramValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { id } = paramValidation.data;

    const venda = await VendasService.getVendaById(id);

    if (!venda) {
        throw new APIError(
            [{ path: "ID", message: "Venda não encontrada com o ID informado" }],
            404
        );
    }

    return res.status(200).json({
        success: true,
        data: venda
    });
};

export const getStats = async (req, res) => {
    // Validação dos query parameters para estatísticas
    const queryValidation = VendasSchema.query.safeParse(req.query);
    
    if (!queryValidation.success) {
        throw new APIError(
            queryValidation.error?.issues?.map(err => ({
                path: err.path.join('.'),
                message: err.message
            })) || [{ path: "validation", message: "Erro de validação" }],
            400
        );
    }

    const { data_inicio, data_fim } = queryValidation.data;
    
    const filters = {};
    if (data_inicio) filters.data_inicio = data_inicio;
    if (data_fim) filters.data_fim = data_fim;

    const stats = await VendasService.getVendasStats(filters);
    
    return res.status(200).json({
        success: true,
        data: stats,
        message: "Estatísticas de vendas"
    });
};
