document.addEventListener("DOMContentLoaded", function () {
    const modeloSelect = document.getElementById("modelo");
    const embraguesSelect = document.getElementById("embragues");
    const campoEmbragues = document.getElementById("campo-embragues");
    const precioDisplay = document.getElementById("precio");
    const descripcionElemento = document.getElementById("descripcion-modelo");

    let precios = {};

    // Condiciones comerciales dictadas por el cliente: mismo texto para
    // todos los equipos TEKMATIC, y mismo texto (con otro encabezado) para
    // todos los equipos a GATILLO. Se muestran como HTML (negritas + saltos
    // de línea) dentro de la misma caja de descripción de siempre.
    const CONDICIONES_TEKMATIC = `IVA INCLUIDO DEL 10,5%.<br>
<strong>CONTADO</strong>: 10% DESCUENTO con CHEQUE/TRANSFERENCIA dentro de 15 días de fecha factura.<br>
<strong>FINANCIACIÓN 180 días en PESOS</strong>, <strong>7</strong> CHEQUES a 0, 30, 60, 90, 120, 150, y 180 dias, SIN INTERES.<br>
<strong>FINANCIACIÓN 360 dias:</strong><br>
<strong>con ANTICIPO 30%</strong>, y SALDO EN <strong>12</strong> CHEQUES, DESDE 30, 60,..., 330, y 360 DIAS.`;

    const CONDICIONES_GATILLO = `INSTALACIÓN E IVA DEL 10,5% INCLUIDOS.<br>
<strong>CONTADO</strong>: 10% DESCUENTO con CHEQUE/TRANSFERENCIA dentro de 15 días de fecha factura.<br>
<strong>FINANCIACIÓN 180 días en PESOS</strong>, <strong>7</strong> CHEQUES a 0, 30, 60, 90, 120, 150, y 180 dias, SIN INTERES.<br>
<strong>FINANCIACIÓN 360 dias:</strong><br>
<strong>con ANTICIPO 30%</strong>, y SALDO EN <strong>12</strong> CHEQUES, DESDE 30, 60,..., 330, y 360 DIAS.`;

    const descripcionesPorModelo = {
        "INTEGRA 6000 CON TEKMATIC SIN ANTENA": CONDICIONES_TEKMATIC,
        "INTEGRA 6000 CON TEKMATIC CON ANTENA": CONDICIONES_TEKMATIC,
        "INTEGRA 6000 CON GATILLO SIN ANTENA": CONDICIONES_GATILLO,
        "INTEGRA 6000 CON GATILLO CON ANTENA": CONDICIONES_GATILLO,
        "SOLO SEMBRADORA con CORTE TEKMATIC": CONDICIONES_TEKMATIC,
        "SOLO SEMBRADORA con CORTE a GATILLO": CONDICIONES_GATILLO,
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 1 AÑO": "Instalación e IVA (21%) incluidos. CONTADO.",
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 3 MESES": "Instalación e IVA (21%) incluidos. CONTADO.",
        "ACTIVACION ANTENA PARA TERRASTAR C PRO (por única vez)": "Instalación e IVA (21%) incluidos. CONTADO."
    };

    const modelosSinEmbragues = [
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 1 AÑO",
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 3 MESES",
        "ACTIVACION ANTENA PARA TERRASTAR C PRO (por única vez)"
    ];

    function mostrarPendiente(mensaje) {
        precioDisplay.textContent = mensaje;
        precioDisplay.classList.add("precio-pendiente");
    }

    function mostrarPrecio(valor) {
        precioDisplay.textContent = formatearUSD(valor);
        precioDisplay.classList.remove("precio-pendiente");
    }

    fetch("data/cortes-surco.json")
        .then(response => response.json())
        .then(jsonData => {
            jsonData.forEach(row => {
                const modelo = row["Modelo"];
                const cantidadEmbragues = row["Cantidad de Embragues"];
                const precio = row["Precio"];

                if (!precios[modelo]) {
                    precios[modelo] = {
                        preciosPorEmbrague: {},
                        precioBase: null,
                        embragues: []
                    };
                }

                if (cantidadEmbragues) {
                    precios[modelo].preciosPorEmbrague[cantidadEmbragues] = precio;
                    precios[modelo].embragues.push(cantidadEmbragues);
                } else {
                    precios[modelo].precioBase = precio;
                }
            });

            Object.keys(precios).forEach(modelo => {
                let option = document.createElement("option");
                option.value = modelo;
                option.textContent = modelo;
                modeloSelect.appendChild(option);
            });

            modeloSelect.dispatchEvent(new Event("change"));
        });

    modeloSelect.addEventListener("change", function () {
        const modeloSeleccionado = modeloSelect.value;
        embraguesSelect.innerHTML = "";

        descripcionElemento.innerHTML = descripcionesPorModelo[modeloSeleccionado] || "";

        if (modelosSinEmbragues.includes(modeloSeleccionado)) {
            campoEmbragues.classList.add("oculto");
            const precioBase = (precios[modeloSeleccionado] && precios[modeloSeleccionado].precioBase) || 0;
            mostrarPrecio(precioBase);
            return;
        }

        campoEmbragues.classList.remove("oculto");

        let optionDefault = document.createElement("option");
        optionDefault.value = "";
        optionDefault.textContent = "Seleccione cantidad";
        embraguesSelect.appendChild(optionDefault);

        if (precios[modeloSeleccionado] && precios[modeloSeleccionado].embragues.length > 0) {
            precios[modeloSeleccionado].embragues.forEach(embrague => {
                let option = document.createElement("option");
                option.value = embrague;
                option.textContent = embrague;
                embraguesSelect.appendChild(option);
            });
        }

        mostrarPendiente("Elegí la cantidad de embragues");
    });

    embraguesSelect.addEventListener("change", function () {
        const modeloSeleccionado = modeloSelect.value;
        const embragueSeleccionado = embraguesSelect.value;

        if (!embragueSeleccionado) {
            mostrarPendiente("Elegí la cantidad de embragues");
            return;
        }

        const precioFinal = (precios[modeloSeleccionado] && precios[modeloSeleccionado].preciosPorEmbrague[embragueSeleccionado]) || 0;
        mostrarPrecio(precioFinal);
    });

    initCompartir({ titulo: "Cotización de Equipos" });
});
