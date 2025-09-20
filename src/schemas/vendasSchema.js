import { z } from "zod";

class VendasSchema {
    static id = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
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
        forma_pgto: z.string().min(1, "Forma de pagamento deve ter pelo menos 1 caractere").optional(),
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
            ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"],
            { message: "Forma de pagamento inválida" }
        ),
        valor_total: z.number().min(0, "Valor total deve ser maior ou igual a 0"),
        desconto: z.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
        valor_pago: z.number().min(0, "Valor pago deve ser maior ou igual a 0"),
        descricao_permuta: z.string().optional(), // Obrigatório apenas quando forma_pgto = "Permuta"
        itens: z.array(
            z.preprocess((data) => {
                // Remove campos undefined para evitar problemas de validação
                if (data && typeof data === 'object') {
                    const cleanData = { ...data };
                    if (cleanData.roupas_id === undefined) delete cleanData.roupas_id;
                    if (cleanData.nome_item === undefined) delete cleanData.nome_item;
                    return cleanData;
                }
                return data;
            }, z.object({
                // Aceita tanto ID quanto nome do item
                roupas_id: z.number().int().min(1, "ID da roupa deve ser um número válido").optional(),
                nome_item: z.string().min(1, "Nome do item deve ter pelo menos 1 caractere").optional(),
                quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1")
            }).refine((data) => {
                // Deve ter pelo menos um: roupas_id OU nome_item
                return data.roupas_id || data.nome_item;
            }, {
                message: "Deve informar o 'roupas_id' OU o 'nome_item' do produto"
            }))
        ).min(1, "Deve haver pelo menos um item na venda")
    }).refine((data) => {
        // Se for permuta, descricao_permuta é obrigatória
        if (data.forma_pgto === "Permuta") {
            return data.descricao_permuta && data.descricao_permuta.trim().length > 0;
        } else {
            // Para outras formas de pagamento, valor_pago deve ser <= valor_total
            return data.valor_pago <= data.valor_total;
        }
    }, {
        message: "Para permuta, descrição é obrigatória. Para outras formas, valor pago não pode ser maior que valor total."
    }).transform((data) => {
        // Se for permuta, forçar valores como zero
        if (data.forma_pgto === "Permuta") {
            data.valor_total = 0;
            data.desconto = 0;
            data.valor_pago = 0;
        }
        return data;
    });

    static update = z.object({
        forma_pgto: z.enum(
            ["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"],
            { message: "Forma de pagamento inválida" }
        ).optional(),
        valor_total: z.number().min(0, "Valor total deve ser maior ou igual a 0").optional(),
        desconto: z.number().min(0, "Desconto deve ser maior ou igual a 0").optional(),
        valor_pago: z.number().min(0, "Valor pago deve ser maior ou igual a 0").optional(),
        descricao_permuta: z.string().optional()
    });

}

export default VendasSchema;
