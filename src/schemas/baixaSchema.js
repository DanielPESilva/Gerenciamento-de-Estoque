import { z } from "zod";

class BaixaSchema {
    static id = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
        })
    });

    static itemId = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
        }),
        item_id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "Item ID deve ser um número válido maior que 0"
        })
    });

    static query = z.object({
        page: z.preprocess(
            (val) => val ? parseInt(val) : 1,
            z.number().int().min(1, "Page deve ser um número válido maior ou igual a 1").optional().default(1)
        ),
        limit: z.preprocess(
            (val) => val ? parseInt(val) : 10,
            z.number().int().min(1, "Limit deve ser pelo menos 1").max(100, "Limit deve ser no máximo 100").optional().default(10)
        ),
        data_inicio: z.string().optional(),
        data_fim: z.string().optional(),
        motivo: z.enum(["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"]).optional(),
        usuario_id: z.preprocess(
            (val) => val ? parseInt(val) : undefined,
            z.number().int().positive().optional()
        )
    });

    static create = z.object({
        motivo: z.enum(
            ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"],
            { message: "Motivo deve ser um dos valores válidos" }
        ),
        observacoes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
        usuario_id: z.number().int().positive("ID do usuário deve ser positivo"),
        itens: z.array(
            z.object({
                roupas_id: z.number().int().positive("ID da roupa deve ser positivo").optional(),
                nome_item: z.string().min(1, "Nome do item deve ter pelo menos 1 caractere").optional(),
                quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
                observacao_item: z.string().max(200, "Observação do item deve ter no máximo 200 caracteres").optional()
            }).refine(data => data.roupas_id || data.nome_item, {
                message: "Deve informar roupas_id ou nome_item"
            })
        ).min(1, "Deve ter pelo menos um item na baixa")
    });

    static update = z.object({
        motivo: z.enum(
            ["Perda", "Roubo", "Uso interno", "Descarte por obsolescência", "Manchada", "Defeito", "Doação"],
            { message: "Motivo deve ser um dos valores válidos" }
        ).optional(),
        observacoes: z.string().max(500, "Observações devem ter no máximo 500 caracteres").optional(),
        usuario_id: z.number().int().positive("ID do usuário deve ser positivo").optional()
    });

    static addItem = z.object({
        roupas_id: z.number().int().positive("ID da roupa deve ser positivo").optional(),
        nome_item: z.string().min(1, "Nome do item deve ter pelo menos 1 caractere").optional(),
        quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
        observacao_item: z.string().max(200, "Observação do item deve ter no máximo 200 caracteres").optional()
    }).refine(data => data.roupas_id || data.nome_item, {
        message: "Deve informar roupas_id ou nome_item"
    });

    static updateItem = z.object({
        quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1").optional(),
        observacao_item: z.string().max(200, "Observação do item deve ter no máximo 200 caracteres").optional()
    });
}

export default BaixaSchema;