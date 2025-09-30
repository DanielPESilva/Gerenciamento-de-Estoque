export class APIError extends Error {
    constructor(errors, statusCode = 400) {
        super();
        this.errors = errors;
        this.statusCode = statusCode;
        this.name = 'APIError';
    }
}

export const wrapException = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            if (error instanceof APIError) {
                return res.status(error.statusCode).json({
                    success: false,
                    errors: error.errors
                });
            }
            
            // Erro genérico
            console.error('Erro não tratado:', error);
            return res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    };
};
