import request from "supertest";
import { describe, expect, it, beforeAll } from '@jest/globals';
import app from '../../app.js'

let token = null
let clienteId = null
let itemId = null

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

describe('Preparação de dados para vendas', () => {
    it('1- Deve criar um cliente para os testes', async () => {
        const novoCliente = {
            nome: `Cliente Venda ${Date.now()}`,
            email: `cliente_venda_${Date.now()}@teste.com`,
            telefone: "(11) 99999-9999"
        }

        const res = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoCliente);

        clienteId = res.body.data.id;
        expect(res.status).toBe(201);
    });

    it('2- Deve criar um item para os testes', async () => {
        const novoItem = {
            nome: `Item Venda ${Date.now()}`,
            descricao: "Item para teste de vendas",
            preco: 99.90,
            estoque: 100,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        itemId = res.body.data.id;
        expect(res.status).toBe(201);
    });
});

describe('GET /vendas - Listar todas as vendas', () => {
    it('1- Deve retornar todas as vendas', async () => {
        const res = await request(app)
            .get('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('data');
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2- Deve retornar erro 401 quando não autenticado', async () => {
        const res = await request(app)
            .get('/vendas')
            .set("Accept", "application/json");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});

describe('POST /vendas - Criar nova venda', () => {
    it('1- Deve criar uma nova venda', async () => {
        const novaVenda = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 2,
                    preco: 99.90
                }
            ],
            total: 199.80,
            metodo_pagamento: "cartao",
            observacoes: "Venda de teste"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novaVenda);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.cliente_id).toBe(clienteId);
        expect(res.body.data.total).toBe(novaVenda.total);
        expect(res.body.data.metodo_pagamento).toBe(novaVenda.metodo_pagamento);
    });

    it('2- Deve retornar erro para cliente inexistente', async () => {
        const vendaClienteInexistente = {
            cliente_id: 99999,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: 99.90,
            metodo_pagamento: "dinheiro"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaClienteInexistente);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Cliente não encontrado");
    });

    it('3- Deve retornar erro para item inexistente', async () => {
        const vendaItemInexistente = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: 99999,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: 99.90,
            metodo_pagamento: "pix"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaItemInexistente);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Item não encontrado");
    });

    it('4- Deve retornar erro para estoque insuficiente', async () => {
        const vendaEstoqueInsuficiente = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1000, // Quantidade maior que o estoque
                    preco: 99.90
                }
            ],
            total: 99900.00,
            metodo_pagamento: "cartao"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaEstoqueInsuficiente);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("estoque insuficiente");
    });

    it('5- Deve validar campos obrigatórios', async () => {
        const vendaInvalida = {
            cliente_id: "",
            itens: [],
            total: -100
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaInvalida);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('6- Deve validar total positivo', async () => {
        const vendaTotalInvalido = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: -50.00,
            metodo_pagamento: "dinheiro"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaTotalInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('GET /vendas/:id - Buscar venda por ID', () => {
    let vendaId = null;

    beforeAll(async () => {
        // Criar uma venda para os testes
        const novaVenda = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: 99.90,
            metodo_pagamento: "cartao"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novaVenda);

        vendaId = res.body.data.id;
    });

    it('1- Deve retornar venda por ID válido', async () => {
        const res = await request(app)
            .get(`/vendas/${vendaId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(vendaId);
        expect(res.body.data).toHaveProperty('cliente');
        expect(res.body.data).toHaveProperty('itens');
    });

    it('2- Deve retornar erro 404 para venda inexistente', async () => {
        const res = await request(app)
            .get('/vendas/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("não encontrada");
    });

    it('3- Deve retornar erro 400 para ID inválido', async () => {
        const res = await request(app)
            .get('/vendas/id_invalido')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('PUT /vendas/:id - Atualizar venda', () => {
    let vendaId = null;

    beforeAll(async () => {
        // Criar uma venda para os testes
        const novaVenda = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: 99.90,
            metodo_pagamento: "dinheiro"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novaVenda);

        vendaId = res.body.data.id;
    });

    it('1- Deve atualizar venda com sucesso', async () => {
        const dadosAtualizacao = {
            metodo_pagamento: "pix",
            observacoes: "Pagamento alterado para PIX"
        }

        const res = await request(app)
            .put(`/vendas/${vendaId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosAtualizacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.metodo_pagamento).toBe(dadosAtualizacao.metodo_pagamento);
        expect(res.body.data.observacoes).toBe(dadosAtualizacao.observacoes);
    });

    it('2- Deve retornar erro 404 para venda inexistente', async () => {
        const res = await request(app)
            .put('/vendas/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send({ metodo_pagamento: "cartao" });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe('DELETE /vendas/:id - Remover venda', () => {
    let vendaId = null;
    let estoqueAnterior = null;

    beforeAll(async () => {
        // Verificar estoque atual do item
        const itemRes = await request(app)
            .get(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);
        
        estoqueAnterior = itemRes.body.data.estoque;

        // Criar uma venda para os testes
        const novaVenda = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 5,
                    preco: 99.90
                }
            ],
            total: 499.50,
            metodo_pagamento: "cartao"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novaVenda);

        vendaId = res.body.data.id;
    });

    it('1- Deve remover venda e restaurar estoque', async () => {
        const res = await request(app)
            .delete(`/vendas/${vendaId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("removida");

        // Verificar se o estoque foi restaurado
        const itemRes = await request(app)
            .get(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(itemRes.body.data.estoque).toBeGreaterThan(estoqueAnterior - 5);
    });

    it('2- Deve retornar erro 404 para venda inexistente', async () => {
        const res = await request(app)
            .delete('/vendas/99999')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});

describe('Métodos de pagamento', () => {
    const metodosPagamento = ['dinheiro', 'cartao', 'pix', 'debito'];

    metodosPagamento.forEach(metodo => {
        it(`Deve aceitar pagamento via ${metodo}`, async () => {
            const novaVenda = {
                cliente_id: clienteId,
                itens: [
                    {
                        item_id: itemId,
                        quantidade: 1,
                        preco: 99.90
                    }
                ],
                total: 99.90,
                metodo_pagamento: metodo
            }

            const res = await request(app)
                .post('/vendas')
                .set("Accept", "application/json")
                .set("Authorization", `Bearer ${token}`)
                .send(novaVenda);

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.metodo_pagamento).toBe(metodo);
        });
    });

    it('Deve rejeitar método de pagamento inválido', async () => {
        const vendaMetodoInvalido = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 1,
                    preco: 99.90
                }
            ],
            total: 99.90,
            metodo_pagamento: "crypto" // Método inválido
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaMetodoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Vendas com múltiplos itens', () => {
    let item2Id = null;

    beforeAll(async () => {
        // Criar segundo item para teste
        const novoItem = {
            nome: `Item 2 Venda ${Date.now()}`,
            descricao: "Segundo item para teste de vendas",
            preco: 79.90,
            estoque: 50,
            categoria: "Teste"
        }

        const res = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(novoItem);

        item2Id = res.body.data.id;
    });

    it('1- Deve criar venda com múltiplos itens', async () => {
        const vendaMultiplosItens = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 2,
                    preco: 99.90
                },
                {
                    item_id: item2Id,
                    quantidade: 1,
                    preco: 79.90
                }
            ],
            total: 279.70, // (99.90 * 2) + (79.90 * 1)
            metodo_pagamento: "cartao"
        }

        const res = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaMultiplosItens);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.total).toBe(vendaMultiplosItens.total);
        expect(res.body.data.itens.length).toBe(2);
    });

    it('2- Deve atualizar estoque de todos os itens', async () => {
        // Verificar estoque dos itens antes
        const item1Antes = await request(app)
            .get(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        const item2Antes = await request(app)
            .get(`/itens/${item2Id}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        const estoqueItem1Antes = item1Antes.body.data.estoque;
        const estoqueItem2Antes = item2Antes.body.data.estoque;

        // Fazer venda
        const vendaMultiplosItens = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 3,
                    preco: 99.90
                },
                {
                    item_id: item2Id,
                    quantidade: 2,
                    preco: 79.90
                }
            ],
            total: 459.50, // (99.90 * 3) + (79.90 * 2)
            metodo_pagamento: "pix"
        }

        await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(vendaMultiplosItens);

        // Verificar estoque dos itens depois
        const item1Depois = await request(app)
            .get(`/itens/${itemId}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        const item2Depois = await request(app)
            .get(`/itens/${item2Id}`)
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(item1Depois.body.data.estoque).toBe(estoqueItem1Antes - 3);
        expect(item2Depois.body.data.estoque).toBe(estoqueItem2Antes - 2);
    });
});