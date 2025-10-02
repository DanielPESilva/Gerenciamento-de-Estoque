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

describe('GET /itens - Listar todos os itens', () => {
    it('1- Deve retornar todos os itens', async () => {
        const res = await request(app)
            .get('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2- Deve retornar itens filtrados por categoria', async () => {
        const res = await request(app)
            .get('/itens')
            .query({ categoria: 'Vestuário' })
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('3- Deve retornar erro 401 quando não autenticado', async () => {
        const res = await request(app)
            .get('/itens')
            .set("Accept", "application/json");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /itens - Criar novo item', () => {
    it('1- Deve criar um novo item', async () => {
        const novoItem = {
            nome: `Item Teste ${Date.now()}`,
            descricao: "Descrição do item de teste",
            preco: 99.90,
            estoque: 50,
            categoria: "Vestuário",
            tamanho: "M",
            cor: "Azul"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(novoItem.nome);
        expect(res.body.data.preco).toBe(novoItem.preco);
        expect(res.body.data.estoque).toBe(novoItem.estoque);
    });

    it('2- Deve retornar erro para item com nome duplicado', async () => {
        const itemDuplicado = {
            nome: "Item Duplicado Teste",
            descricao: "Teste",
            preco: 50.00,
            estoque: 10,
            categoria: "Teste"
        }

        // Criar primeiro item
        await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(itemDuplicado);

        // Tentar criar item com mesmo nome
        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(itemDuplicado);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve retornar erro de validação para campos obrigatórios', async () => {
        const itemInvalido = {
            nome: "",
            preco: -10,
            estoque: -5
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(itemInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('4- Deve validar preço positivo', async () => {
        const itemPrecoInvalido = {
            nome: "Item Preço Inválido",
            preco: -50.00,
            estoque: 10
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(itemPrecoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /itens/:id - Buscar item por ID', () => {
    let itemId = null;

    beforeAll(async () => {
        // Criar um item para os testes
        const novoItem = {
            nome: `Item Para Busca ${Date.now()}`,
            descricao: "Item para teste de busca",
            preco: 89.90,
            estoque: 25,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        itemId = res.body.data.id;
    });

    it('1- Deve retornar item por ID válido', async () => {
        const res = await request(app)
            .get(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(itemId);
    });

    it('2- Deve retornar erro 404 para item inexistente', async () => {
        const res = await request(app)
            .get('/itens/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("não encontrado");
    });

    it('3- Deve retornar erro 400 para ID inválido', async () => {
        const res = await request(app)
            .get('/itens/id_invalido')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /itens/:id - Atualizar item', () => {
    let itemId = null;

    beforeAll(async () => {
        // Criar um item para os testes
        const novoItem = {
            nome: `Item Para Atualizar ${Date.now()}`,
            descricao: "Item para teste de atualização",
            preco: 79.90,
            estoque: 30,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        itemId = res.body.data.id;
    });

    it('1- Deve atualizar item com sucesso', async () => {
        const dadosAtualizacao = {
            nome: "Item Atualizado",
            preco: 109.90,
            estoque: 40
        }

        const res = await request(app)
            .put(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosAtualizacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.nome).toBe(dadosAtualizacao.nome);
        expect(res.body.data.preco).toBe(dadosAtualizacao.preco);
        expect(res.body.data.estoque).toBe(dadosAtualizacao.estoque);
    });

    it('2- Deve retornar erro 404 para item inexistente', async () => {
        const res = await request(app)
            .put('/itens/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({ nome: "Teste" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve validar preço ao atualizar', async () => {
        const dadosInvalidos = {
            preco: -100.00
        }

        const res = await request(app)
            .put(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosInvalidos);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /itens/:id/estoque - Atualizar estoque', () => {
    let itemId = null;

    beforeAll(async () => {
        // Criar um item para os testes
        const novoItem = {
            nome: `Item Estoque ${Date.now()}`,
            descricao: "Item para teste de estoque",
            preco: 59.90,
            estoque: 100,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        itemId = res.body.data.id;
    });

    it('1- Deve adicionar ao estoque', async () => {
        const operacaoEstoque = {
            quantidade: 50,
            operacao: "adicionar"
        }

        const res = await request(app)
            .put(`/itens/${itemId}/estoque`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(operacaoEstoque);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.estoque).toBe(150); // 100 + 50
    });

    it('2- Deve remover do estoque', async () => {
        const operacaoEstoque = {
            quantidade: 25,
            operacao: "remover"
        }

        const res = await request(app)
            .put(`/itens/${itemId}/estoque`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(operacaoEstoque);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.estoque).toBe(125); // 150 - 25
    });

    it('3- Deve retornar erro ao tentar remover mais que o disponível', async () => {
        const operacaoInvalida = {
            quantidade: 200,
            operacao: "remover"
        }

        const res = await request(app)
            .put(`/itens/${itemId}/estoque`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(operacaoInvalida);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("insuficiente");
    });

    it('4- Deve validar operação de estoque', async () => {
        const operacaoInvalida = {
            quantidade: 50,
            operacao: "operacao_invalida"
        }

        const res = await request(app)
            .put(`/itens/${itemId}/estoque`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(operacaoInvalida);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /itens/categoria/:categoria - Buscar por categoria', () => {
    beforeAll(async () => {
        // Criar alguns itens de teste
        const itensCategoria = [
            {
                nome: `Camisa Categoria ${Date.now()}`,
                preco: 89.90,
                estoque: 20,
                categoria: "Camisas"
            },
            {
                nome: `Calça Categoria ${Date.now()}`,
                preco: 129.90,
                estoque: 15,
                categoria: "Calças"
            }
        ];

        for (const item of itensCategoria) {
            await request(app)
                .post('/itens')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${token}`)
                .send(item);
        }
    });

    it('1- Deve retornar itens da categoria especificada', async () => {
        const res = await request(app)
            .get('/itens/categoria/Camisas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        
        if (res.body.data.length > 0) {
            expect(res.body.data.every(item => item.categoria === 'Camisas')).toBe(true);
        }
    });

    it('2- Deve retornar array vazio para categoria inexistente', async () => {
        const res = await request(app)
            .get('/itens/categoria/CategoriaInexistente')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual([]);
    });
});

describe('DELETE /itens/:id - Remover item', () => {
    let itemId = null;

    beforeAll(async () => {
        // Criar um item para os testes
        const novoItem = {
            nome: `Item Para Remover ${Date.now()}`,
            descricao: "Item para teste de remoção",
            preco: 39.90,
            estoque: 5,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        itemId = res.body.data.id;
    });

    it('1- Deve remover item com sucesso', async () => {
        const res = await request(app)
            .delete(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("removido");
    });

    it('2- Deve retornar erro 404 para item inexistente', async () => {
        const res = await request(app)
            .delete('/itens/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});