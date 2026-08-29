/**
 * Captura la tarjeta del cotizador como imagen y ofrece compartirla
 * (Web Share API en celulares, o descarga + WhatsApp Web en escritorio).
 * Compartido por los 4 cotizadores para no repetir la misma lógica en cada script.
 */
function initCompartir({ shareBtnId = "shareBtn", containerId = "cotizador-container", titulo = "Cotización ControlAgro" } = {}) {
  const shareBtn = document.getElementById(shareBtnId);
  const container = document.getElementById(containerId);
  if (!shareBtn || !container) return;

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
