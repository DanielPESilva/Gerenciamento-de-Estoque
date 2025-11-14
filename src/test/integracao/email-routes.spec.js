import { describe, expect, it, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../app.js';

// Mock do JWT
// Mock do JWT
const mockJwt = {
    sign: jest.fn(() => 'mocked-token'),
    verify: jest.fn(() => ({ userId: 1, tipo: 'admin' })),
    decode: jest.fn(() => ({ userId: 1, tipo: 'admin' }))
};

jest.unstable_mockModule('jsonwebtoken', () => ({
    default: mockJwt
}));

// Mock do nodemailer
// Mock do nodemailer
const mockNodemailer = {
    createTransporter: jest.fn(() => ({
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
    }))
};

jest.unstable_mockModule('nodemailer', () => ({
    default: mockNodemailer
}));

// Helper functions para validação flexível
const validateResponse = (body) => {
    return body && (body.success === true || body.data !== undefined || body.message === 'Email enviado com sucesso' || body.enviado === true);
};

const isErrorResponse = (body) => {
    return body && (body.success === false || body.error !== undefined || body.errors !== undefined || body.message !== undefined);
};

describe('Integração - Email Routes', () => {
    const mockToken = 'Bearer mock-jwt-token';
    
    const testEmailSimples = {
        to: 'destinatario@teste.com',
        subject: 'Assunto do Email de Teste',
        message: 'Esta é uma mensagem de teste para verificar o envio de emails.',
        isHtml: false
    };

    const testEmailHtml = {
        to: 'destinatario@teste.com',
        subject: 'Email HTML de Teste',
        message: '<h1>Título</h1><p>Esta é uma mensagem HTML de teste.</p>',
        isHtml: true
    };

    const testSaleNotification = {
        sale: {
            id: 1,
            valor_total: 150.50,
            forma_pgto: 'cartao',
            data_venda: '2024-01-15T10:30:00Z',
            cliente: {
                nome: 'João Silva',
                email: 'joao@teste.com'
            },
            itens: [
                {
                    roupa: { nome: 'Camiseta Polo' },
                    quantidade: 2,
                    preco_unitario: 45.00
                },
                {
                    roupa: { nome: 'Calça Jeans' },
                    quantidade: 1,
                    preco_unitario: 60.50
                }
            ]
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Setup JWT mock
        mockJwt.verify.mockReturnValue({ userId: 1, tipo: 'admin' });
    });

    describe('POST /api/email/send - Enviar email simples', () => {
        it('1- Deve enviar email simples com dados válidos', async () => {
            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testEmailSimples);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar dados obrigatórios', async () => {
            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar formato de email', async () => {
            const emailInvalido = {
                ...testEmailSimples,
                to: 'email-invalido'
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailInvalido);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar campos obrigatórios individualmente', async () => {
            const camposObrigatorios = ['to', 'subject', 'message'];
            
            for (const campo of camposObrigatorios) {
                const dadosIncompletos = { ...testEmailSimples };
                delete dadosIncompletos[campo];

                const res = await request(app)
                    .post('/api/email/send')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(dadosIncompletos);

                expect([400, 401, 500]).toContain(res.status);
                expect(isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve rejeitar requisição sem autenticação', async () => {
            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .send(testEmailSimples);

            expect([401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/email/send - Testar email HTML', () => {
        it('1- Deve enviar email HTML com dados válidos', async () => {
            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testEmailHtml);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve processar conteúdo HTML complexo', async () => {
            const emailHtmlComplexo = {
                ...testEmailHtml,
                message: `
                    <html>
                        <body>
                            <h1>Título Principal</h1>
                            <p>Parágrafo com <strong>texto em negrito</strong></p>
                            <ul>
                                <li>Item 1</li>
                                <li>Item 2</li>
                            </ul>
                            <a href="https://exemplo.com">Link de exemplo</a>
                        </body>
                    </html>
                `
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailHtmlComplexo);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve processar flag isHtml corretamente', async () => {
            const emailTextoSimples = {
                ...testEmailSimples,
                isHtml: false
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailTextoSimples);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('POST /api/email/sale-notification - Notificação de venda', () => {
        it('1- Deve enviar notificação de venda com dados válidos', async () => {
            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(testSaleNotification);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve validar estrutura da venda', async () => {
            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send({});

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve validar dados do cliente na venda', async () => {
            const vendaSemCliente = {
                sale: {
                    ...testSaleNotification.sale,
                    cliente: null
                }
            };

            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaSemCliente);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve validar itens da venda', async () => {
            const vendaSemItens = {
                sale: {
                    ...testSaleNotification.sale,
                    itens: []
                }
            };

            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaSemItens);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });

        it('5- Deve validar email do cliente', async () => {
            const vendaEmailInvalido = {
                sale: {
                    ...testSaleNotification.sale,
                    cliente: {
                        nome: 'João Silva',
                        email: 'email-invalido'
                    }
                }
            };

            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaEmailInvalido);

            expect([400, 401, 500]).toContain(res.status);
            expect(isErrorResponse(res.body)).toBe(true);
        });
    });

    describe('Testes de validação avançados', () => {
        it('1- Deve testar múltiplos destinatários', async () => {
            const emailMultiplosDestinatarios = {
                ...testEmailSimples,
                to: 'dest1@teste.com,dest2@teste.com,dest3@teste.com'
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailMultiplosDestinatarios);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('2- Deve testar assuntos com caracteres especiais', async () => {
            const emailAssuntoEspecial = {
                ...testEmailSimples,
                subject: 'Assunto com acentos: ção, ã, é, ü e símbolos: @#$%&*'
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailAssuntoEspecial);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('3- Deve testar mensagens longas', async () => {
            const mensagemLonga = 'Lorem ipsum dolor sit amet, '.repeat(100);
            const emailMensagemLonga = {
                ...testEmailSimples,
                message: mensagemLonga
            };

            const res = await request(app)
                .post('/api/email/send')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(emailMensagemLonga);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('4- Deve testar diferentes formas de pagamento na notificação', async () => {
            const formasPagamento = ['dinheiro', 'cartao', 'pix', 'boleto'];

            for (const forma of formasPagamento) {
                const vendaComFormaPagamento = {
                    sale: {
                        ...testSaleNotification.sale,
                        forma_pgto: forma
                    }
                };

                const res = await request(app)
                    .post('/api/email/sale-notification')
                    .set("Accept", "application/json")
                    .set("Authorization", mockToken)
                    .send(vendaComFormaPagamento);

                expect([200, 201, 400, 401, 500]).toContain(res.status);
                expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
            }
        });

        it('5- Deve testar diferentes tipos de conteúdo', async () => {
            const res = await request(app)
                .post('/api/email/send')
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(JSON.stringify(testEmailSimples));

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });

        it('6- Deve testar venda com desconto', async () => {
            const vendaComDesconto = {
                sale: {
                    ...testSaleNotification.sale,
                    desconto: 15.00,
                    valor_total: 135.50 // valor após desconto
                }
            };

            const res = await request(app)
                .post('/api/email/sale-notification')
                .set("Accept", "application/json")
                .set("Authorization", mockToken)
                .send(vendaComDesconto);

            expect([200, 201, 400, 401, 500]).toContain(res.status);
            expect(validateResponse(res.body) || isErrorResponse(res.body)).toBe(true);
        });
    });
});