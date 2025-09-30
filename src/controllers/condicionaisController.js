import CondicionaisService from '../services/condicionaisService.js';
import CondicionaisSchema from '../schemas/condicionaisSchema.js';

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
            const validationResult = CondicionaisSchema.create.safeParse(req.body);

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
            const validationResult = CondicionaisSchema.update.safeParse(req.body);

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
            const validationResult = CondicionaisSchema.devolverItem.safeParse(req.body);

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
                const validationResult = CondicionaisSchema.finalizarCondicional.safeParse(req.body);

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

    // POST /condicionais/:id/converter-venda - Converter condicional em venda
    static async converterEmVenda(req, res) {
        try {
            // Validar ID
            const idValidation = CondicionaisSchema.id.safeParse(req.params);
            if (!idValidation.success) {
                return res.status(400).json({
                    success: false,
                    message: "ID inválido",
                    errors: idValidation.error.errors,
                    code: 'INVALID_ID'
                });
            }

            // Validar dados da conversão
            console.log("Dados recebidos:", req.body);
            const dataValidation = CondicionaisSchema.converterVenda.safeParse(req.body);
            if (!dataValidation.success) {
                console.log("Erros de validação:", dataValidation.error.errors);
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos para conversão em venda",
                    errors: dataValidation.error.errors,
                    code: 'INVALID_DATA'
                });
            }

            const { id } = idValidation.data;
            const dadosVenda = dataValidation.data;

            const resultado = await CondicionaisService.converterEmVenda(id, dadosVenda);

            if (!resultado.success) {
                const statusCode = resultado.code === 'CONDICIONAL_NOT_FOUND' ? 404 : 
                                 resultado.code === 'INVALID_QUANTITY' ? 409 : 400;

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
            console.error("Erro ao converter condicional em venda:", error);
            return res.status(500).json({
                success: false,
                message: `Erro interno do servidor: ${error.message}`,
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }

    // GET /condicionais/relatorios/ativos - Relatório de condicionais ativos
    static async obterRelatorioAtivos(req, res) {
        try {
            const filtros = {};
            
            if (req.query.cliente_id) {
                filtros.cliente_id = parseInt(req.query.cliente_id);
            }
            
            if (req.query.data_inicio) {
                filtros.data_inicio = req.query.data_inicio;
            }
            
            if (req.query.data_fim) {
                filtros.data_fim = req.query.data_fim;
            }
            
            if (req.query.vencidos === 'true') {
                filtros.vencidos = true;
            }

            const resultado = await CondicionaisService.obterRelatorioAtivos(filtros);

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

    // GET /condicionais/relatorios/devolvidos - Relatório de condicionais devolvidos
    static async obterRelatorioDevolvidos(req, res) {
        try {
            const filtros = {};
            
            if (req.query.cliente_id) {
                filtros.cliente_id = parseInt(req.query.cliente_id);
            }
            
            if (req.query.data_inicio) {
                filtros.data_inicio = req.query.data_inicio;
            }
            
            if (req.query.data_fim) {
                filtros.data_fim = req.query.data_fim;
            }

            const resultado = await CondicionaisService.obterRelatorioDevolvidos(filtros);

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

    // PATCH /condicionais/itens/status - Atualizar status de itens
    static async atualizarStatusItens(req, res) {
        try {
            const { roupas_ids, novo_status } = req.body;

            // Validações básicas
            if (!roupas_ids || !Array.isArray(roupas_ids) || roupas_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'roupas_ids deve ser um array não vazio',
                    code: 'INVALID_ROUPAS_IDS'
                });
            }

            if (!novo_status) {
                return res.status(400).json({
                    success: false,
                    message: 'novo_status é obrigatório',
                    code: 'MISSING_STATUS'
                });
            }

            const resultado = await CondicionaisService.atualizarStatusItens(roupas_ids, novo_status);

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