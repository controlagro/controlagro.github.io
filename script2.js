document.addEventListener("DOMContentLoaded", function () {
    const tipoSelect = document.getElementById("tipo");
    const calcularBtn = document.getElementById("calcular");
    const badgeLista = document.getElementById("badge-lista");
    const resultado = document.getElementById("resultado");
    const precioEl = document.getElementById("precio");
    const descripcionEl = document.getElementById("descripcion");
    const formasPagoEl = document.getElementById("formas-pago");
    const ivaNotaEl = document.getElementById("iva-nota");

    const ETIQUETAS_PRECIO = {
        contado: { etiqueta: "Contado", nota: "Precio de lista" },
        dias180: { etiqueta: "Financiación 0 a 180 días", nota: "En pesos, sin interés" },
        dias360: { etiqueta: "Financiación 0 a 360 días", nota: "Anticipo 30% + saldo sin interés" },
    };

    const formatearUSD = (valor) =>
        `USD ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)}`;

    let itemsPorClave = {};

    function ocultarResultado() {
        resultado.classList.add("oculto");
    }

    function poblarSelect(data) {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Seleccionar…";
        placeholder.disabled = true;
        placeholder.selected = true;
        tipoSelect.appendChild(placeholder);

        data.secciones.forEach((seccion) => {
            const optgroup = document.createElement("optgroup");
            optgroup.label = seccion.titulo;

            seccion.items.forEach((item) => {
                itemsPorClave[item.clave] = item;

                const option = document.createElement("option");
                option.value = item.clave;
                option.textContent = item.nombre;
                optgroup.appendChild(option);
            });

            tipoSelect.appendChild(optgroup);
        });
    }

    function mostrarBadge(data) {
        const partes = [];
        if (data.lista) partes.push(`Lista ${data.lista}`);
        if (data.vigenciaHasta) partes.push(`vigente hasta ${data.vigenciaHasta.toLowerCase()}`);
        badgeLista.textContent = partes.join(" · ") || "Lista de precios";
    }

    function calcularPrecio() {
        const item = itemsPorClave[tipoSelect.value];
        if (!item) return;

        precioEl.textContent = formatearUSD(item.precios.contado);
        descripcionEl.textContent = item.descripcion;

        formasPagoEl.innerHTML = "";
        Object.keys(ETIQUETAS_PRECIO).forEach((clave) => {
            const valor = item.precios[clave];
            if (valor === undefined) return;

            const { etiqueta, nota } = ETIQUETAS_PRECIO[clave];
            const fila = document.createElement("div");
            fila.className = "fila" + (clave === "contado" ? " destacada" : "");
            fila.innerHTML = `
                <span class="etiqueta">${etiqueta}<small>${nota}</small></span>
                <span class="valor">${formatearUSD(valor)}</span>
            `;
            formasPagoEl.appendChild(fila);
        });

        ivaNotaEl.textContent = `Instalación e IVA (${item.iva}) incluidos.`;
        resultado.classList.remove("oculto");
    }

    tipoSelect.addEventListener("change", () => {
        ocultarResultado();
        calcularBtn.disabled = !tipoSelect.value;
    });

    calcularBtn.addEventListener("click", calcularPrecio);

    fetch("data/pilotos-integra-6000.json")
        .then((response) => {
            if (!response.ok) throw new Error("No se pudo cargar la lista de precios");
            return response.json();
        })
        .then((data) => {
            poblarSelect(data);
            mostrarBadge(data);
        })
        .catch((error) => {
            console.error(error);
            badgeLista.textContent = "No se pudo cargar la lista de precios";
            tipoSelect.disabled = true;
        });

    initCompartir({ titulo: "Cotización Piloto INTEGRA 6000" });
});
