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

                // Obtener fecha y hora actuales
                const fechaActual = new Date();
                const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
                const opcionesHora = { hour: '2-digit', minute: '2-digit', second: '2-digit' };
                const fechaFormateada = fechaActual.toLocaleDateString('es-ES', opcionesFecha);
                const horaFormateada = fechaActual.toLocaleTimeString('es-ES', opcionesHora);

                // Crear el texto con fecha y hora
                const textoCompartir = `Cotización generada el ${fechaFormateada} a las ${horaFormateada}`;

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })) {
                    // Compartir en dispositivos móviles
                    navigator.share({
                        title: "Cotización de Monitores de Siembra",
                        text: textoCompartir,
                        files: [archivo]
                    }).then(() => {
                        console.log("¡Cotización compartida exitosamente!");
                    }).catch(error => {
                        console.error("Error al compartir:", error);
                    });
                } else {
                    // Descargar la imagen en computadoras de escritorio
                    const urlImagen = URL.createObjectURL(blob);

                    // Crear un enlace temporal para descargar la imagen
                    const enlaceDescarga = document.createElement('a');
                    enlaceDescarga.href = urlImagen;
                    enlaceDescarga.download = 'cotizacion.png';
                    document.body.appendChild(enlaceDescarga);
                    enlaceDescarga.click();
                    document.body.removeChild(enlaceDescarga);

                    // Abrir WhatsApp Web con mensaje predefinido
                    const mensajeWhatsApp = encodeURIComponent(textoCompartir + "\nAdjunto la cotización.");
                    const urlWhatsApp = `https://web.whatsapp.com/send?text=${mensajeWhatsApp}`;
                    window.open(urlWhatsApp, '_blank');

                    // Mostrar una alerta al usuario
                    alert('La imagen de la cotización se ha descargado. Por favor, adjunta la imagen manualmente en WhatsApp Web.');
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
