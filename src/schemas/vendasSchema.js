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
}

export default VendasSchema;
