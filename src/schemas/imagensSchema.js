import { z } from 'zod';

class ImagensSchema {
    static idSchema = z.object({
        id: z.number().int().positive("ID deve ser um número positivo")
    });

    static itemIdSchema = z.object({
        item_id: z.coerce.number().int().positive("ID do item deve ser um número positivo")
    });

    static createSchema = z.object({
        item_id: z.coerce.number().int().positive("ID do item deve ser um número positivo"),
        descricao: z.string().optional()
    });
}

export default ImagensSchema;