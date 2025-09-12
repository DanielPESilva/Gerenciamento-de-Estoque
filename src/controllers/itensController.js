import ItensService from "../services/itensService.js";
import ItensSchema from "../schemas/itensSchema.js";
import { APIError } from "../utils/wrapException.js";
import { z } from "zod";

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

    static async patch(req, res) {
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

        // Validação dos dados de entrada (campos opcionais para PATCH)
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

        // Filtrar apenas os campos que foram enviados
        const updateData = Object.keys(bodyValidation.data).reduce((acc, key) => {
            if (bodyValidation.data[key] !== undefined) {
                acc[key] = bodyValidation.data[key];
            }
            return acc;
        }, {});

        const item = await ItensService.updateItem(id, updateData);

        return res.status(200).json({
            success: true,
            data: item
        });
    }

    static async addQuantidade(req, res) {
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

        // Validação da quantidade a adicionar
        const quantidadeSchema = z.object({
            quantidade: z.number().int().positive("Quantidade deve ser um número positivo")
        });

        const bodyValidation = quantidadeSchema.safeParse(req.body);
        
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
        const { quantidade } = bodyValidation.data;

        // Verificar se o item existe
        const existingItem = await ItensService.getItemById(id);
        if (!existingItem) {
            throw new APIError(
                [{ path: "ID", message: "Item não encontrado com o ID informado" }],
                404
            );
        }

        // Calcular nova quantidade (adicionar)
        const novaQuantidade = existingItem.quantidade + quantidade;

        const item = await ItensService.updateQuantidade(id, novaQuantidade);

        return res.status(200).json({
            success: true,
            message: `${quantidade} unidade(s) adicionada(s) ao estoque`,
            data: {
                id: item.id,
                nome: item.nome,
                quantidade_anterior: existingItem.quantidade,
                quantidade_adicionada: quantidade,
                quantidade_atual: novaQuantidade
            }
        });
    }

    static async removeQuantidade(req, res) {
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

        // Validação da quantidade a remover
        const quantidadeSchema = z.object({
            quantidade: z.number().int().positive("Quantidade deve ser um número positivo")
        });

        const bodyValidation = quantidadeSchema.safeParse(req.body);
        
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
        const { quantidade } = bodyValidation.data;

        // Verificar se o item existe
        const existingItem = await ItensService.getItemById(id);
        if (!existingItem) {
            throw new APIError(
                [{ path: "ID", message: "Item não encontrado com o ID informado" }],
                404
            );
        }

        // Verificar se há quantidade suficiente para remover
        if (existingItem.quantidade < quantidade) {
            throw new APIError(
                [{ path: "quantidade", message: `Quantidade insuficiente. Disponível: ${existingItem.quantidade}, Solicitado: ${quantidade}` }],
                400
            );
        }

        // Calcular nova quantidade (remover)
        const novaQuantidade = existingItem.quantidade - quantidade;

        const item = await ItensService.updateQuantidade(id, novaQuantidade);

        return res.status(200).json({
            success: true,
            message: `${quantidade} unidade(s) removida(s) do estoque`,
            data: {
                id: item.id,
                nome: item.nome,
                quantidade_anterior: existingItem.quantidade,
                quantidade_removida: quantidade,
                quantidade_atual: novaQuantidade
            }
        });
    }
}

export default ItensController;
