# Cotizadores ControlAgro

Sitio estático (sin backend) con 4 cotizadores, pensado para publicarse en GitHub Pages.

## Estructura

- `index.html` — página de inicio con acceso a los 4 cotizadores.
- `styles.css` — diseño compartido por todas las páginas.
- `compartir.js` — lógica común de "Compartir por WhatsApp" (captura de pantalla + descarga).
- `cotizador1.html` / `script1.js` — **Monitores de siembra**. Lee `LP 0225 MONITOR DE SIEMBRA ControlAgro.xlsx` en el navegador.
- `cotizador2.html` / `script2.js` — **Pilotos INTEGRA 6000**. Lee `data/pilotos-integra-6000.json` (ver abajo cómo se genera).
- `cotizador3.html` / `script3.js` — **Cortes por sección**. Lee `LP 0225 CORTES x SECCION INTEGRA 6000.xlsx`.
- `cotizador4.html` / `script4.js` — **Cortes surco por surco**. Lee `LP 0225 Cortes x SURCO INTEGRA 6000.xlsx`.

## Actualizar los precios de Pilotos INTEGRA 6000 (sin tocar Excel)

Este cotizador ya **no** depende de un Excel armado a mano: los precios salen de
`data/pilotos-integra-6000.json`, que se genera automáticamente a partir del PDF
de lista de precios oficial ("PILOTOS ControlAgro INTEGRA 6000").

Cada vez que llegue una lista de precios nueva:

1. La primera vez únicamente, instalá la dependencia (Python 3 ya viene en macOS):

   ```bash
   pip3 install -r scripts/requirements.txt
   ```

2. Corré el script apuntando al PDF nuevo:

   ```bash
   python3 scripts/generar_precios_pilotos.py "/ruta/al/LP XXXX PILOTOS INTEGRA 6000.pdf"
   ```

3. El script imprime en pantalla un resumen de todos los ítems y precios que
   detectó. **Revisalo contra el PDF** antes de subir el cambio (por si algún
   ítem nuevo no fue reconocido — en ese caso aparece igual, con un nombre
   genérico, para que no se pierda ningún precio silenciosamente).

4. Si todo está bien, subí a GitHub el archivo `data/pilotos-integra-6000.json`
   actualizado junto con el resto del sitio. No hace falta editar ningún otro
   archivo — GitHub Pages lo sirve como un archivo estático más.

Los otros tres cotizadores (Monitores, Cortes por sección, Cortes surco por
surco) siguen funcionando igual que antes: para actualizarlos hay que
reemplazar el `.xlsx` correspondiente manteniendo el mismo nombre de archivo.

## Probar en local

Como los cotizadores leen archivos (`.xlsx` / `.json`) con `fetch()`, hace
falta un servidor HTTP — abrir los `.html` directo desde el Finder no
funciona (por CORS). Desde la carpeta del proyecto:

```bash
python3 -m http.server 8811
```

y abrir `http://localhost:8811` en el navegador.
