document.addEventListener('DOMContentLoaded', function () {
    const modeloSelect = document.getElementById('modelo');
    const embraguesSelect = document.getElementById('embragues');
    const precioSpan = document.getElementById('precio');
    const shareBtn = document.getElementById('shareBtn');
    const cotizadorContainer = document.getElementById('cotizador-container');

    // Cargar archivo Excel y poblar los desplegables
    fetch('precios3.xlsx')
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
        });

    // Calcular precio
    function calcularPrecio() {
        const selectedModelo = modeloSelect.value;
        const selectedEmbragues = embraguesSelect.value;

        fetch('precios3.xlsx')
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
    }

    function resetPrecio() {
        precioSpan.textContent = "USD 0.00";
    }

    // Calcular precio cuando se hace clic en el botón
    document.getElementById('calcular').addEventListener('click', calcularPrecio);

    // Restablecer el precio cuando se cambian las opciones
    modeloSelect.addEventListener('change', resetPrecio);
    embraguesSelect.addEventListener('change', resetPrecio);

    // Función para capturar y compartir
    function capturarPantallaYCompartir() {
        html2canvas(cotizadorContainer).then(canvas => {
            canvas.toBlob(blob => {
                const archivo = new File([blob], "cotizacion.png", { type: "image/png" });
                if (navigator.share) {
                    navigator.share({
                        title: "Cotización Cortes por Sección",
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

    // Capturar y compartir al hacer clic en el botón
    shareBtn.addEventListener('click', capturarPantallaYCompartir);
});
