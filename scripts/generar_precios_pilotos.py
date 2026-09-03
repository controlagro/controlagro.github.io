#!/usr/bin/env python3
"""
Genera data/pilotos-integra-6000.json a partir de la lista de precios en PDF
de "PILOTOS ControlAgro INTEGRA 6000".

Uso:
    python3 scripts/generar_precios_pilotos.py "/ruta/a/LP 0626 PILOTOS INTEGRA 6000.pdf"

Cada vez que llegue una lista de precios nueva, corré este comando apuntando
al PDF nuevo. El script reemplaza data/pilotos-integra-6000.json y muestra
en pantalla un resumen para que puedas verificar los precios contra el PDF
antes de subir el cambio a GitHub.

No requiere tocar ningún Excel a mano.
"""
import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit(
        "Falta la librería 'pdfplumber'. Instalala una sola vez con:\n"
        "    pip3 install -r scripts/requirements.txt\n"
    )

REPO_ROOT = Path(__file__).resolve().parent.parent
OUTPUT_PATH = REPO_ROOT / "data" / "pilotos-integra-6000.json"

USD_RE = re.compile(r"USD\s*[\d\s.,]+")
IVA_RE = re.compile(r"CON IVA\s*([\d,]+)\s*%")
LISTA_RE = re.compile(r"Lista\s*(\d+)")
VIGENCIA_RE = re.compile(r"VALIDEZ HASTA EL ([0-9A-ZÁÉÍÓÚ ]+?\d{4})")

SECTION_KEYWORDS = [
    (re.compile(r"BASE PORTATIL PARA ANTENA RTK|BASE PORTATIL"), "Piloto con antena RTK (base portátil)"),
    (re.compile(r"BANDERILLERO"), "Banderillero INTEGRA 6000"),
    (re.compile(r"SEÑAL TERRESTAR|SEÑAL TERRASTAR|SEÑAL TERRESTAR C"), "Costo de señal Terrastar C"),
    (re.compile(r"ANTENA NOVATEL"), "Piloto con antena Novatel"),
    (re.compile(r"COSTO DE\s*SEÑAL"), "Costo de señal (Ultra)"),
    (re.compile(r"REPUESTOS"), "Repuestos"),
    (re.compile(r"GIRO en CABECERA.*PRECISIO-ULTRA|PRECISIO-ULTRA"), "Piloto con antena ControlAgro Ultra"),
]

# Orden final de las secciones en el desplegable: primero los pilotos
# (equipos), después los abonos de señal, y por último los repuestos —
# a pedido del cliente. Los títulos de abonos/repuestos ya nombran la
# antena a la que corresponden (Ultra / Terrastar) para que se entienda
# la relación aunque no estén pegados al piloto correspondiente.
ORDEN_SECCIONES = [
    "Piloto con antena ControlAgro Ultra",
    "Piloto con antena RTK (base portátil)",
    "Banderillero INTEGRA 6000",
    "Piloto con antena Novatel",
    "Costo de señal (Ultra)",
    "Costo de señal Terrastar C",
    "Repuestos",
]

# claves conocidas -> nombre corto prolijo para el desplegable
CLAVE_A_NOMBRE = {
    "precisio_ultra_equipo_anual": "Antena ControlAgro Ultra (equipo + abono anual, 2,5 cm)",
    "senal_precisio_ultra_anual": "Abono anual señal Ultra (2,5 cm)",
    "kit_antena_precisio_ultra": "Kit antena Ultra con abono anual (2,5 cm)",
    "instalacion_nordian": "Instalación eléctrica antena GPS Nordian a RS-232",
    "instalacion_adaptador_rs232": "Instalación eléctrica adaptador RS-232",
    "rtk_base_portatil": "Antena con base portátil RTK (2,5 cm)",
    "survey_sin_base_rtk": "Antena Survey L1, sin base RTK (15 cm)",
    "banderillero": "Equipo Banderillero INTEGRA 6000",
    "kit_cables_banderillero": "Kit adicional de cables piloto INTEGRA 6000",
    "kit_traslado": "Kit para trasladar el piloto a un segundo equipo",
    "novatel_sin_activacion": "Antena Novatel L1-L2, señal libre (15 cm)",
    "novatel_activacion_sin_abono": "Antena Novatel L1-L2, activación sin abono (15 cm)",
    "novatel_activacion_abono_trimestral": "Antena Novatel L1-L2, activación + abono trimestral (2,5 cm)",
    "novatel_activacion_abono_anual": "Antena Novatel L1-L2, activación + abono anual (2,5 cm)",
    "senal_terrastar_anual": "Abono anual señal Terrastar C Pro (2,5 cm)",
    "senal_terrastar_trimestral": "Abono trimestral señal Terrastar C Pro (2,5 cm)",
    "activacion_terrastar": "Activación antena Novatel para Terrastar C Pro (única vez)",
}

# reglas para derivar una clave estable a partir del texto de la descripción,
# evaluadas en orden (la primera que matchea gana)
CLAVE_RULES = [
    (re.compile(r"PRECISIO-ULTRA", re.I), lambda d: (
        "senal_precisio_ultra_anual" if d.upper().startswith("ABONO")
        else "precisio_ultra_equipo_anual" if "EQUIPO PILOTO" in d.upper()
        else "kit_antena_precisio_ultra" if "KIT ANTENA" in d.upper()
        else None
    )),
    (re.compile(r"NORDIAN", re.I), lambda d: "instalacion_nordian"),
    (re.compile(r"ADAPTADOR.*RS-232|RS-232.*ADAPTADOR", re.I), lambda d: "instalacion_adaptador_rs232"),
    (re.compile(r"BASE PORTATIL RTK|BASE PORTATIL", re.I), lambda d: "rtk_base_portatil"),
    (re.compile(r"SURVEY L1", re.I), lambda d: "survey_sin_base_rtk"),
    (re.compile(r"BANDERILLERO", re.I), lambda d: (
        "banderillero" if d.upper().startswith("EQUIPO") else None
    )),
    (re.compile(r"CABLES PILOTO", re.I), lambda d: "kit_cables_banderillero"),
    (re.compile(r"TRASLADAR EL PILOTO", re.I), lambda d: "kit_traslado"),
    # TERRASTAR va antes que NOVATEL: la "activación de antena Novatel para
    # Terrastar" menciona la palabra NOVATEL pero es un ítem de Terrastar.
    (re.compile(r"TERRASTAR", re.I), lambda d: (
        "activacion_terrastar" if d.upper().startswith("ACTIVACION")
        else "senal_terrastar_anual" if "ANUAL" in d.upper()
        else "senal_terrastar_trimestral" if "TRIMESTRAL" in d.upper()
        else None
    )),
    (re.compile(r"NOVATEL", re.I), lambda d: (
        "novatel_activacion_abono_anual" if "ACTIVACION" in d.upper() and "ANUAL" in d.upper()
        else "novatel_activacion_abono_trimestral" if "ACTIVACION" in d.upper() and "TRIMESTRAL" in d.upper()
        else "novatel_activacion_sin_abono" if "ACTIVACION" in d.upper() and "SIN ABONO" in d.upper()
        else "novatel_sin_activacion"
    )),
]


def clean_text(cell):
    if cell is None:
        return ""
    return re.sub(r"\s+", " ", cell.replace("\n", " ")).strip()


def quitar_precisio(texto):
    """El cliente pidió sacar la palabra 'Precisio' de todo lo visible en el
    cotizador (el PDF la usa como parte de 'PRECISIO-ULTRA'). Sólo saca ese
    prefijo con el guion, así no toca la palabra 'PRECISION' (de precisión
    del GPS) que aparece en otras descripciones."""
    return re.sub(r"PRECISIO-", "", texto, flags=re.I)


def parse_price(cell):
    """'USD 1 .655' / 'USD 665,50' / 'USD 9.313' -> float"""
    s = cell.upper().replace("USD", "").strip()
    s = re.sub(r"\s+", "", s)
    if "," in s:
        entero, decimal = s.rsplit(",", 1)
        entero = entero.replace(".", "")
        return float(f"{entero}.{decimal}")
    return float(s.replace(".", ""))


def looks_like_header_row(row):
    joined = " ".join(clean_text(c) for c in row if c)
    return "NETO" in joined.upper() and "CON IVA" in joined.upper()


def match_section(joined_upper):
    for pattern, nice_name in SECTION_KEYWORDS:
        if pattern.search(joined_upper):
            return nice_name
    return None


def derive_clave(descripcion):
    for pattern, fn in CLAVE_RULES:
        if pattern.search(descripcion):
            clave = fn(descripcion)
            if clave:
                return clave
    return None


def slugify_fallback(descripcion, seen):
    base = re.sub(r"[^a-z0-9]+", "_", descripcion.lower()).strip("_")[:40]
    slug = base or "item"
    i = 2
    while slug in seen:
        slug = f"{base}_{i}"
        i += 1
    return slug


def extract_items(pdf_path):
    secciones = {}  # nombre_seccion -> list[item]
    orden_secciones = []
    current_section = "General"
    current_iva = "10,5%"
    lista_num = None
    vigencia = None
    claves_usadas = set()

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            texto_pagina = page.extract_text() or ""
            if lista_num is None:
                m = LISTA_RE.search(texto_pagina)
                if m:
                    lista_num = m.group(1)
            if vigencia is None:
                m = VIGENCIA_RE.search(texto_pagina)
                if m:
                    vigencia = clean_text(m.group(1))

            for table in page.extract_tables():
                for row in table:
                    cells = [clean_text(c) if c else "" for c in row]
                    joined = " ".join(c for c in cells if c)
                    joined_upper = joined.upper()

                    if not joined.strip():
                        continue

                    m_iva = IVA_RE.search(joined_upper)
                    es_nota = "FORMAS DE PAGO" in joined_upper or "FINANCIACIÓN" in joined_upper

                    if looks_like_header_row(row):
                        # algunas filas de encabezado (ej. "DETALLE del
                        # BANDERILLERO INTEGRA 6000") también anuncian un
                        # cambio de sección, además de fijar el IVA vigente.
                        if m_iva:
                            current_iva = m_iva.group(1) + "%"
                        seccion = match_section(joined_upper)
                        if seccion and not es_nota:
                            current_section = seccion
                        continue

                    usd_cells = [c for c in cells if USD_RE.search(c)]

                    if not usd_cells:
                        # posible encabezado de sección
                        seccion = match_section(joined_upper)
                        if seccion and not es_nota:
                            current_section = seccion
                        continue

                    # fila de ítem con precios
                    descripcion = cells[0] or (cells[1] if len(cells) > 1 else "")
                    if not descripcion:
                        continue

                    precios_con_iva = []
                    for c in usd_cells:
                        try:
                            precios_con_iva.append(parse_price(c))
                        except ValueError:
                            pass

                    # las columnas vienen en pares (NETO, CON IVA); nos quedamos
                    # con el segundo de cada par (el precio final al cliente)
                    con_iva = precios_con_iva[1::2]
                    if not con_iva:
                        continue

                    etiquetas = ["contado", "dias180", "dias360"]
                    precios = {
                        etiquetas[i]: con_iva[i]
                        for i in range(min(len(con_iva), len(etiquetas)))
                    }

                    # derive_clave necesita el texto tal cual sale del PDF
                    # (matchea "PRECISIO-ULTRA" literal); la limpieza de la
                    # palabra "Precisio" se aplica recién para lo que se
                    # muestra en el cotizador.
                    clave = derive_clave(descripcion) or slugify_fallback(descripcion, claves_usadas)
                    claves_usadas.add(clave)
                    descripcion_limpia = quitar_precisio(descripcion)
                    nombre = CLAVE_A_NOMBRE.get(clave, descripcion_limpia[:70])

                    item = {
                        "clave": clave,
                        "nombre": nombre,
                        "descripcion": descripcion_limpia,
                        "iva": current_iva,
                        "precios": precios,
                    }

                    if current_section not in secciones:
                        secciones[current_section] = []
                        orden_secciones.append(current_section)
                    secciones[current_section].append(item)

    # Orden fijo (pilotos, después abonos, después repuestos) en vez del
    # orden en que aparecen en el PDF. Si el PDF trae alguna sección que no
    # está en ORDEN_SECCIONES (p.ej. un producto nuevo), se agrega al final
    # en vez de perderse, para no descartar precios silenciosamente.
    titulos_ordenados = [t for t in ORDEN_SECCIONES if t in secciones]
    titulos_ordenados += [t for t in orden_secciones if t not in ORDEN_SECCIONES]

    return {
        "lista": lista_num,
        "vigenciaHasta": vigencia,
        "moneda": "USD",
        "secciones": [
            {"titulo": nombre_seccion, "items": secciones[nombre_seccion]}
            for nombre_seccion in titulos_ordenados
        ],
    }


def imprimir_resumen(data):
    print(f"Lista {data['lista']} — vigente hasta {data['vigenciaHasta']}\n")
    total_items = 0
    for seccion in data["secciones"]:
        print(f"## {seccion['titulo']}")
        for item in seccion["items"]:
            total_items += 1
            precios = item["precios"]
            partes = []
            if "contado" in precios:
                partes.append(f"Contado USD {precios['contado']:,.2f}")
            if "dias180" in precios:
                partes.append(f"180d USD {precios['dias180']:,.2f}")
            if "dias360" in precios:
                partes.append(f"360d USD {precios['dias360']:,.2f}")
            print(f"  - [{item['clave']}] {item['nombre']}")
            print(f"      {' | '.join(partes)}  (IVA {item['iva']})")
        print()
    print(f"Total de ítems detectados: {total_items}")


def main():
    if len(sys.argv) != 2:
        sys.exit("Uso: python3 scripts/generar_precios_pilotos.py <ruta-al-pdf>")

    pdf_path = Path(sys.argv[1]).expanduser()
    if not pdf_path.exists():
        sys.exit(f"No se encontró el archivo: {pdf_path}")

    data = extract_items(pdf_path)

    if not data["secciones"]:
        sys.exit("No se detectó ningún ítem con precio. Revisá el PDF manualmente antes de continuar.")

    imprimir_resumen(data)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✅ Escrito: {OUTPUT_PATH.relative_to(REPO_ROOT)}")
    print("Revisá el resumen de arriba contra el PDF y después subí el cambio a GitHub.")


if __name__ == "__main__":
    main()
