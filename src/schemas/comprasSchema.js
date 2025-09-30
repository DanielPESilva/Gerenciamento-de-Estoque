import { z } from "zod";

class ComprasSchema {
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
        data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
        data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
        fornecedor: z.string().min(1, "Fornecedor deve ter pelo menos 1 caractere").optional(),
        valor_min: z.preprocess(
            (val) => val ? parseFloat(val) : undefined,
            z.number().min(0, "Valor mínimo deve ser maior ou igual a 0").optional()
        ),
        valor_max: z.preprocess(
            (val) => val ? parseFloat(val) : undefined,
            z.number().min(0, "Valor máximo deve ser maior ou igual a 0").optional()
        )
    });

    static create = z.object({
        forma_pgto: z.enum(
            ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Transferência"],
            { message: "Forma de pagamento inválida" }
        ),
        valor_pago: z.number().min(0, "Valor pago deve ser maior ou igual a 0"),
        fornecendor: z.string().min(2, "Nome do fornecedor deve ter pelo menos 2 caracteres").optional(),
        telefone_forncedor: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").optional(),
        itens: z.array(
            z.object({
                roupas_id: z.number().int().positive("ID da roupa deve ser positivo").optional(),
                nome_item: z.string().min(1, "Nome do item deve ter pelo menos 1 caractere").optional(),
                quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
                valor_peca: z.number().min(0, "Valor da peça deve ser maior ou igual a 0")
            }).refine(data => data.roupas_id || data.nome_item, {
                message: "Deve informar roupas_id ou nome_item"
            })
        ).min(1, "Deve ter pelo menos um item na compra")
    });

    static update = z.object({
        forma_pgto: z.enum(
            ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Transferência"],
            { message: "Forma de pagamento inválida" }
        ).optional(),
        valor_pago: z.number().min(0, "Valor pago deve ser maior ou igual a 0").optional(),
        fornecendor: z.string().min(2, "Nome do fornecedor deve ter pelo menos 2 caracteres").optional(),
        telefone_forncedor: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").optional()
    });

    static addItem = z.object({
        roupas_id: z.number().int().positive("ID da roupa deve ser positivo").optional(),
        nome_item: z.string().min(1, "Nome do item deve ter pelo menos 1 caractere").optional(),
        quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1"),
        valor_peca: z.number().min(0, "Valor da peça deve ser maior ou igual a 0")
    }).refine(data => data.roupas_id || data.nome_item, {
        message: "Deve informar roupas_id ou nome_item"
    });

    static updateItem = z.object({
        quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1").optional(),
        valor_peca: z.number().min(0, "Valor da peça deve ser maior ou igual a 0").optional()
    });

    static finalizar = z.object({
        observacoes: z.string().optional()
    });
}

export default ComprasSchema;