const routes = [
    // ITENS
    { method: 'GET', path: '/api/itens', expected: 200 },
    { method: 'GET', path: '/api/itens/1', expected: [200, 404] },
    { method: 'POST', path: '/api/itens', expected: 201 },
    { method: 'PUT', path: '/api/itens/1', expected: [200, 404] },
    { method: 'PATCH', path: '/api/itens/1', expected: [200, 404] },
    { method: 'DELETE', path: '/api/itens/1', expected: [204, 404] },
    { method: 'GET', path: '/api/itens/search', expected: 200 },
    
    // USUARIOS
    { method: 'GET', path: '/api/usuarios', expected: 200 },
    { method: 'GET', path: '/api/usuarios/1', expected: [200, 404] },
    { method: 'POST', path: '/api/usuarios', expected: 201 },
    { method: 'PUT', path: '/api/usuarios/1', expected: [200, 404] },
    { method: 'DELETE', path: '/api/usuarios/1', expected: [204, 404] },
    
    // VENDAS
    { method: 'GET', path: '/api/vendas', expected: 200 },
    { method: 'GET', path: '/api/vendas/1', expected: [200, 404] },
    { method: 'POST', path: '/api/vendas', expected: 201 },
    { method: 'PUT', path: '/api/vendas/1', expected: [200, 404] },
    { method: 'DELETE', path: '/api/vendas/1', expected: [204, 404] },
    
    // CLIENTES
    { method: 'GET', path: '/api/clientes', expected: 200 },
    { method: 'GET', path: '/api/clientes/1', expected: [200, 404] },
    { method: 'POST', path: '/api/clientes', expected: 201 },
    { method: 'PUT', path: '/api/clientes/1', expected: [200, 404] },
    { method: 'DELETE', path: '/api/clientes/1', expected: [204, 404] },
];

console.log('Rotas a serem verificadas:');
routes.forEach(route => {
    console.log(`${route.method} ${route.path} -> Esperado: ${Array.isArray(route.expected) ? route.expected.join('|') : route.expected}`);
});
