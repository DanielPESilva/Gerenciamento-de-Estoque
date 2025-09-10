import { z } from "zod";

class ItensSchema {
    static id = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
        })
    });

    static create = z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
        descricao: z.string().optional(),
        tipo: z.string().min(2, "Tipo deve ter pelo menos 2 caracteres"),
        tamanho: z.string().min(1, "Tamanho é obrigatório"),
        cor: z.string().min(2, "Cor deve ter pelo menos 2 caracteres"),
        preco: z.number().positive("Preço deve ser um valor positivo"),
        quantidade: z.number().int().nonnegative("Quantidade deve ser um número inteiro não negativo").default(0),
        usuarios_id: z.number().int().positive("ID do usuário deve ser um número válido")
    });

    static update = z.object({
        nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
        descricao: z.string().optional(),
        tipo: z.string().min(2, "Tipo deve ter pelo menos 2 caracteres").optional(),
        tamanho: z.string().min(1, "Tamanho é obrigatório").optional(),
        cor: z.string().min(2, "Cor deve ter pelo menos 2 caracteres").optional(),
        preco: z.number().positive("Preço deve ser um valor positivo").optional(),
        quantidade: z.number().int().nonnegative("Quantidade deve ser um número inteiro não negativo").optional(),
        usuarios_id: z.number().int().positive("ID do usuário deve ser um número válido").optional()
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
        tipo: z.string().optional(),
        cor: z.string().optional(),
        tamanho: z.string().optional()
    });
}

export default ItensSchema;
