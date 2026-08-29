document.addEventListener('DOMContentLoaded', function() {
    const modeloSelect = document.getElementById('modelo');
    const sensoresSelect = document.getElementById('sensores');
    const precioElement = document.getElementById('precio');

    let datos = [];

    function cargarDatos() {
        fetch('data/monitores-siembra.json')
            .then(response => response.json())
            .then(data => {
                datos = data;
                llenarSelects(datos);
                calcularPrecio();
            })
            .catch(error => console.error("Error al cargar la lista de precios:", error));
    }

    function llenarSelects(datos) {
        datos.forEach((fila) => {
            const modelo = fila.Modelo;
            const sensores = fila.Sensores;

            if (!modeloSelect.querySelector(`option[value="${modelo}"]`)) {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo;
                modeloSelect.appendChild(option);
            }

            if (!sensoresSelect.querySelector(`option[value="${sensores}"]`)) {
                const option = document.createElement('option');
                option.value = sensores;
                option.textContent = sensores;
                sensoresSelect.appendChild(option);
            }
        });
    }

    function calcularPrecio() {
        const modelo = modeloSelect.value;
        const sensores = parseInt(sensoresSelect.value);

        let precio = 0;
        datos.forEach((fila) => {
            if (fila.Modelo === modelo && parseInt(fila.Sensores) === sensores) {
                precio = fila.Precio;
            }
        });

        if (precio !== 0) {
            precioElement.textContent = formatearUSD(parseFloat(precio));
        } else {
            precioElement.textContent = "No disponible";
        }
    }

    // Recalcular apenas se cambia cualquiera de las dos opciones
    modeloSelect.addEventListener('change', calcularPrecio);
    sensoresSelect.addEventListener('change', calcularPrecio);

    initCompartir({ titulo: "Cotización de Monitores de Siembra" });

    cargarDatos();
});
