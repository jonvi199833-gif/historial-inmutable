import hashlib
import json
from datetime import datetime


def calcular_hash(bloque):
    datos = {clave: valor for clave, valor in bloque.items() if clave != "hash"}
    texto = json.dumps(datos, sort_keys=True)
    return hashlib.sha256(texto.encode()).hexdigest()


def crear_bloque(indice, paciente, diagnostico, tratamiento, hash_anterior):
    bloque = {
        "indice": indice,
        "fecha": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "paciente": paciente,
        "diagnostico": diagnostico,
        "tratamiento": tratamiento,
        "hash_anterior": hash_anterior,
    }
    bloque["hash"] = calcular_hash(bloque)
    return bloque


def crear_cadena_nueva():
    return [crear_bloque(0, "Registro inicial", "Bloque génesis", "-", "0")]


def agregar_bloque(cadena, paciente, diagnostico, tratamiento):
    ultimo = cadena[-1]
    nuevo = crear_bloque(ultimo["indice"] + 1, paciente, diagnostico,
                         tratamiento, ultimo["hash"])
    cadena.append(nuevo)


def validar_cadena(cadena):
    """Devuelve la lista de índices dañados (el bloque alterado y los siguientes)."""
    danados = []
    cadena_rota = False
    for i, bloque in enumerate(cadena):
        hash_ok = bloque["hash"] == calcular_hash(bloque)
        enlace_ok = True
        if i > 0:
            enlace_ok = bloque["hash_anterior"] == cadena[i - 1]["hash"]
        if not hash_ok or not enlace_ok:
            cadena_rota = True
        if cadena_rota:
            danados.append(bloque["indice"])
    return danados


def buscar_por_paciente(cadena, nombre):
    nombre = nombre.strip().lower()
    return [b for b in cadena if nombre in b["paciente"].lower()]


def alterar_bloque(cadena, posicion, nuevo_diagnostico):
    # A propósito NO recalculamos el hash: así la validación detecta la alteración
    cadena[posicion]["diagnostico"] = nuevo_diagnostico