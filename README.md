# Historial Clínico Inmutable

Proyecto de fin de trimestre. Simula una cadena de bloques (blockchain) donde cada
consulta médica se enlaza con la anterior mediante un hash SHA-256: si alguien
altera un registro antiguo, el sistema lo detecta y marca ese bloque y los siguientes.

> Todos los datos son ficticios.

## Tecnologías
Python · HTML · CSS · JavaScript · JSON · Git/GitHub

## Cómo ejecutarlo
Requiere Python 3.10 o superior.

1. Descarga o clona el repositorio.
2. Abre una terminal en la carpeta del proyecto y ejecuta:
   `python3 main.py`
3. Abre `web/index.html` en el navegador (recárgalo con F5 tras cada cambio).

## Estructura
- `main.py`: menú de consola.
- `cadena.py`: bloques, hashes y validación.
- `almacenamiento.py`: lectura y escritura de `datos/cadena.json`.
- `visual.py`: genera `web/datos.js` para la página.
- `web/`: página (HTML, CSS y JS).

## Uso
- **Desde la consola:** agregar consultas, buscar pacientes, validar la cadena
  y simular la manipulación de un bloque.
- **Desde la página:** ver la cadena, buscar por paciente, agregar consultas
  con un formulario o cargarlas desde un Excel (columnas: Paciente, Diagnóstico,
  Tratamiento). Luego se pulsa «Descargar cadena.json» y se reemplaza el archivo
  en `datos/`. La carga de Excel necesita conexión a internet.

## Demostración
1. Altera a mano un diagnóstico en `datos/cadena.json`.
2. Ejecuta `python3 main.py` y recarga la página.
3. El bloque alterado y los siguientes aparecen en rojo.

## Autor
Tu nombre · Tu curso · Tu instituto