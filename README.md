# Cotizadores ControlAgro

Sitio estático (sin backend) con 4 cotizadores, pensado para publicarse en GitHub Pages.

## Estructura

- `index.html` — página de inicio con acceso a los 4 cotizadores.
- `styles.css` — diseño compartido por todas las páginas.
- `compartir.js` — lógica común de "Compartir por WhatsApp" (captura de pantalla + descarga).
- `cotizador1.html` / `script1.js` — **Monitores de siembra**. Lee `data/monitores-siembra.json`.
- `cotizador2.html` / `script2.js` — **Pilotos INTEGRA 6000**. Lee `data/pilotos-integra-6000.json`.
- `cotizador3.html` / `script3.js` — **Cortes por sección**. Lee `data/cortes-por-seccion.json`.
- `cotizador4.html` / `script4.js` — **Cortes surco por surco**. Lee `data/cortes-surco.json`.

Ningún cotizador lee Excel ni PDF directamente en el navegador: todos leen un
`.json` propio dentro de `data/`. Esos `.json` se generan con los scripts de
`scripts/` a partir del documento fuente (Excel o PDF) que te vaya llegando
de cada lista de precios. Así, si el día de mañana cambia el formato del
documento fuente, sólo hay que tocar el script de conversión — el resto del
sitio no cambia.

## Actualizar precios

### Pilotos INTEGRA 6000 (fuente: PDF)

Los precios salen de `data/pilotos-integra-6000.json`, generado a partir del
PDF oficial de lista de precios ("PILOTOS ControlAgro INTEGRA 6000").

```bash
python3 scripts/generar_precios_pilotos.py "/ruta/al/LP XXXX PILOTOS INTEGRA 6000.pdf"
```

El script imprime en pantalla un resumen de todos los ítems y precios que
detectó. **Revisalo contra el PDF** antes de subir el cambio (por si algún
ítem nuevo no fue reconocido — en ese caso aparece igual, con un nombre
genérico, para que no se pierda ningún precio silenciosamente).

### Monitores de siembra / Cortes por sección / Cortes surco por surco (fuente: Excel, por ahora)

Estos tres todavía se actualizan desde un Excel (no tenemos el PDF de lista
de precios para ellos todavía). El Excel debe tener las mismas columnas que
ya usa cada cotizador (`Modelo`, `Sensores` o `Cantidad de Embragues`,
`Precio`) en la primera hoja.

```bash
python3 scripts/generar_precios_excel.py "LP XXXX MONITOR DE SIEMBRA ControlAgro.xlsx" data/monitores-siembra.json
python3 scripts/generar_precios_excel.py "LP XXXX CORTES x SECCION INTEGRA 6000.xlsx" data/cortes-por-seccion.json
python3 scripts/generar_precios_excel.py "LP XXXX Cortes x SURCO INTEGRA 6000.xlsx" data/cortes-surco.json
```

El script imprime cuántas filas leyó y las columnas detectadas — revisalo
contra el Excel antes de subir el `.json` generado. El día que consigas el
PDF de lista de precios para alguno de estos tres, se puede migrar ese
cotizador al mismo esquema que Pilotos (script de conversión desde PDF en
vez de Excel), sin tocar el HTML/JS del cotizador.

### En los tres casos

Una vez generado el `.json`, subilo a GitHub junto con el resto del sitio
(no hace falta editar ningún otro archivo — GitHub Pages lo sirve como un
archivo estático más). El Excel o PDF de origen no necesita subirse al
repositorio; solo el `.json` resultante.

### La primera vez, instalá las dependencias de los scripts

```bash
pip3 install -r scripts/requirements.txt
```

## Probar en local

Como los cotizadores leen los `.json` con `fetch()`, hace falta un servidor
HTTP — abrir los `.html` directo desde el Finder no funciona (por CORS).
Desde la carpeta del proyecto:

```bash
python3 -m http.server 8811
```

y abrir `http://localhost:8811` en el navegador.
