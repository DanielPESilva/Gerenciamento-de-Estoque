import ItensService from "../services/itensService.js";
import ItensSchema from "../schemas/itensSchema.js";
import { APIError } from "../utils/wrapException.js";

class ItensController {
    static async getAll(req, res) {
        // Validação dos query parameters
        const queryValidation = ItensSchema.query.safeParse(req.query);
        
        if (!queryValidation.success) {
            throw new APIError(
                queryValidation.error?.issues?.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })) || [{ path: "validation", message: "Erro de validação" }],
                400
            );
        }

        const { page = 1, limit = 10, tipo, cor, tamanho } = queryValidation.data;
        
        const filters = {};
        if (tipo) filters.tipo = tipo;
        if (cor) filters.cor = cor;
        if (tamanho) filters.tamanho = tamanho;

        const pagination = { page, limit };

        const result = await ItensService.getAllItens(filters, pagination);
        
        return res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    }

    static async getById(req, res) {
        // Validação do ID
        const paramValidation = ItensSchema.id.safeParse(req.params);
        
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

        const item = await ItensService.getItemById(id);

        if (!item) {
            throw new APIError(
                [{ path: "ID", message: "Item não encontrado com o ID informado" }],
                404
            );
        }

        return res.status(200).json({
            success: true,
            data: item
        });
    }

    static async create(req, res) {
        // Validação dos dados de entrada
        const bodyValidation = ItensSchema.create.safeParse(req.body);
        
        if (!bodyValidation.success) {
            throw new APIError(
                bodyValidation.error?.issues?.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })) || [{ path: "validation", message: "Erro de validação" }],
                400
            );
        }

        const item = await ItensService.createItem(bodyValidation.data);

        return res.status(201).json({
            success: true,
            data: item
        });
    }

    static async update(req, res) {
        // Validação do ID
        const paramValidation = ItensSchema.id.safeParse(req.params);
        
        if (!paramValidation.success) {
            throw new APIError(
                paramValidation.error?.issues?.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })) || [{ path: "validation", message: "Erro de validação" }],
                400
            );
        }

        // Validação dos dados de entrada
        const bodyValidation = ItensSchema.update.safeParse(req.body);
        
        if (!bodyValidation.success) {
            throw new APIError(
                bodyValidation.error?.issues?.map(err => ({
                    path: err.path.join('.'),
                    message: err.message
                })) || [{ path: "validation", message: "Erro de validação" }],
                400
            );
        }

        const { id } = paramValidation.data;

        // Verificar se o item existe
        const existingItem = await ItensService.getItemById(id);
        if (!existingItem) {
            throw new APIError(
                [{ path: "ID", message: "Item não encontrado com o ID informado" }],
                404
            );
        }

        const item = await ItensService.updateItem(id, bodyValidation.data);

        return res.status(200).json({
            success: true,
            data: item
        });
    }

    static async delete(req, res) {
        // Validação do ID
        const paramValidation = ItensSchema.id.safeParse(req.params);
        
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

        // Verificar se o item existe
        const existingItem = await ItensService.getItemById(id);
        if (!existingItem) {
            throw new APIError(
                [{ path: "ID", message: "Item não encontrado com o ID informado" }],
                404
            );
        }

        await ItensService.deleteItem(id);

        return res.status(204).send();
    }
}

export default ItensController;
