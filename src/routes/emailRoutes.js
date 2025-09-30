import { Router } from "express";
import EmailController from "../controllers/emailController.js";
import { wrapException } from "../utils/wrapException.js";
import verifyToken from "../middlewares/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Endpoints para envio de emails
 */

/**
 * @swagger
 * /email/send:
 *   post:
 *     summary: Envia um email simples
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - subject
 *               - message
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Email do destinatário
 *                 example: "destinatario@example.com"
 *               subject:
 *                 type: string
 *                 description: Assunto do email
 *                 example: "Mensagem importante"
 *               message:
 *                 type: string
 *                 description: Conteúdo da mensagem
 *                 example: "Esta é uma mensagem de teste."
 *               isHtml:
 *                 type: boolean
 *                 description: Se o conteúdo é HTML (padrão: false)
 *                 default: false
 *     responses:
 *       200:
 *         description: Email enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email enviado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     messageId:
 *                       type: string
 *                       example: "<message-id@example.com>"
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autorização inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/send', verifyToken, wrapException(EmailController.sendSimpleEmail));





/**
 * @swagger
 * /email/sale-notification:
 *   post:
 *     summary: Envia notificação de nova venda
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - to
 *               - clienteName
 *               - items
 *               - totalValue
 *             properties:
 *               to:
 *                 type: string
 *                 format: email
 *                 description: Email do destinatário
 *                 example: "vendas@empresa.com"
 *               clienteName:
 *                 type: string
 *                 description: Nome do cliente
 *                 example: "João Silva"
 *               totalValue:
 *                 type: number
 *                 format: float
 *                 description: Valor total da venda
 *                 example: 250.50
 *               saleDate:
 *                 type: string
 *                 description: Data da venda (opcional)
 *                 example: "15/01/2024"
 *               items:
 *                 type: array
 *                 description: Itens vendidos
 *                 items:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                       example: "Produto B"
 *                     quantidade:
 *                       type: integer
 *                       example: 2
 *                     preco:
 *                       type: number
 *                       format: float
 *                       example: 125.25
 *     responses:
 *       200:
 *         description: Notificação de venda enviada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token de autorização inválido
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/sale-notification', verifyToken, wrapException(EmailController.sendSaleNotification));



export default router;