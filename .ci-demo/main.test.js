
const test = require('node:test');
const assert = require('node:assert/strict');
const { calcularTotal } = require('./main');

test('El precio de un corte es 120 pesos', () => {
    assert.equal(calcularTotal(['corte']), 120);
});

test('El corte y la barba suman 180 pesos', () => {
    assert.equal(calcularTotal(['corte', 'barba']), 180);
});

test('Sin servicios, el total es cero', () => {
    assert.equal(calcularTotal([]), 0);
});

test('Un servicio desconocido debe rechazarse', () => {
    assert.throws(() => calcularTotal(['masaje']));
});
