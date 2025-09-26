import { z } from "zod";

class CondicionaisSchema {
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
        cliente_id: z.preprocess(
            (val) => val ? parseInt(val) : undefined,
            z.number().int().min(1, "ID do cliente deve ser um número válido").optional()
        ),
        data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
        data_fim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD").optional(),
        devolvido: z.preprocess(
            (val) => {
                if (val === "true") return true;
                if (val === "false") return false;
                return undefined;
            },
            z.boolean().optional()
        )
    });

    static create = z.object({
        cliente_id: z.number().int().min(1, "ID do cliente deve ser um número válido"),
        data_devolucao: z.string().datetime("Data de devolução deve ser uma data válida"),
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
        ).min(1, "Deve haver pelo menos um item no condicional")
    });

    static update = z.object({
        cliente_id: z.number().int().min(1, "ID do cliente deve ser um número válido").optional(),
        data_devolucao: z.string().datetime("Data de devolução deve ser uma data válida").optional(),
        devolvido: z.boolean().optional()
    });

    static devolverItem = z.object({
        roupas_id: z.number().int().min(1, "ID da roupa deve ser um número válido"),
        quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1")
    });

    static finalizarCondicional = z.object({
        devolvido: z.boolean().default(true),
        observacoes: z.string().optional()
    });

    static converterVenda = z.object({
        itens_vendidos: z.union([
            z.literal("todos"),
            z.array(z.object({
                roupas_id: z.number().int().positive("ID da roupa deve ser positivo"),
                quantidade: z.number().int().min(1, "Quantidade deve ser pelo menos 1")
            })).min(1, "Deve especificar pelo menos um item para venda")
        ]),
        desconto: z.number().min(0, "Desconto deve ser maior ou igual a 0").default(0),
        forma_pagamento: z.enum(["Pix", "Dinheiro", "Cartão de Crédito", "Cartão de Débito", "Boleto", "Cheque", "Permuta"], {
            errorMap: () => ({ message: "Forma de pagamento deve ser: Pix, Dinheiro, Cartão de Crédito, Cartão de Débito, Boleto, Cheque ou Permuta" })
        }),
        observacoes: z.string().optional()
    });
}

export default CondicionaisSchema;