document.addEventListener("DOMContentLoaded", function () {
    const modeloSelect = document.getElementById("modelo");
    const embraguesSelect = document.getElementById("embragues");
    const calcularBtn = document.getElementById("calcular");
    const precioDisplay = document.getElementById("precio");
    const shareBtn = document.getElementById("shareBtn");
    const cotizadorContainer = document.getElementById("cotizador-container");

    let precios = {};

    const modelosSinEmbragues = [
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 1 AÑO",
        "ABONO SEÑAL TERRASTAR C PRO 2,5 CM POR 3 MESES",
        "ACTIVACION ANTENA PARA TERRASTAR C PRO (por única vez)"
    ];

    fetch("LP 0225 Cortes x SURCO INTEGRA 6000.xlsx")
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

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
        precioDisplay.textContent = "USD 0.00";
        embraguesSelect.innerHTML = "";
        embraguesSelect.disabled = false;

        if (modelosSinEmbragues.includes(modeloSeleccionado)) {
            embraguesSelect.disabled = true;
            embraguesSelect.innerHTML = "<option value=''>N/A</option>";
        } else {
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

    embraguesSelect.addEventListener("change", function () {
        precioDisplay.textContent = "USD 0.00";
    });

    calcularBtn.addEventListener("click", function () {
        const modeloSeleccionado = modeloSelect.value;
        const embragueSeleccionado = embraguesSelect.value;

        precioDisplay.textContent = "USD 0.00";

        if (!modeloSeleccionado || !precios[modeloSeleccionado]) {
            return;
        }

        if (modelosSinEmbragues.includes(modeloSeleccionado)) {
            const precioBase = precios[modeloSeleccionado].precioBase || 0;
            precioDisplay.textContent = `USD ${precioBase.toFixed(2)}`;
            return;
        }

        if (!embragueSeleccionado) {
            precioDisplay.textContent = "Seleccione la cantidad de embragues";
            return;
        }

        let precioFinal = precios[modeloSeleccionado].preciosPorEmbrague[embragueSeleccionado] || 0;
        precioDisplay.textContent = `USD ${precioFinal.toFixed(2)}`;
    });

    function capturarPantallaYCompartir() {
        html2canvas(cotizadorContainer).then(canvas => {
            canvas.toBlob(blob => {
                const archivo = new File([blob], "cotizacion.png", { type: "image/png" });
                const mensajeWhatsApp = encodeURIComponent("Adjunto la cotización generada.");
                const urlWhatsApp = `https://web.whatsapp.com/send?text=${mensajeWhatsApp}`;

                if (navigator.share && navigator.canShare({ files: [archivo] })) {
                    navigator.share({
                        title: "Cotización de Equipos",
                        text: "Adjunto la cotización generada.",
                        files: [archivo]
                    });
                } else {
                    const urlImagen = URL.createObjectURL(blob);
                    const enlaceDescarga = document.createElement('a');
                    enlaceDescarga.href = urlImagen;
                    enlaceDescarga.download = 'cotizacion.png';
                    document.body.appendChild(enlaceDescarga);
                    enlaceDescarga.click();
                    document.body.removeChild(enlaceDescarga);
                    window.open(urlWhatsApp, '_blank');
                }
            });
        });
    }

    shareBtn.addEventListener('click', capturarPantallaYCompartir);
});
