/**
 * Formatea un número como precio en dólares con el mismo criterio en los
 * 4 cotizadores (separador de miles/decimales de Argentina).
 */
function formatearUSD(valor) {
  return `USD ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor)}`;
}

const ICONO_WHATSAPP =
  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.8.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.3.2-.7.2-1.2.2-1.3-.1-.2-.3-.2-.6-.4z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5.1-1.3c1.5.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18.3c-1.6 0-3.2-.4-4.5-1.2l-.3-.2-3.4.9.9-3.3-.2-.3C3.7 14.8 3.2 13.4 3.2 12c0-4.9 3.9-8.8 8.8-8.8s8.8 3.9 8.8 8.8-3.9 8.8-8.8 8.8z"/></svg>';

/**
 * Captura la tarjeta del cotizador como imagen y ofrece compartirla
 * (Web Share API en celulares, o descarga + WhatsApp Web en escritorio).
 * Compartido por los 4 cotizadores para no repetir la misma lógica en cada script.
 */
function initCompartir({ shareBtnId = "shareBtn", containerId = "cotizador-container", titulo = "Cotización ControlAgro" } = {}) {
  const shareBtn = document.getElementById(shareBtnId);
  const container = document.getElementById(containerId);
  if (!shareBtn || !container) return;

  shareBtn.innerHTML = `${ICONO_WHATSAPP} Compartir por WhatsApp`;

  shareBtn.addEventListener("click", () => {
    html2canvas(container, { backgroundColor: "#ffffff", scale: 2 }).then((canvas) => {
      canvas.toBlob((blob) => {
        const archivo = new File([blob], "cotizacion.png", { type: "image/png" });
        const fecha = new Date();
        const textoCompartir = `Cotización generada el ${fecha.toLocaleDateString("es-AR")} a las ${fecha.toLocaleTimeString("es-AR")}`;

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [archivo] })) {
          navigator.share({ title: titulo, text: textoCompartir, files: [archivo] }).catch(() => {});
          return;
        }

        const urlImagen = URL.createObjectURL(blob);
        const enlace = document.createElement("a");
        enlace.href = urlImagen;
        enlace.download = "cotizacion.png";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        const mensaje = encodeURIComponent(`${textoCompartir}\nAdjunto la cotización.`);
        window.open(`https://web.whatsapp.com/send?text=${mensaje}`, "_blank");
        alert("La imagen de la cotización se descargó. Adjuntala manualmente en WhatsApp Web.");
      });
    });
  });
}
