import "dotenv/config";
import app from "./src/app.js";

const port = process.env.PORT || 3000;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 DressFy API rodando em http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Recebido SIGTERM, fechando servidor...');
    server.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nRecebido SIGINT, fechando servidor...');
    server.close(() => {
        console.log('Servidor fechado.');
        process.exit(0);
    });
});