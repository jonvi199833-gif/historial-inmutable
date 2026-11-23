const fila = document.getElementById("fila-cadena");
const buscador = document.getElementById("buscador");
const detalle = document.getElementById("contenido-detalle");

function linea(etiqueta, valor, clase) {
    const p = document.createElement("p");
    if (clase) { p.className = clase; }
    const fuerte = document.createElement("strong");
    fuerte.textContent = etiqueta + " ";
    p.appendChild(fuerte);
    p.appendChild(document.createTextNode(valor));
    return p;
}

function mostrarDetalle(b) {
    detalle.innerHTML = "";
    detalle.append(
        linea("Índice:", b.indice),
        linea("Fecha:", b.fecha),
        linea("Paciente:", b.paciente),
        linea("Diagnóstico:", b.diagnostico),
        linea("Tratamiento:", b.tratamiento),
        linea("Hash anterior:", b.hash_anterior, "hash"),
        linea("Hash propio:", b.hash, "hash")
    );
}

function renderizar() {
    const filtro = buscador.value.trim().toLowerCase();
    fila.innerHTML = "";
    let mostrados = 0;

    cadena.forEach(function (b, i) {
        if (filtro !== "" && !b.paciente.toLowerCase().includes(filtro)) { return; }
        mostrados++;

        const tarjeta = document.createElement("div");
        tarjeta.className = b.danado ? "bloque bloque-rojo" : "bloque bloque-verde";

        const estado = document.createElement("div");
        estado.className = "estado";
        estado.textContent = b.danado ? "ALTERADO / COMPROMETIDO" : "VÁLIDO";

        const titulo = document.createElement("h3");
        titulo.textContent = "Bloque #" + b.indice;

        tarjeta.append(
            estado,
            titulo,
            linea("Fecha:", b.fecha),
            linea("Paciente:", b.paciente),
            linea("Diagnóstico:", b.diagnostico),
            linea("Tratamiento:", b.tratamiento),
            linea("Hash:", b.hash.slice(0, 16) + "...", "hash"),
            linea("Prev:", b.hash_anterior.slice(0, 16) + "...", "hash")
        );
        tarjeta.onclick = function () { mostrarDetalle(b); };
        fila.appendChild(tarjeta);

        if (filtro === "" && i < cadena.length - 1) {
            const flecha = document.createElement("div");
            flecha.className = "flecha";
            flecha.textContent = "→";
            fila.appendChild(flecha);
        }
    });

    if (mostrados === 0) { fila.textContent = "No hay bloques que coincidan."; }
}

function mostrarEstado() {
    const banner = document.getElementById("estado");
    if (danados.length === 0) {
        banner.textContent = "Cadena intacta: todos los bloques son válidos.";
        banner.classList.remove("roto");
    } else {
        banner.textContent = "¡ALERTA! Bloques dañados o comprometidos: " + danados.join(", ");
        banner.classList.add("roto");
    }
}

// ---------- Agregar consultas desde la página ----------
const selectorExcel = document.getElementById("archivo-excel");
const botonDescargar = document.getElementById("boton-descargar");
const mensajeImportacion = document.getElementById("mensaje-importacion");

function fechaActual() {
    const ahora = new Date();
    const dos = function (n) { return String(n).padStart(2, "0"); };
    return ahora.getFullYear() + "-" + dos(ahora.getMonth() + 1) + "-" + dos(ahora.getDate()) + " " +
           dos(ahora.getHours()) + ":" + dos(ahora.getMinutes()) + ":" + dos(ahora.getSeconds());
}

// Escribe un valor igual que json.dumps de Python, para que los hashes coincidan
function textoPython(valor) {
    if (typeof valor === "number") { return String(valor); }
    return JSON.stringify(valor).replace(/[\u0080-\uffff]/g, function (c) {
        return "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0");
    });
}

async function calcularHash(bloque) {
    const claves = Object.keys(bloque)
        .filter(function (k) { return k !== "hash" && k !== "danado"; })
        .sort();
    const partes = claves.map(function (k) { return textoPython(k) + ": " + textoPython(bloque[k]); });
    const texto = "{" + partes.join(", ") + "}";
    const resumen = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(resumen))
        .map(function (b) { return b.toString(16).padStart(2, "0"); })
        .join("");
}

function celda(fila, posicion) {
    const valor = fila[posicion];
    return (valor === undefined || valor === null) ? "" : String(valor).trim();
}

async function agregarBloqueNuevo(paciente, diagnostico, tratamiento) {
    const ultimo = cadena[cadena.length - 1];
    const bloque = {
        indice: ultimo.indice + 1,
        fecha: fechaActual(),
        paciente: paciente,
        diagnostico: diagnostico,
        tratamiento: tratamiento || "No especificado",
        hash_anterior: ultimo.hash,
        danado: danados.length > 0
    };
    bloque.hash = await calcularHash(bloque);
    cadena.push(bloque);
    botonDescargar.disabled = false;
}

async function importarExcel(archivo) {
    if (typeof XLSX === "undefined") {
        mensajeImportacion.textContent = "No cargó la librería de Excel (revisa tu conexión a internet).";
        return;
    }
    try {
        const contenido = await archivo.arrayBuffer();
        const libro = XLSX.read(contenido, { type: "array" });
        const hoja = libro.Sheets[libro.SheetNames[0]];
        const filas = XLSX.utils.sheet_to_json(hoja, { header: 1, defval: "" });

        let agregados = 0;
        const omitidas = [];
        for (let i = 1; i < filas.length; i++) {
            const paciente = celda(filas[i], 0);
            const diagnostico = celda(filas[i], 1);
            const tratamiento = celda(filas[i], 2);

            if (paciente === "" && diagnostico === "" && tratamiento === "") { continue; }
            if (paciente === "" || diagnostico === "") {
                omitidas.push(i + 1);
                continue;
            }

            await agregarBloqueNuevo(paciente, diagnostico, tratamiento);
            agregados++;
        }

        renderizar();
        let mensaje = agregados + " consultas importadas.";
        if (omitidas.length > 0) { mensaje += " Filas omitidas (faltan datos): " + omitidas.join(", ") + "."; }
        if (agregados > 0) {
            mensaje += " Pulsa «Descargar cadena.json» para guardarlas.";
            botonDescargar.disabled = false;
        }
        mensajeImportacion.textContent = mensaje;
    } catch (error) {
        mensajeImportacion.textContent = "No se pudo leer el archivo: " + error.message;
    }
}

function descargarCadena() {
    const limpia = cadena.map(function (b) {
        const copia = Object.assign({}, b);
        delete copia.danado;
        return copia;
    });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([JSON.stringify(limpia, null, 2)], { type: "application/json" }));
    enlace.download = "cadena.json";
    enlace.click();
}

const campoPaciente = document.getElementById("nuevo-paciente");
const campoDiagnostico = document.getElementById("nuevo-diagnostico");
const campoTratamiento = document.getElementById("nuevo-tratamiento");
const botonAgregar = document.getElementById("boton-agregar");

async function agregarDesdeFormulario() {
    const paciente = campoPaciente.value.trim();
    const diagnostico = campoDiagnostico.value.trim();
    const tratamiento = campoTratamiento.value.trim();

    if (paciente === "" || diagnostico === "") {
        mensajeImportacion.textContent = "Completa el paciente y el diagnóstico.";
        return;
    }

    await agregarBloqueNuevo(paciente, diagnostico, tratamiento);
    campoPaciente.value = "";
    campoDiagnostico.value = "";
    campoTratamiento.value = "";
    renderizar();
    mensajeImportacion.textContent = "Consulta agregada como bloque #" + cadena[cadena.length - 1].indice +
        ". Pulsa «Descargar cadena.json» para guardarla.";
}

selectorExcel.addEventListener("change", function () {
    if (selectorExcel.files.length > 0) {
        importarExcel(selectorExcel.files[0]);
        selectorExcel.value = "";
    }
});
botonDescargar.addEventListener("click", descargarCadena);
botonAgregar.addEventListener("click", agregarDesdeFormulario);
[campoPaciente, campoDiagnostico, campoTratamiento].forEach(function (campo) {
    campo.addEventListener("keydown", function (evento) {
        if (evento.key === "Enter") { agregarDesdeFormulario(); }
    });
});

buscador.addEventListener("input", renderizar);
mostrarEstado();
renderizar();