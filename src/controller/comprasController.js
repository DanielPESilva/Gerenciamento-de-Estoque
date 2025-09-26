import ComprasService from '../services/comprasService.js';
import ComprasSchema from '../schemas/comprasSchema.js';

class ComprasController {
    // GET /compras
    static async listarCompras(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                data_inicio, 
                data_fim, 
                fornecedor, 
                valor_min, 
                valor_max 
            } = req.query;

            const filters = {};
            if (data_inicio) filters.data_inicio = data_inicio;
            if (data_fim) filters.data_fim = data_fim;
            if (fornecedor) filters.fornecedor = fornecedor;
            if (valor_min) filters.valor_min = parseFloat(valor_min);
            if (valor_max) filters.valor_max = parseFloat(valor_max);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const resultado = await ComprasService.listarCompras(filters, pagination);

            res.status(200).json({
                success: true,
                message: 'Compras listadas com sucesso',
                data: resultado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /compras/:id
    static async buscarCompra(req, res) {
        try {
            const { id } = req.params;
            const compra = await ComprasService.buscarCompraPorId(parseInt(id));

            if (!compra) {
                return res.status(404).json({
                    success: false,
                    message: 'Compra não encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Compra encontrada',
                data: compra
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /compras
    static async criarCompra(req, res) {
        try {
            const validatedData = ComprasSchema.create.parse(req.body);
            const novaCompra = await ComprasService.criarCompra(validatedData);

            res.status(201).json({
                success: true,
                message: 'Compra criada com sucesso',
                data: novaCompra
            });
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /compras/:id
    static async atualizarCompra(req, res) {
        try {
            const { id } = req.params;
            const validatedData = ComprasSchema.update.parse(req.body);
            
            const compraAtualizada = await ComprasService.atualizarCompra(
                parseInt(id), 
                validatedData
            );

            res.status(200).json({
                success: true,
                message: 'Compra atualizada com sucesso',
                data: compraAtualizada
            });
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            if (error.message.includes('não encontrada')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /compras/:id
    static async deletarCompra(req, res) {
        try {
            const { id } = req.params;
            const resultado = await ComprasService.deletarCompra(parseInt(id));

            res.status(200).json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            if (error.message.includes('não encontrada')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /compras/:id/itens
    static async adicionarItem(req, res) {
        try {
            const { id } = req.params;
            const validatedData = ComprasSchema.addItem.parse(req.body);

            const novoItem = await ComprasService.adicionarItem(parseInt(id), validatedData);

            res.status(201).json({
                success: true,
                message: 'Item adicionado com sucesso',
                data: novoItem
            });
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            if (error.message.includes('não encontrada') || error.message.includes('não encontrado')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /compras/:id/itens
    static async listarItens(req, res) {
        try {
            const { id } = req.params;
            const itens = await ComprasService.listarItensCompra(parseInt(id));

            res.status(200).json({
                success: true,
                message: 'Itens listados com sucesso',
                data: itens
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // PUT /compras/itens/:itemId
    static async atualizarItem(req, res) {
        try {
            const { itemId } = req.params;
            const validatedData = ComprasSchema.updateItem.parse(req.body);

            const itemAtualizado = await ComprasService.atualizarItem(
                parseInt(itemId), 
                validatedData
            );

            res.status(200).json({
                success: true,
                message: 'Item atualizado com sucesso',
                data: itemAtualizado
            });
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // DELETE /compras/itens/:itemId
    static async removerItem(req, res) {
        try {
            const { itemId } = req.params;
            const resultado = await ComprasService.removerItem(parseInt(itemId));

            res.status(200).json({
                success: true,
                message: resultado.message
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /compras/:id/finalizar
    static async finalizarCompra(req, res) {
        try {
            const { id } = req.params;
            const { observacoes } = ComprasSchema.finalizar.parse(req.body);

            const resumo = await ComprasService.finalizarCompra(
                parseInt(id), 
                observacoes
            );

            res.status(200).json({
                success: true,
                message: 'Compra finalizada com sucesso',
                data: resumo
            });
        } catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    message: 'Dados inválidos',
                    errors: error.errors
                });
            }

            if (error.message.includes('não encontrada') || error.message.includes('não possui itens')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /compras/estatisticas
    static async obterEstatisticas(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;
            
            const filtros = {};
            if (data_inicio) filtros.data_inicio = data_inicio;
            if (data_fim) filtros.data_fim = data_fim;

            const estatisticas = await ComprasService.obterEstatisticas(filtros);

            res.status(200).json({
                success: true,
                message: 'Estatísticas obtidas com sucesso',
                data: estatisticas
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /compras/relatorio
    static async gerarRelatorio(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;

            if (!data_inicio || !data_fim) {
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar data_inicio e data_fim'
                });
            }

            const relatorio = await ComprasService.relatorioCompasPeriodo(
                data_inicio, 
                data_fim
            );

            res.status(200).json({
                success: true,
                message: 'Relatório gerado com sucesso',
                data: relatorio
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default ComprasController;