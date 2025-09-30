import BaixaService from '../services/baixaService.js';
import BaixaSchema from '../schemas/baixaSchema.js';

class BaixaController {
    // GET /baixa
    static async listarBaixas(req, res) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                data_inicio, 
                data_fim, 
                motivo,
                roupa_id 
            } = req.query;

            const filters = {};
            if (data_inicio) filters.data_inicio = data_inicio;
            if (data_fim) filters.data_fim = data_fim;  
            if (motivo) filters.motivo = motivo;
            if (roupa_id) filters.roupa_id = parseInt(roupa_id);

            const pagination = {
                page: parseInt(page),
                limit: parseInt(limit)
            };

            console.log('Filters:', filters);
            console.log('Pagination:', pagination);
            const resultado = await BaixaService.listarBaixas(filters, pagination);

            res.status(200).json({
                success: true,
                message: 'Baixas listadas com sucesso',
                data: resultado
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // GET /baixa/:id
    static async buscarBaixa(req, res) {
        try {
            const { id } = req.params;
            const baixa = await BaixaService.buscarBaixaPorId(parseInt(id));

            if (!baixa) {
                return res.status(404).json({
                    success: false,
                    message: 'Baixa não encontrada'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Baixa encontrada',
                data: baixa
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    // POST /baixa
    static async criarBaixa(req, res) {
        try {
            const validatedData = BaixaSchema.create.parse(req.body);
            const novaBaixa = await BaixaService.criarBaixa(validatedData);

            res.status(201).json({
                success: true,
                message: 'Baixa criada com sucesso',
                data: novaBaixa
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

    // PATCH /baixa/:id
    static async atualizarBaixa(req, res) {
        try {
            const { id } = req.params;
            const validatedData = BaixaSchema.update.parse(req.body);
            
            const baixaAtualizada = await BaixaService.atualizarBaixa(
                parseInt(id), 
                validatedData
            );

            res.status(200).json({
                success: true,
                message: 'Baixa atualizada com sucesso',
                data: baixaAtualizada
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

    // DELETE /baixa/:id
    static async deletarBaixa(req, res) {
        try {
            const { id } = req.params;
            const resultado = await BaixaService.deletarBaixa(parseInt(id));

            res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.itens_restaurados
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

    // POST /baixa/:id/itens
    static async adicionarItem(req, res) {
        try {
            const { id } = req.params;
            const validatedData = BaixaSchema.addItem.parse(req.body);

            const novoItem = await BaixaService.adicionarItem(parseInt(id), validatedData);

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

            if (error.message.includes('não encontrada') || error.message.includes('não encontrado') || error.message.includes('Estoque insuficiente')) {
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

    // GET /baixa/:id/itens
    static async listarItens(req, res) {
        try {
            const { id } = req.params;
            const itens = await BaixaService.listarItensBaixa(parseInt(id));

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

    // PATCH /baixa/:id/itens/:item_id
    static async atualizarItem(req, res) {
        try {
            const { item_id } = req.params;
            const validatedData = BaixaSchema.updateItem.parse(req.body);

            const itemAtualizado = await BaixaService.atualizarItem(
                parseInt(item_id), 
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

            if (error.message.includes('não encontrado') || error.message.includes('Estoque insuficiente')) {
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

    // DELETE /baixa/:id/itens/:item_id
    static async removerItem(req, res) {
        try {
            const { item_id } = req.params;
            const resultado = await BaixaService.removerItem(parseInt(item_id));

            res.status(200).json({
                success: true,
                message: resultado.message,
                data: resultado.item_restaurado
            });
        } catch (error) {
            if (error.message.includes('não encontrado')) {
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

    // GET /baixa/estatisticas
    static async obterEstatisticas(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;
            
            const filtros = {};
            if (data_inicio) filtros.data_inicio = data_inicio;
            if (data_fim) filtros.data_fim = data_fim;

            const estatisticas = await BaixaService.obterEstatisticas(filtros);

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

    // GET /baixa/relatorio
    static async gerarRelatorio(req, res) {
        try {
            const { data_inicio, data_fim } = req.query;

            if (!data_inicio || !data_fim) {
                return res.status(400).json({
                    success: false,
                    message: 'É necessário informar data_inicio e data_fim'
                });
            }

            const relatorio = await BaixaService.relatorioBaixasPeriodo(
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

    // GET /baixa/motivos
    static async obterMotivos(req, res) {
        try {
            const motivos = BaixaService.getMotivosDisponiveis();

            res.status(200).json({
                success: true,
                message: 'Motivos disponíveis obtidos com sucesso',
                data: motivos
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}

export default BaixaController;