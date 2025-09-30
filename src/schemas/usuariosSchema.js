import { z } from "zod";

class UsuariosSchema {
    static id = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
        })
    });

    static create = z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        email: z.string().email("Email deve ter um formato válido"),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
    });

    static update = z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
        email: z.string().email("Email deve ter um formato válido").optional(),
        senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").optional()
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
        nome: z.string().optional(),
        email: z.string().optional()
    });
}

export default UsuariosSchema;
