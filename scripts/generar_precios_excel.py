#!/usr/bin/env python3
"""
Convierte una lista de precios en Excel (.xlsx) a JSON plano, para que los
cotizadores dejen de leer el Excel directamente en el navegador.

Uso:
    python3 scripts/generar_precios_excel.py "archivo.xlsx" data/salida.json

Lee la primera hoja del Excel tal cual, con los mismos nombres de columna
que ya usa cada cotizador ("Modelo", "Sensores", "Cantidad de Embragues",
"Precio"), y escribe un JSON con esa lista de filas.

Cada vez que actualices un Excel de precios (Monitores de siembra, Cortes
por sección o Cortes surco por surco), corré este comando apuntando al
archivo nuevo y subí el .json resultante a GitHub. No hace falta tocar
ningún otro archivo.
"""
import json
import math
import sys
from pathlib import Path

try:
    import pandas as pd
except ImportError:
    sys.exit(
        "Faltan las librerías 'pandas' y 'openpyxl'. Instalalas una sola vez con:\n"
        "    pip3 install -r scripts/requirements.txt\n"
    )


def main():
    if len(sys.argv) != 3:
        sys.exit("Uso: python3 scripts/generar_precios_excel.py <archivo.xlsx> <salida.json>")

    entrada = Path(sys.argv[1]).expanduser()
    salida = Path(sys.argv[2]).expanduser()

    if not entrada.exists():
        sys.exit(f"No se encontró el archivo: {entrada}")

    df = pd.read_excel(entrada, sheet_name=0)
    filas = df.to_dict("records")

    # pandas vuelve a convertir None en NaN dentro de columnas float, así que
    # limpiamos los NaN manualmente para que el JSON resultante sea válido
    # (NaN no es un token JSON válido, aunque json.dumps lo escriba igual).
    for fila in filas:
        for clave, valor in fila.items():
            if isinstance(valor, float) and math.isnan(valor):
                fila[clave] = None

    if not filas:
        sys.exit("El Excel no tiene filas de datos. Revisalo antes de continuar.")

    salida.parent.mkdir(parents=True, exist_ok=True)
    salida.write_text(json.dumps(filas, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"{len(filas)} filas leídas de '{entrada.name}'")
    print(f"Columnas: {', '.join(df.columns)}")
    print(f"✅ Escrito: {salida}")
    print("Revisá algunos valores contra el Excel y después subí el cambio a GitHub.")


if __name__ == "__main__":
    main()
