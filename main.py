import almacenamiento
import visual
from cadena import (crear_cadena_nueva, agregar_bloque, validar_cadena,
                    buscar_por_paciente, alterar_bloque)


def mostrar_menu():
    print("\n=== HISTORIAL CLÍNICO INMUTABLE ===")
    print("1. Agregar consulta")
    print("2. Ver cadena")
    print("3. Buscar por paciente")
    print("4. Recargar archivo, validar y actualizar datos")
    print("5. Simular manipulación de un bloque")
    print("6. Reiniciar cadena")
    print("0. Salir")


def actualizar_pagina(cadena):
    danados = validar_cadena(cadena)
    visual.generar_datos(cadena, danados)
    if danados:
        print("¡ALERTA! Bloques dañados:", danados)
    else:
        print("Cadena intacta.")
    print("Datos actualizados: abre (o recarga) web/index.html en tu navegador.")


def imprimir_bloques(bloques):
    if not bloques:
        print("No se encontraron bloques.")
    for b in bloques:
        print(f"#{b['indice']} | {b['fecha']} | {b['paciente']} | "
              f"{b['diagnostico']} | {b['tratamiento']} | {b['hash'][:12]}...")


def main():
    cadena = almacenamiento.cargar()
    if cadena is None:
        cadena = crear_cadena_nueva()
        almacenamiento.guardar(cadena)
    actualizar_pagina(cadena)

    while True:
        mostrar_menu()
        opcion = input("Elige una opción: ").strip()

        match opcion:
            case "1":
                paciente = input("Paciente: ").strip()
                diagnostico = input("Diagnóstico: ").strip()
                tratamiento = input("Médico / Tratamiento: ").strip() or "No especificado"
                if paciente == "" or diagnostico == "":
                    print("El paciente y el diagnóstico son obligatorios.")
                else:
                    agregar_bloque(cadena, paciente, diagnostico, tratamiento)
                    almacenamiento.guardar(cadena)
                    actualizar_pagina(cadena)
            case "2":
                imprimir_bloques(cadena)
            case "3":
                nombre = input("Nombre a buscar: ")
                imprimir_bloques(buscar_por_paciente(cadena, nombre))
            case "4":
                recargada = almacenamiento.cargar()
                if recargada is None:
                    print("No se pudo leer el archivo.")
                else:
                    cadena = recargada
                    actualizar_pagina(cadena)
            case "5":
                try:
                    posicion = int(input("Número del bloque a alterar: "))
                    if posicion < 0 or posicion >= len(cadena):
                        print("Ese bloque no existe.")
                    else:
                        nuevo = input("Nuevo diagnóstico: ").strip()
                        alterar_bloque(cadena, posicion, nuevo)
                        almacenamiento.guardar(cadena)
                        actualizar_pagina(cadena)
                except ValueError:
                    print("Escribe un número válido.")
            case "6":
                if input("¿Seguro? (s/n): ").strip().lower() == "s":
                    cadena = crear_cadena_nueva()
                    almacenamiento.guardar(cadena)
                    actualizar_pagina(cadena)
            case "0":
                print("Hasta luego.")
                break
            case _:
                print("Opción no válida.")


main()