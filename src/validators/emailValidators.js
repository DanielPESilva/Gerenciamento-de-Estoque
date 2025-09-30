import { z } from 'zod';

// Schema para email simples
export const simpleEmailSchema = z.object({
  to: z.string()
    .email('Formato de email inválido')
    .min(1, 'Email é obrigatório'),
  subject: z.string()
    .min(1, 'Assunto é obrigatório')
    .max(200, 'Assunto deve ter no máximo 200 caracteres'),
  message: z.string()
    .min(1, 'Mensagem é obrigatória')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres'),
  isHtml: z.boolean().optional().default(false)
});





// Schema para item da venda
const saleItemSchema = z.object({
  nome: z.string().min(1, 'Nome do item é obrigatório'),
  quantidade: z.number()
    .int('Quantidade deve ser um número inteiro')
    .min(1, 'Quantidade deve ser maior que 0'),
  preco: z.number()
    .min(0, 'Preço deve ser maior ou igual a 0')
    .optional()
});

// Schema para notificação de venda
export const saleNotificationSchema = z.object({
  to: z.string()
    .email('Formato de email inválido')
    .min(1, 'Email é obrigatório'),
  clienteName: z.string()
    .min(1, 'Nome do cliente é obrigatório')
    .max(100, 'Nome do cliente deve ter no máximo 100 caracteres'),
  totalValue: z.number()
    .min(0, 'Valor total deve ser maior ou igual a 0'),
  saleDate: z.string()
    .optional(),
  items: z.array(saleItemSchema)
    .min(1, 'Pelo menos um item deve estar na venda')
    .max(50, 'Venda pode ter no máximo 50 itens')
});

