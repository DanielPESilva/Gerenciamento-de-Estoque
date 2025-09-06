import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import clienteRouter from "./routes/cliente.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/clientes", clienteRouter);

export default app;

