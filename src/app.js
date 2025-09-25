import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import clientesRouter from "./routes/clientes.js";
import itensRouter from "./routes/itens.js";
import usuariosRouter from "./routes/usuarios.js";
import vendasRouter from "./routes/vendas.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/clientes", clientesRouter);
app.use("/api/itens", itensRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/vendas", vendasRouter);

// Rota de health check
app.get("/health", (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: "API funcionando corretamente",
        timestamp: new Date().toISOString()
    });
});

export default app;

