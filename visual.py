import json
import os


def generar_datos(cadena, danados):
    datos = []
    for bloque in cadena:
        copia = dict(bloque)
        copia["danado"] = bloque["indice"] in danados
        datos.append(copia)

    os.makedirs("web", exist_ok=True)
    with open("web/datos.js", "w", encoding="utf-8") as archivo:
        archivo.write("const cadena = " + json.dumps(datos) + ";\n")
        archivo.write("const danados = " + json.dumps(danados) + ";\n")