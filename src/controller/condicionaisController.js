import CondicionaisService from '../services/condicionaisService.js';
import condicionaisSchemas from '../schemas/condicionaisSchema.js';

class CondicionaisController {
    // GET /condicionais - Listar condicionais
    static async listarCondicionais(req, res) {
        try {
            const resultado = await CondicionaisService.listarCondicionais(req.query);

            if (!resultado.success) {
                return res.status(400).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // GET /condicionais/:id - Buscar condicional por ID
    static async buscarCondicionalPorId(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CondicionaisService.buscarCondicionalPorId(id);

            if (!resultado.success) {
                const statusCode = resultado.code === 'CONDICIONAL_NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // POST /condicionais - Criar novo condicional
    static async criarCondicional(req, res) {
        try {
            // Validar dados de entrada
            const validationResult = condicionaisSchemas.condicionaisCreateSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errors = validationResult.error.errors.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    code: 'VALIDATION_ERROR',
                    errors
                });
            }

            const resultado = await CondicionaisService.criarCondicional(validationResult.data);

            if (!resultado.success) {
                let statusCode = 400;
                
                // Mapear códigos de erro para status apropriados
                if (resultado.code === 'CLIENT_NOT_FOUND' || resultado.code === 'ITEM_NOT_FOUND') {
                    statusCode = 404;
                } else if (resultado.code === 'INSUFFICIENT_STOCK') {
                    statusCode = 409; // Conflict
                }

                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(201).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // PUT /condicionais/:id - Atualizar condicional
    static async atualizarCondicional(req, res) {
        try {
            const { id } = req.params;

            // Validar dados de entrada
            const validationResult = condicionaisSchemas.condicionaisUpdateSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errors = validationResult.error.errors.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    code: 'VALIDATION_ERROR',
                    errors
                });
            }

            const resultado = await CondicionaisService.atualizarCondicional(id, validationResult.data);

            if (!resultado.success) {
                const statusCode = resultado.code === 'CONDICIONAL_NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // POST /condicionais/:id/devolver-item - Devolver item específico
    static async devolverItem(req, res) {
        try {
            const { id } = req.params;

            // Validar dados de entrada
            const validationResult = condicionaisSchemas.condicionaisDevolverItemSchema.safeParse(req.body);

            if (!validationResult.success) {
                const errors = validationResult.error.errors.map(error => ({
                    field: error.path.join('.'),
                    message: error.message
                }));

                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    code: 'VALIDATION_ERROR',
                    errors
                });
            }

            const resultado = await CondicionaisService.devolverItem(id, validationResult.data);

            if (!resultado.success) {
                let statusCode = 400;
                
                if (resultado.code === 'CONDICIONAL_NOT_FOUND' || resultado.code === 'ITEM_NOT_IN_CONDICIONAL') {
                    statusCode = 404;
                }

                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // POST /condicionais/:id/finalizar - Finalizar condicional
    static async finalizarCondicional(req, res) {
        try {
            const { id } = req.params;

            // Validar dados de entrada (opcional)
            if (req.body && Object.keys(req.body).length > 0) {
                const validationResult = condicionaisSchemas.condicionaisFinalizarSchema.safeParse(req.body);

                if (!validationResult.success) {
                    const errors = validationResult.error.errors.map(error => ({
                        field: error.path.join('.'),
                        message: error.message
                    }));

                    return res.status(400).json({
                        success: false,
                        message: 'Dados inválidos',
                        code: 'VALIDATION_ERROR',
                        errors
                    });
                }
            }

            const resultado = await CondicionaisService.finalizarCondicional(id);

            if (!resultado.success) {
                const statusCode = resultado.code === 'CONDICIONAL_NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // DELETE /condicionais/:id - Deletar condicional
    static async deletarCondicional(req, res) {
        try {
            const { id } = req.params;
            const resultado = await CondicionaisService.deletarCondicional(id);

            if (!resultado.success) {
                const statusCode = resultado.code === 'CONDICIONAL_NOT_FOUND' ? 404 : 400;
                return res.status(statusCode).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // GET /condicionais/estatisticas - Obter estatísticas
    static async obterEstatisticas(req, res) {
        try {
            const resultado = await CondicionaisService.obterEstatisticas(req.query);

            if (!resultado.success) {
                return res.status(400).json({
                    success: false,
                    message: resultado.message,
                    code: resultado.code
                });
            }

            return res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.data
            });

        } catch (error) {
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
}

export default CondicionaisController;