document.addEventListener('DOMContentLoaded', function () {
    const tipoSelect = document.getElementById('tipo');
    const precioSpan = document.getElementById('precio');
    const descripcionP = document.querySelector('.descripcion-principal');
    const shareBtn = document.getElementById('shareBtn');
    const cotizadorContainer = document.getElementById('cotizador-container');

    // Cargar archivo Excel y poblar el desplegable
    fetch('precios2.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Poblar el desplegable
            rows.slice(1).forEach(row => {
                const option = document.createElement('option');
                option.value = row[1];  // Precio
                option.textContent = row[0];  // Tipo de activación y abono
                tipoSelect.appendChild(option);
            });

            // Actualizar la descripción al cargar la página con la primera opción por defecto
            updateDescripcion(tipoSelect.options[0].textContent);
        });

    // Actualizar descripción y resetear precio según la opción seleccionada
    tipoSelect.addEventListener('change', function () {
        updateDescripcion(tipoSelect.options[tipoSelect.selectedIndex].textContent);
        precioSpan.textContent = 'USD 0.00';  // Restablecer el precio a 0
    });

    // Función para actualizar la descripción
    function updateDescripcion(selectedTipo) {
        let descripcionTexto = '';

        switch (selectedTipo) {
            case 'Antena NOVATEL L1-L2 Señal libre de 35 cm':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg. táctil, con giro en cabecera, volante con motor eléctrico y antena NOVATEL L1-L2 con señal libre de 35 cm.';
                break;
            case 'Antena NOVATEL L1-L2 ACTIVACIÓN SIN abono 15 CM':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg. táctil, con giro en cabecera, volante con motor eléctrico y antena NOVATEL L1-L2 con ACTIVACIÓN, SIN abono, con 15 CM de PRECISIÓN.';
                break;
            case 'Antena NOVATEL L1-L2 ACTIVACIÓN y ABONO TRIMESTRAL 2,5 CM':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg. táctil, con giro en cabecera, volante con motor eléctrico y antena NOVATEL L1-L2 con ACTIVACIÓN y abono trimestral con 2,5 CM de PRECISIÓN.';
                break;
            case 'Antena NOVATEL L1-L2 ACTIVACIÓN y ABONO ANUAL 2,5 CM':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg. táctil, con giro en cabecera, volante con motor eléctrico y antena NOVATEL L1-L2 con ACTIVACIÓN y abono anual con 2,5 CM de PRECISIÓN.';
                break;
            case 'SURVEY L1 CON base portátil RTK':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg. táctil, con giro en cabecera, volante con motor eléctrico, y antena con base portátil RTK, con precisión de 2,5 cm.';
                break;
            case 'SURVEY L1 SIN base portátil RTK':
                descripcionTexto = 'Equipo piloto automático INTEGRA 6000, pantalla 10 pulg., con giro en cabecera, Antena SURVEY L1 (compatible pero sin base RTK, SIN abonos), volante con motor eléc., con señal libre con precisión de 15 cm.';
                break;
            default:
                descripcionTexto = 'El equipo está compuesto por una pantalla táctil de 10 pulgadas, con giro en cabecera, volante con motor eléctrico y antena NOVATEL L1-L2.';
        }

        // Actualizar el contenido de la descripción
        descripcionP.innerHTML = descripcionTexto;
    }

    // Calcular precio
    document.getElementById('calcular').addEventListener('click', function () {
        const selectedPrice = tipoSelect.value;
        precioSpan.textContent = `USD ${parseFloat(selectedPrice).toFixed(2)}`;
    });

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
                        title: "Cotización Equipo INTEGRA 6000",
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

    // Capturar y compartir al hacer clic en el botón
    shareBtn.addEventListener('click', capturarPantallaYCompartir);
});
