import request from "supertest";
import { describe, expect, it, beforeAll } from '@jest/globals';
import app from '../../app.js'

let token = null

describe('Autenticação', () => {
    it("1-Deve chamar a rota de autenticação e pegar o token", async () => {
        const req = await request(app)
            .post('/auth/login')
            .set("Accept", "application/json")
            .send({
                email: "admin@teste.com",
                senha: "123456"
            })
        token = req.body.data.token
        expect(req.status).toBe(200)
    })
});

describe('GET /clientes - Listar todos os clientes', () => {
    it('1- Deve retornar todos os clientes', async () => {
        const res = await request(app)
            .get('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2- Deve retornar erro 401 quando não autenticado', async () => {
        const res = await request(app)
            .get('/clientes')
            .set("Accept", "application/json");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /clientes - Criar novo cliente', () => {
    it('1- Deve criar um novo cliente', async () => {
        const novoCliente = {
            nome: "Cliente Teste Integração",
            email: `cliente_${Date.now()}@teste.com`,
            telefone: "(11) 99999-9999",
            endereco: {
                rua: "Rua Teste",
                numero: "123",
                cidade: "São Paulo",
                cep: "01234-567"
            }
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoCliente);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(novoCliente.nome);
        expect(res.body.data.email).toBe(novoCliente.email);
    });

    it('2- Deve retornar erro ao criar cliente com email duplicado', async () => {
        const clienteDuplicado = {
            nome: "Cliente Teste",
            email: "cliente_existente@teste.com",
            telefone: "(11) 99999-9999"
        }

        // Primeiro, criar o cliente
        await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(clienteDuplicado);

        // Tentar criar novamente com mesmo email
        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(clienteDuplicado);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve retornar erro de validação para campos obrigatórios', async () => {
        const clienteInvalido = {
            nome: "",
            email: "email_invalido"
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(clienteInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /clientes/:id - Buscar cliente por ID', () => {
    let clienteId = null;

    beforeAll(async () => {
        // Criar um cliente para os testes
        const novoCliente = {
            nome: "Cliente Para Busca",
            email: `busca_${Date.now()}@teste.com`,
            telefone: "(11) 88888-8888"
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoCliente);

        clienteId = res.body.data.id;
    });

    it('1- Deve retornar cliente por ID válido', async () => {
        const res = await request(app)
            .get(`/clientes/${clienteId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(clienteId);
    });

    it('2- Deve retornar erro 404 para cliente inexistente', async () => {
        const res = await request(app)
            .get('/clientes/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("não encontrado");
    });

    it('3- Deve retornar erro 400 para ID inválido', async () => {
        const res = await request(app)
            .get('/clientes/id_invalido')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /clientes/:id - Atualizar cliente', () => {
    let clienteId = null;

    beforeAll(async () => {
        // Criar um cliente para os testes
        const novoCliente = {
            nome: "Cliente Para Atualizar",
            email: `atualizar_${Date.now()}@teste.com`,
            telefone: "(11) 77777-7777"
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoCliente);

        clienteId = res.body.data.id;
    });

    it('1- Deve atualizar cliente com sucesso', async () => {
        const dadosAtualizacao = {
            nome: "Cliente Atualizado",
            telefone: "(11) 66666-6666"
        }

        const res = await request(app)
            .put(`/clientes/${clienteId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosAtualizacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(dadosAtualizacao.nome);
        expect(res.body.data.telefone).toBe(dadosAtualizacao.telefone);
    });

    it('2- Deve retornar erro 404 para cliente inexistente', async () => {
        const res = await request(app)
            .put('/clientes/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({ nome: "Teste" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe('DELETE /clientes/:id - Remover cliente', () => {
    let clienteId = null;

    beforeAll(async () => {
        // Criar um cliente para os testes
        const novoCliente = {
            nome: "Cliente Para Remover",
            email: `remover_${Date.now()}@teste.com`,
            telefone: "(11) 55555-5555"
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoCliente);

        clienteId = res.body.data.id;
    });

    it('1- Deve remover cliente com sucesso', async () => {
        const res = await request(app)
            .delete(`/clientes/${clienteId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("removido");
    });

    it('2- Deve retornar erro 404 para cliente inexistente', async () => {
        const res = await request(app)
            .delete('/clientes/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});