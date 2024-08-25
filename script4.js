document.addEventListener('DOMContentLoaded', function () {
    const modeloSelect = document.getElementById('modelo');
    const embraguesSelect = document.getElementById('embragues');
    const precioSpan = document.getElementById('precio');
    const descripcionP = document.getElementById('descripcion');

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
            case 'INTEGRA 6000 SIN ANTENA':
                descripcionTexto = 'Integra 6000 + equipo de corte por surco con embragues TEKMATIC Clasicc o para MaterMacc SIN ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            case 'INTEGRA 6000 CON ANTENA':
                descripcionTexto = 'Integra 6000 + equipo de corte por surco con embragues TEKMATIC Clasicc o para MaterMacc CON ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            case 'PANTALLA i6000 SIN ANTENA':
                descripcionTexto = 'PANTALLA i6000 + equipo de corte por surco a "GATILLO" para DOSIFIC. MaterMacc c/tapa EV3 SIN ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            case 'PANTALLA i6000 CON ANTENA':
                descripcionTexto = 'PANTALLA i6000 + equipo de corte por surco a "GATILLO" para DOSIFIC. MaterMacc c/tapa EV3 CON ANTENA.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            case 'TEKMATIC':
                descripcionTexto = 'Equipo de corte por surco con cualquier modelo o tipos de embragues TEKMATIC.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            case 'GATILLO PARA DOSIFICADOR MATERMACC':
                descripcionTexto = 'Equipo de corte por surco con "GATILLO" para DOSIFIC. MaterMacc c/ tapa EV3.<br><br>Instalación e IVA (10,5%) incluidos. Contado: 10% de descuento sobre el precio de lista. Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
                break;
            default:
                descripcionTexto = 'Instalación e IVA (10,5%) incluidos.<br>Contado: 10% de descuento sobre el precio de lista.<br>Financiación: en pesos hasta 120 días sin interés y en dólares ajustable.';
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
});
