import VendasSchema from './src/schemas/vendasSchema.js';

// Teste da validação
const testData = {
    forma_pgto: "Dinheiro",
    valor_total: 120,
    desconto: 0,
    valor_pago: 120,
    itens: [
        {
            roupas_id: 28,
            quantidade: 1
        }
    ]
};

console.log("Testando validação...");
const result = VendasSchema.create.safeParse(testData);

if (result.success) {
    console.log("✅ Validação passou");
    console.log("Dados validados:", result.data);
} else {
    console.log("❌ Erro na validação:");
    console.log(result.error.issues);
}
