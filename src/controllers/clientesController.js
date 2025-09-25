import ClientesService from "../services/clientesService.js";
import ClientesSchema from "../schemas/clientesSchema.js";
import { sendResponse, sendError } from "../utils/messages.js";

export const getAll = async (req, res) => {
    try {
        // Validação dos query parameters
        const queryValidation = ClientesSchema.query.safeParse(req.query);
        
        if (!queryValidation.success) {
            const errors = queryValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        const { page = 1, limit = 10, nome, email, cpf, telefone } = queryValidation.data;
        
        const filters = {};
        if (nome) filters.nome = nome;
        if (email) filters.email = email;
        if (cpf) filters.cpf = cpf;
        if (telefone) filters.telefone = telefone;

        const pagination = { page, limit };

        const result = await ClientesService.getAllClientes(filters, pagination);
        
        return sendResponse(res, 200, {
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('Erro ao buscar clientes:', error);
        return sendError(res, 500, "Erro interno do servidor");
    }
};

export const getById = async (req, res) => {
    try {
        // Validação do ID
        const paramValidation = ClientesSchema.id.safeParse(req.params);
        
        if (!paramValidation.success) {
            const errors = paramValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        const { id } = paramValidation.data;

        const cliente = await ClientesService.getClienteById(id);

        if (!cliente) {
            return sendError(res, 404, {
                message: "Cliente não encontrado com o ID informado",
                field: "id"
            });
        }

        return sendResponse(res, 200, {
            data: cliente
        });
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        return sendError(res, 500, "Erro interno do servidor");
    }
};

export const create = async (req, res) => {
    try {
        // Validação dos dados de entrada
        const bodyValidation = ClientesSchema.create.safeParse(req.body);
        
        if (!bodyValidation.success) {
            const errors = bodyValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        const { nome, email, cpf, telefone, endereco } = bodyValidation.data;

        // Verificar se email já existe (se fornecido)
        if (email) {
            const clienteExistente = await ClientesService.getClienteByEmail(email);
            if (clienteExistente) {
                return sendError(res, 409, {
                    message: "Email já está sendo usado por outro cliente",
                    field: "email"
                });
            }
        }

        // Verificar se CPF já existe (se fornecido)
        if (cpf) {
            const clienteExistenteCpf = await ClientesService.getClienteByCpf(cpf);
            if (clienteExistenteCpf) {
                return sendError(res, 409, {
                    message: "CPF já está sendo usado por outro cliente",
                    field: "cpf"
                });
            }
        }

        const novoCliente = await ClientesService.createCliente({
            nome,
            email: email || null,
            cpf: cpf || null,
            telefone: telefone || null,
            endereco: endereco || null
        });

        return sendResponse(res, 201, {
            data: novoCliente,
            message: "Cliente criado com sucesso"
        });
    } catch (error) {
        console.error('Erro ao criar cliente:', error);
        return sendError(res, 500, "Erro interno do servidor");
    }
};

export const update = async (req, res) => {
    try {
        // Validação do ID
        const paramValidation = ClientesSchema.id.safeParse(req.params);
        
        if (!paramValidation.success) {
            const errors = paramValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        // Validação dos dados de atualização
        const bodyValidation = ClientesSchema.update.safeParse(req.body);
        
        if (!bodyValidation.success) {
            const errors = bodyValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        const { id } = paramValidation.data;
        const updateData = bodyValidation.data;

        // Verificar se cliente existe
        const clienteExistente = await ClientesService.getClienteById(id);
        if (!clienteExistente) {
            return sendError(res, 404, {
                message: "Cliente não encontrado com o ID informado",
                field: "id"
            });
        }

        // Verificar se email já existe em outro cliente (se fornecido)
        if (updateData.email && updateData.email !== clienteExistente.email) {
            const clienteComEmail = await ClientesService.getClienteByEmail(updateData.email);
            if (clienteComEmail && clienteComEmail.id !== id) {
                return sendError(res, 409, {
                    message: "Email já está sendo usado por outro cliente",
                    field: "email"
                });
            }
        }

        // Verificar se CPF já existe em outro cliente (se fornecido) 
        if (updateData.cpf && updateData.cpf !== clienteExistente.cpf) {
            const clienteComCpf = await ClientesService.getClienteByCpf(updateData.cpf);
            if (clienteComCpf && clienteComCpf.id !== id) {
                return sendError(res, 409, {
                    message: "CPF já está sendo usado por outro cliente",
                    field: "cpf"
                });
            }
        }

        // Tratar campos vazios como null
        const dataToUpdate = {};
        Object.keys(updateData).forEach(key => {
            dataToUpdate[key] = updateData[key] === "" ? null : updateData[key];
        });

        const clienteAtualizado = await ClientesService.updateCliente(id, dataToUpdate);

        return sendResponse(res, 200, {
            data: clienteAtualizado,
            message: "Cliente atualizado com sucesso"
        });
    } catch (error) {
        console.error('Erro ao atualizar cliente:', error);
        return sendError(res, 500, "Erro interno do servidor");
    }
};

export const remove = async (req, res) => {
    try {
        // Validação do ID
        const paramValidation = ClientesSchema.id.safeParse(req.params);
        
        if (!paramValidation.success) {
            const errors = paramValidation.error?.issues?.map(err => ({
                message: err.message,
                field: err.path.join('.')
            }));
            return sendError(res, 400, errors);
        }

        const { id } = paramValidation.data;

        // Verificar se cliente existe
        const clienteExistente = await ClientesService.getClienteById(id);
        if (!clienteExistente) {
            return sendError(res, 404, {
                message: "Cliente não encontrado com o ID informado", 
                field: "id"
            });
        }

        // TODO: Verificar se cliente tem relacionamentos (vendas, condicionais)
        // antes de permitir exclusão - implementar essa validação se necessário

        await ClientesService.deleteCliente(id);

        return sendResponse(res, 200, {
            data: null,
            message: "Cliente removido com sucesso"
        });
    } catch (error) {
        console.error('Erro ao remover cliente:', error);
        
        // Verificar se é erro de restrição de chave estrangeira
        if (error.code === 'P2003') {
            return sendError(res, 409, {
                message: "Não é possível remover cliente que possui vendas ou outros registros associados",
                field: "relacionamentos"
            });
        }
        
        return sendError(res, 500, "Erro interno do servidor");
    }
};
