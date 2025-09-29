import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./docs/index.js";

import clientesRouter from "./routes/clientes.js";
import itensRouter from "./routes/itens.js";
import usuariosRouter from "./routes/usuarios.js";
import vendasRouter from "./routes/vendas.js";
import condicionaisRouter from "./routes/condicionais.js";
import comprasRouter from "./routes/compras.js";
import baixaRouter from "./routes/baixa.js";
import imagensRouter from "./routes/imagens.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "DressFy API - Documentação"
}));

// Rotas da API
app.use("/api/clientes", clientesRouter);
app.use("/api/itens", itensRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/vendas", vendasRouter);
app.use("/api/condicionais", condicionaisRouter);
app.use("/api/compras", comprasRouter);
app.use("/api/baixa", baixaRouter);
app.use("/api", imagensRouter);

// Rota de health check
app.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "API funcionando corretamente",
        timestamp: new Date().toISOString()
    });
});

// Rota para documentação das imagens
app.get("/docs/imagens", (req, res) => {
    res.sendFile(path.join(process.cwd(), "documentacao_imagens.html"));
});

// Redirecionamento da raiz para documentação
app.get("/", (req, res) => {
    res.redirect("/api-docs");
});

export default app;

