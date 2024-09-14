document.addEventListener('DOMContentLoaded', function() {
    const modeloSelect = document.getElementById('modelo');
    const sensoresSelect = document.getElementById('sensores');
    const precioElement = document.getElementById('precio');
    const calcularButton = document.getElementById('calcular');

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

    // Calcular precio cuando se hace clic en el botón
    calcularButton.addEventListener('click', calcularPrecio);

    // Restablecer el precio cuando se cambian las opciones
    modeloSelect.addEventListener('change', resetPrecio);
    sensoresSelect.addEventListener('change', resetPrecio);

    // Cargar los datos desde el archivo .xlsx al iniciar
    cargarDatos();

    // Función para capturar la pantalla y compartir por WhatsApp
    document.getElementById('shareBtn').addEventListener('click', function() {
        html2canvas(document.getElementById('cotizador-container')).then(canvas => {
            const imgData = canvas.toDataURL('image/png');

            // Crear un enlace temporal para descargar la imagen
            const link = document.createElement('a');
            link.href = imgData;
            link.download = 'cotizacion.png';
            link.click();

            // Compartir por WhatsApp (nota: WhatsApp no soporta enviar imágenes directamente desde el navegador)
            const whatsappURL = `https://wa.me/?text=Te envío la captura de la cotización.`;
            window.open(whatsappURL, '_blank');
        });
    });
});
