document.addEventListener('DOMContentLoaded', function () {
    const tipoSelect = document.getElementById('tipo');
    const precioSpan = document.getElementById('precio');

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
        });

    // Calcular precio
    document.getElementById('calcular').addEventListener('click', function () {
        const selectedPrice = tipoSelect.value;
        precioSpan.textContent = `USD ${parseFloat(selectedPrice).toFixed(2)}`;
    });
});
