import { z } from "zod";

class ClientesSchema {
    static id = z.object({
        id: z.string().transform(val => parseInt(val)).refine(val => !isNaN(val) && val > 0, {
            message: "ID deve ser um número válido maior que 0"
        })
    });

    static create = z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
        email: z.string().email("Email deve ter um formato válido").optional().or(z.literal("")),
        cpf: z.string().regex(/^\d{11}$/, "CPF deve ter exatamente 11 dígitos numéricos").optional().or(z.literal("")),
        telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone deve ter no máximo 15 dígitos").optional().or(z.literal("")),
        endereco: z.string().max(200, "Endereço deve ter no máximo 200 caracteres").optional().or(z.literal(""))
    });

    static update = z.object({
        nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome deve ter no máximo 100 caracteres").optional(),
        email: z.string().email("Email deve ter um formato válido").optional().or(z.literal("")),
        cpf: z.string().regex(/^\d{11}$/, "CPF deve ter exatamente 11 dígitos numéricos").optional().or(z.literal("")),
        telefone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos").max(15, "Telefone deve ter no máximo 15 dígitos").optional().or(z.literal("")),
        endereco: z.string().max(200, "Endereço deve ter no máximo 200 caracteres").optional().or(z.literal(""))
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
        email: z.string().optional(),
        cpf: z.string().optional(),
        telefone: z.string().optional()
    });
}

export default ClientesSchema;
