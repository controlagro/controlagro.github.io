document.addEventListener("DOMContentLoaded", function () {
    const modeloSelect = document.getElementById("modelo");
    const embraguesSelect = document.getElementById("embragues");
    const calcularBtn = document.getElementById("calcular");
    const precioDisplay = document.getElementById("precio");

    let precios = {};

    // Modelos que NO llevan embragues
    const modelosSinEmbragues = [
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 1 AÑO",
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 3 MESES",
        "ACTIVACION ANTENA PARA TERRASTAR C PRO (única vez)"
    ];

    // Cargar archivo de precios
    fetch("LP 0225 CORTES x SECCION INTEGRA 6000.xlsx")
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // Procesar datos del Excel
            jsonData.forEach(row => {
                const modelo = row["Modelo"];
                const cantidadEmbragues = row["Cantidad de Embragues"];
                const precio = row["Precio"];

                if (!precios[modelo]) {
                    precios[modelo] = {
                        preciosPorEmbrague: {}, // Objeto para guardar precios por cantidad de embragues
                        precioBase: null, // Precio base para modelos sin embragues
                        embragues: []
                    };
                }

                // Guardar precios asociados a la cantidad de embragues
                if (cantidadEmbragues) {
                    precios[modelo].preciosPorEmbrague[cantidadEmbragues] = precio;
                    precios[modelo].embragues.push(cantidadEmbragues);
                } else {
                    precios[modelo].precioBase = precio; // Guardar precio base para modelos sin embragues
                }
            });

            // Llenar el select de modelos
            Object.keys(precios).forEach(modelo => {
                let option = document.createElement("option");
                option.value = modelo;
                option.textContent = modelo;
                modeloSelect.appendChild(option);
            });

            // Disparar el evento de cambio para cargar el primer modelo
            modeloSelect.dispatchEvent(new Event("change"));
        });

    // Manejo del cambio de modelo
    modeloSelect.addEventListener("change", function () {
        const modeloSeleccionado = modeloSelect.value;

        // Reiniciar la cotización
        precioDisplay.textContent = "USD 0.00";

        // Reiniciar y habilitar el campo de embragues
        embraguesSelect.innerHTML = "";
        embraguesSelect.disabled = false;

        // Verificar si el modelo NO lleva embragues
        if (modelosSinEmbragues.includes(modeloSeleccionado)) {
            embraguesSelect.disabled = true;
            embraguesSelect.innerHTML = "<option value=''>N/A</option>"; // Opción vacía
        } else {
            // Llenar el select de embragues con opciones disponibles
            if (precios[modeloSeleccionado] && precios[modeloSeleccionado].embragues.length > 0) {
                let optionDefault = document.createElement("option");
                optionDefault.value = "";
                optionDefault.textContent = "Seleccione cantidad";
                embraguesSelect.appendChild(optionDefault);

                precios[modeloSeleccionado].embragues.forEach(embrague => {
                    let option = document.createElement("option");
                    option.value = embrague;
                    option.textContent = embrague;
                    embraguesSelect.appendChild(option);
                });
            }
        }
    });

    // **Nueva corrección: Resetear precio al cambiar de cantidad de embragues**
    embraguesSelect.addEventListener("change", function () {
        precioDisplay.textContent = "USD 0.00";
    });

    // Calcular precio
    calcularBtn.addEventListener("click", function () {
        const modeloSeleccionado = modeloSelect.value;
        const embragueSeleccionado = embraguesSelect.value;

        // Reiniciar el precio antes de calcular
        precioDisplay.textContent = "USD 0.00";

        if (!modeloSeleccionado || !precios[modeloSeleccionado]) {
            return;
        }

        // Si el modelo NO requiere embragues, usar su precio base
        if (modelosSinEmbragues.includes(modeloSeleccionado)) {
            const precioBase = precios[modeloSeleccionado].precioBase || 0;
            precioDisplay.textContent = `USD ${precioBase.toFixed(2)}`;
            return;
        }

        // Si el modelo requiere embragues pero no se seleccionó ninguno
        if (!embragueSeleccionado) {
            precioDisplay.textContent = "Seleccione la cantidad de embragues";
            return;
        }

        // Obtener el precio correcto según la cantidad de embragues elegida
        let precioFinal = precios[modeloSeleccionado].preciosPorEmbrague[embragueSeleccionado] || 0;

        // Mostrar el precio final
        precioDisplay.textContent = `USD ${precioFinal.toFixed(2)}`;
    });
});
