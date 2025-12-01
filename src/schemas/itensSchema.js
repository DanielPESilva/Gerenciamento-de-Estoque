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
        quantidade: z.number().int().nonnegative("Quantidade deve ser um número inteiro não negativo").default(0)
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
        tamanho: z.string().optional(),
        nome: z.string().optional(),
        preco: z.preprocess(
            (val) => val ? parseFloat(val) : undefined,
            z.number().positive().optional()
        )
    });

    static quantidade = z.object({
        quantidade: z.number().int().positive("Quantidade deve ser um número positivo")
    });

    static search = z.object({
        q: z.string().min(1, "Termo de busca deve ter pelo menos 1 caractere").optional(),
        nome: z.string().min(1, "Nome deve ter pelo menos 1 caractere").optional(),
        limit: z.preprocess(
            (val) => val ? parseInt(val) : 10,
            z.number().int().min(1, "Limit deve ser pelo menos 1").max(50, "Limit deve ser no máximo 50").optional().default(10)
        )
    }).refine((data) => data.q || data.nome, {
        message: "Deve informar 'q' ou 'nome' para buscar"
    });
}

export default ItensSchema;
