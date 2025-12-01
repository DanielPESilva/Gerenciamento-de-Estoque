import { z } from "zod";

class AuthSchema {
    static login = z.object({
        email: z.string().email('Email inválido'),
        senha: z.string().min(1, 'Senha é obrigatória'),
    });

    static register = z.object({
        nome: z.string().min(1, 'Nome é obrigatório'),
        email: z.string().email('Email inválido'),
        senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
        cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional().or(z.literal('')),
        cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos').optional().or(z.literal('')),
    });

    static forgotPassword = z.object({
        email: z.string().email('Email inválido'),
    });

    static resetPassword = z.object({
        email: z.string().email('Email inválido'),
        code: z.string().min(6, 'Código deve ter 6 caracteres').max(6, 'Código deve ter 6 caracteres'),
        senha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
    });

    static refreshToken = z.object({
        refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
    });
}

export default AuthSchema;