document.addEventListener('DOMContentLoaded', function () {
    const modeloSelect = document.getElementById('modelo');
    const embraguesSelect = document.getElementById('embragues');
    const precioSpan = document.getElementById('precio');
    const descripcionP = document.getElementById('descripcion');
    const shareBtn = document.getElementById('shareBtn');
    const cotizadorContainer = document.getElementById('cotizador-container');

    // Cargar archivo Excel y poblar los desplegables
    fetch('precios4.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            // Poblar el desplegable de modelos
            const modelos = [...new Set(rows.slice(1).map(row => row[0]))];
            modelos.forEach(modelo => {
                const option = document.createElement('option');
                option.value = modelo;
                option.textContent = modelo;
                modeloSelect.appendChild(option);
            });

            // Poblar el desplegable de embragues
            const embragues = [...new Set(rows.slice(1).map(row => row[1]))];
            embragues.forEach(embrague => {
                const option = document.createElement('option');
                option.value = embrague;
                option.textContent = embrague;
                embraguesSelect.appendChild(option);
            });

            // Actualizar la descripción al cargar la página con la primera opción por defecto
            updateDescripcion(modeloSelect.value);
        });

    // Actualizar descripción según la opción seleccionada en el desplegable de modelos
    modeloSelect.addEventListener('change', function () {
        updateDescripcion(modeloSelect.value);
        resetPrecio(); // Restablecer precio cuando se cambia el modelo
    });

    // Actualizar descripción según la opción seleccionada en el desplegable de embragues
    embraguesSelect.addEventListener('change', function () {
        resetPrecio(); // Restablecer precio cuando se cambia la cantidad de embragues
    });

    // Función para actualizar la descripción
    function updateDescripcion(selectedModelo) {
        let descripcionTexto = '';

        switch (selectedModelo) {
            case 'INTEGRA 6000 CON TEKMATIC SIN ANTENA':
                descripcionTexto = 'Integra 6000 + equipo de corte por surco con embragues TEKMATIC Clasicc o para MaterMacc SIN ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            case 'INTEGRA 6000 CON TEKMATIC CON ANTENA':
                descripcionTexto = 'Integra 6000 + equipo de corte por surco con embragues TEKMATIC Clasicc o para MaterMacc CON ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            case 'INTEGRA 6000 CON GATILLO SIN ANTENA':
                descripcionTexto = 'PANTALLA i6000 + equipo de corte por surco a "GATILLO" para DOSIFIC. MaterMacc c/tapa EV3 SIN ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            case 'INTEGRA 6000 CON GATILLO CON ANTENA':
                descripcionTexto = 'PANTALLA i6000 + equipo de corte por surco a "GATILLO" para DOSIFIC. MaterMacc c/tapa EV3 CON ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            case 'SOLO SEMBRADORA con CORTE TEKMATIC':
                descripcionTexto = 'EQUIPOS SOLO SEMBRADORA con CORTE POR SURCO con EMBRAGUES TEKMATIC.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            case 'SOLO SEMBRADORA con CORTE a GATILLO':
                descripcionTexto = 'EQUIPOS SOLO SEMBRADORA con CORTE POR SURCO con EMBRAGUES a GATILLO para DOSIF. MATERMACC c/tapa EV3.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
                break;
            default:
                descripcionTexto = 'Instalación e IVA (10,5%) incluidos.<br>Contado: 10% de descuento sobre el precio de lista.<br>FINANCIACIÓN: en pesos desde 0 hasta 120 días sin interés, y en dólares ajustables desde 0 hasta 12 meses.';
        }

        // Actualizar el contenido de la descripción con saltos de línea
        descripcionP.innerHTML = descripcionTexto;
    }

    function resetPrecio() {
        precioSpan.textContent = "USD 0.00";
    }

    // Calcular precio
    document.getElementById('calcular').addEventListener('click', function () {
        const selectedModelo = modeloSelect.value;
        const selectedEmbragues = embraguesSelect.value;

        fetch('precios4.xlsx')
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Buscar el precio correspondiente al modelo y la cantidad de embragues
                const matchingRow = rows.find(row => row[0] === selectedModelo && row[1].toString() === selectedEmbragues);
                const price = matchingRow ? matchingRow[2] : 0;
                precioSpan.textContent = `USD ${parseFloat(price).toFixed(2)}`;
            });
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
                        title: 'Cotización Cortes surco por surco',
                        text: textoCompartir,
                        files: [archivo],
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

    // Evento para capturar y compartir en WhatsApp
    shareBtn.addEventListener('click', capturarPantallaYCompartir);
});
