import json
import os

RUTA = "datos/cadena.json"


def cargar():
    try:
        with open(RUTA, "r", encoding="utf-8") as archivo:
            return json.load(archivo)
    except FileNotFoundError:
        return None
    except json.JSONDecodeError:
        print("El archivo cadena.json está dañado o mal escrito.")
        return None


def guardar(cadena):
    os.makedirs("datos", exist_ok=True)
    with open(RUTA, "w", encoding="utf-8") as archivo:
        json.dump(cadena, archivo, ensure_ascii=False, indent=2)