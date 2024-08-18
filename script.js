document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const modeloSelect = document.getElementById('modelo');
    const sensoresSelect = document.getElementById('sensores');
    const precioElement = document.getElementById('precio');
    const calcularButton = document.getElementById('calcular');

    // Variable para almacenar los datos del archivo .xlsx
    let datos = [];

    // Función para cargar el archivo .xlsx y obtener los datos
    function cargarDatos() {
        const url = 'precios.xlsx'; // Reemplazar con la ruta real del archivo .xlsx

        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const hoja = workbook.Sheets[workbook.SheetNames[0]];
                datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

                // Procesar los datos y llenar los selects
                llenarSelects(datos);
            })
            .catch(error => console.error("Error al cargar el archivo .xlsx:", error));
    }

    // Función para llenar los selects con los datos del archivo
    function llenarSelects(datos) {
        datos.forEach((fila, index) => {
            if (index > 0) { // Saltamos la primera fila (encabezados)
                const modelo = fila[0];
                const sensores = fila[1];

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
            }
        });
    }

    // Función para calcular el precio
    function calcularPrecio() {
        const modelo = modeloSelect.value;
        const sensores = parseInt(sensoresSelect.value);

        console.log("Modelo seleccionado:", modelo);
        console.log("Sensores seleccionados:", sensores);

        let precio = 0;
        datos.forEach((fila) => {
            console.log("Procesando fila:", fila);
            if (fila[0] === modelo && parseInt(fila[1]) === sensores) {
                precio = fila[2]; // Asegúrate de que el índice 2 corresponde a la columna del precio
                console.log("Precio encontrado:", precio);
            }
        });

        if (precio !== 0) {
            precioElement.textContent = `USD ${parseFloat(precio).toFixed(2)}`;
        } else {
            precioElement.textContent = "No disponible";
        }
    }

    // Event listeners
    calcularButton.addEventListener('click', calcularPrecio);

    // Cargar los datos al inicio
    cargarDatos();
});
