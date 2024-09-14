document.addEventListener('DOMContentLoaded', function() {
    const modeloSelect = document.getElementById('modelo');
    const sensoresSelect = document.getElementById('sensores');
    const precioElement = document.getElementById('precio');
    const calcularButton = document.getElementById('calcular');
    const shareBtn = document.getElementById('shareBtn');
    const cotizadorContainer = document.getElementById('cotizador-container');

    let datos = [];

    function cargarDatos() {
        const url = 'precios1.xlsx'; // Cambia el nombre para cada cotizador

        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const hoja = workbook.Sheets[workbook.SheetNames[0]];
                datos = XLSX.utils.sheet_to_json(hoja, { header: 1 });

                llenarSelects(datos);
            })
            .catch(error => console.error("Error al cargar el archivo .xlsx:", error));
    }

    function llenarSelects(datos) {
        datos.forEach((fila, index) => {
            if (index > 0) {
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

    function calcularPrecio() {
        const modelo = modeloSelect.value;
        const sensores = parseInt(sensoresSelect.value);

        let precio = 0;
        datos.forEach((fila) => {
            if (fila[0] === modelo && parseInt(fila[1]) === sensores) {
                precio = fila[2];
            }
        });

        if (precio !== 0) {
            precioElement.textContent = `USD ${parseFloat(precio).toFixed(2)}`;
        } else {
            precioElement.textContent = "No disponible";
        }
    }

    function resetPrecio() {
        precioElement.textContent = "USD 0.00";
    }

    // Función para capturar y compartir
    function capturarPantallaYCompartir() {
        html2canvas(cotizadorContainer).then(canvas => {
            canvas.toBlob(blob => {
                const archivo = new File([blob], "cotizacion.png", { type: "image/png" });
                if (navigator.share) {
                    navigator.share({
                        title: "Cotización de Monitores de Siembra",
                        text: "Aquí está la cotización que solicitaste:",
                        files: [archivo]
                    }).then(() => {
                        console.log("¡Cotización compartida exitosamente!");
                    }).catch(error => {
                        console.error("Error al compartir:", error);
                    });
                } else {
                    alert("La funcionalidad de compartir no está disponible en este dispositivo.");
                }
            });
        });
    }

    // Calcular precio cuando se hace clic en el botón
    calcularButton.addEventListener('click', calcularPrecio);

    // Restablecer el precio cuando se cambian las opciones
    modeloSelect.addEventListener('change', resetPrecio);
    sensoresSelect.addEventListener('change', resetPrecio);

    // Capturar y compartir al hacer clic en el botón
    shareBtn.addEventListener('click', capturarPantallaYCompartir);

    cargarDatos();
});
