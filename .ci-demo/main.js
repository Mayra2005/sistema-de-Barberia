
const precios = {
    corte: 120,
    barba: 60,
    cejas: 40,
    mascarilla: 50
};

// Calcula el precio total de los servicios seleccionados
function calcularTotal(servicios) {
    return servicios.reduce((total, servicio) => {
        if (!(servicio in precios)) {
            throw new Error(`Servicio desconocido: ${servicio}`);
        }

        return total + precios[servicio];
    }, 0);
}

// Exporta la función para utilizarla en las pruebas
module.exports = { calcularTotal };
