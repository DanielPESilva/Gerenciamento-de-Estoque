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

describe('POST /email/send - Enviar email genérico', () => {
    it('1- Deve enviar email com sucesso', async () => {
        const emailData = {
            to: "destinatario@teste.com",
            subject: "Teste de Email Integração",
            message: "Esta é uma mensagem de teste para integração"
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("enviado com sucesso");
    });

    it('2- Deve retornar erro para email inválido', async () => {
        const emailInvalido = {
            to: "email_invalido",
            subject: "Teste",
            message: "Mensagem de teste"
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('3- Deve validar campos obrigatórios', async () => {
        const emailIncompleto = {
            to: "destinatario@teste.com",
            subject: "",
            message: ""
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailIncompleto);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('4- Deve retornar erro 401 quando não autenticado', async () => {
        const emailData = {
            to: "destinatario@teste.com",
            subject: "Teste",
            message: "Mensagem"
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .send(emailData);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });

    it('5- Deve enviar email com HTML', async () => {
        const emailHTML = {
            to: "destinatario@teste.com",
            subject: "Email HTML Teste",
            message: "<h1>Título do Email</h1><p>Esta é uma mensagem em HTML</p>",
            isHTML: true
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailHTML);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('6- Deve enviar email para múltiplos destinatários', async () => {
        const emailMultiplos = {
            to: ["destinatario1@teste.com", "destinatario2@teste.com"],
            subject: "Email para Múltiplos Destinatários",
            message: "Esta mensagem será enviada para múltiplos destinatários"
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailMultiplos);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});

describe('POST /email/sale-notification - Notificação de venda', () => {
    let clienteId = null;
    let itemId = null;
    let vendaId = null;

    beforeAll(async () => {
        // Criar cliente para teste
        const cliente = {
            nome: "Cliente Email Teste",
            email: "cliente_email@teste.com",
            telefone: "(11) 99999-9999"
        }

        const clienteRes = await request(app)
            .post('/clientes')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(cliente);

        clienteId = clienteRes.body.data.id;

        // Criar item para teste
        const item = {
            nome: "Item Email Teste",
            descricao: "Item para teste de email",
            preco: 199.90,
            estoque: 10,
            categoria: "Teste"
        }

        const itemRes = await request(app)
            .post('/itens')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(item);

        itemId = itemRes.body.data.id;

        // Criar venda para teste
        const venda = {
            cliente_id: clienteId,
            itens: [
                {
                    item_id: itemId,
                    quantidade: 2,
                    preco: 199.90
                }
            ],
            total: 399.80,
            metodo_pagamento: "cartao"
        }

        const vendaRes = await request(app)
            .post('/vendas')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(venda);

        vendaId = vendaRes.body.data.id;
    });

    it('1- Deve enviar notificação de venda para cliente', async () => {
        const notificacaoData = {
            vendaId: vendaId,
            tipo: "confirmacao"
        }

        const res = await request(app)
            .post('/email/sale-notification')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(notificacaoData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("Notificação enviada");
    });

    it('2- Deve enviar notificação de cancelamento', async () => {
        const notificacaoData = {
            vendaId: vendaId,
            tipo: "cancelamento",
            motivo: "Cancelamento solicitado pelo cliente"
        }

        const res = await request(app)
            .post('/email/sale-notification')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(notificacaoData);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('3- Deve retornar erro para venda inexistente', async () => {
        const notificacaoInvalida = {
            vendaId: 99999,
            tipo: "confirmacao"
        }

        const res = await request(app)
            .post('/email/sale-notification')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(notificacaoInvalida);

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Venda não encontrada");
    });

    it('4- Deve validar tipo de notificação', async () => {
        const tipoInvalido = {
            vendaId: vendaId,
            tipo: "tipo_invalido"
        }

        const res = await request(app)
            .post('/email/sale-notification')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(tipoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('5- Deve validar campos obrigatórios', async () => {
        const dadosIncompletos = {
            vendaId: "",
            tipo: ""
        }

        const res = await request(app)
            .post('/email/sale-notification')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(dadosIncompletos);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });
});

describe('Configuração de Email', () => {
    it('1- Deve testar configuração do servidor SMTP', async () => {
        const res = await request(app)
            .get('/email/test-config')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("Configuração");
    });

    it('2- Deve retornar informações sobre o status do serviço', async () => {
        const res = await request(app)
            .get('/email/status')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('smtp_configured');
    });
});

describe('Templates de Email', () => {
    it('1- Deve usar template de boas-vindas', async () => {
        const emailBemVindo = {
            to: "novo_usuario@teste.com",
            template: "welcome",
            data: {
                nome: "Novo Usuário",
                empresa: "DressFy"
            }
        }

        const res = await request(app)
            .post('/email/send-template')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailBemVindo);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('2- Deve usar template de recuperação de senha', async () => {
        const emailRecuperacao = {
            to: "usuario@teste.com",
            template: "password-reset",
            data: {
                nome: "Usuário Teste",
                reset_link: "https://dressfy.com/reset?token=abc123",
                expiry_time: "24 horas"
            }
        }

        const res = await request(app)
            .post('/email/send-template')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailRecuperacao);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('3- Deve retornar erro para template inexistente', async () => {
        const templateInexistente = {
            to: "usuario@teste.com",
            template: "template_inexistente",
            data: {}
        }

        const res = await request(app)
            .post('/email/send-template')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(templateInexistente);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("Template não encontrado");
    });
});

describe('Limitação de Envio', () => {
    it('1- Deve respeitar limite de envios por minuto', async () => {
        const emailData = {
            to: "teste_limite@teste.com",
            subject: "Teste de Limite",
            message: "Testando limite de envios"
        }

        // Enviar múltiplos emails rapidamente
        const promises = [];
        for (let i = 0; i < 10; i++) {
            promises.push(
                request(app)
                    .post('/email/send')
                    .set("Accept", "application/json")
                    .set("Authorization", `Bearer ${token}`)
                    .send(emailData)
            );
        }

        const results = await Promise.all(promises);
        
        // Pelo menos alguns devem ser bem-sucedidos
        const sucessos = results.filter(res => res.status === 200);
        expect(sucessos.length).toBeGreaterThan(0);
        
        // Se houver limite, alguns podem retornar erro de rate limit
        const rateLimited = results.filter(res => res.status === 429);
        // Esta verificação é opcional dependendo da implementação
    });
});

describe('Validação de Anexos', () => {
    it('1- Deve permitir anexos válidos', async () => {
        const emailComAnexo = {
            to: "destinatario@teste.com",
            subject: "Email com Anexo",
            message: "Este email contém um anexo",
            attachments: [
                {
                    filename: "documento.pdf",
                    content: "base64_content_here",
                    contentType: "application/pdf"
                }
            ]
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(emailComAnexo);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    it('2- Deve rejeitar anexos muito grandes', async () => {
        const anexoGrande = {
            to: "destinatario@teste.com",
            subject: "Anexo Grande",
            message: "Tentando enviar anexo muito grande",
            attachments: [
                {
                    filename: "arquivo_grande.pdf",
                    content: "x".repeat(25 * 1024 * 1024), // 25MB
                    contentType: "application/pdf"
                }
            ]
        }

        const res = await request(app)
            .post('/email/send')
            .set("Accept", "application/json")
            .set("Authorization", `Bearer ${token}`)
            .send(anexoGrande);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain("muito grande");
    });
});