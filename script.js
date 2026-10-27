/* =========================================================
   LÓGICA DE LA CALCULADORA DE IMPORTACIÓN

   Cómo funciona:
   1. El usuario completa los datos en index.html.
   2. Al presionar "Calcular" se ejecuta la función calcular().
   3. calcular() lee los valores, hace las cuentas y
      muestra el resultado con mostrarResultado().

   Para agregar un nuevo concepto (por ejemplo, otra tasa):
   - Agregá el campo en index.html (con un id nuevo).
   - Leelo en el PASO 1 de calcular().
   - Sumalo en el PASO 3 o 4, y agregalo a la lista del PASO 6.
   ========================================================= */


/* ---------- AYUDAS GENERALES ---------- */

// Devuelve el elemento HTML que tiene ese id.
function elemento(id) {
  return document.getElementById(id);
}

// Lee un campo numérico. Si está vacío o es inválido, devuelve 0.
function numero(id) {
  const valor = parseFloat(elemento(id).value);
  return isNaN(valor) ? 0 : valor;
}

// Da formato de dólares: "USD 1.234,56"
function formatoUsd(valor) {
  return "USD " + valor.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Da formato de pesos: "$ 1.234.567"
function formatoArs(valor) {
  return "$ " + valor.toLocaleString("es-AR", {
    maximumFractionDigits: 0
  });
}


/* ---------- CÁLCULO PRINCIPAL ---------- */

function calcular() {

  // PASO 1: leer los datos ingresados ------------------------
  const cantidad        = Math.max(numero("cantidad"), 1); // mínimo 1
  const precioUnitario  = numero("precio");
  const tipoCambio      = numero("tipoCambio");
  const fleteInternac   = numero("flete");

  // Porcentajes (se dividen por 100 para usarlos en las cuentas)
  const pctSeguro        = numero("seguro") / 100;
  const pctDie           = numero("die") / 100;
  const pctTasaEstad     = numero("tasaEstadistica") / 100;
  const pctIva           = numero("iva") / 100;
  const pctIvaAdicional  = numero("ivaAdicional") / 100;
  const pctGanancias     = numero("ganancias") / 100;
  const pctIngresosBrutos = numero("ingresosBrutos") / 100;

  // Gastos locales (en USD)
  const gastosLocales = numero("honorarios")
                      + numero("terminal")
                      + numero("fleteInterno")
                      + numero("otrosGastos");


  // PASO 2: valor de la mercadería (FOB, seguro y CIF) -------
  const fob    = precioUnitario * cantidad;
  const seguro = fob * pctSeguro;
  const cif    = fob + fleteInternac + seguro;


  // PASO 3: derechos y tasa (se calculan sobre el CIF) -------
  const die           = cif * pctDie;
  const tasaEstad     = cif * pctTasaEstad;


  // PASO 4: impuestos (se calculan sobre la base imponible) --
  // Base imponible = CIF + derecho de importación + tasa de estadística
  const baseImponible   = cif + die + tasaEstad;

  const iva             = baseImponible * pctIva;
  const ivaAdicional    = baseImponible * pctIvaAdicional;
  const ganancias       = baseImponible * pctGanancias;
  const ingresosBrutos  = baseImponible * pctIngresosBrutos;


  // PASO 5: totales ------------------------------------------
  const totalTributos = die + tasaEstad + iva + ivaAdicional
                      + ganancias + ingresosBrutos;

  const totalDesembolso = cif + totalTributos + gastosLocales;


  // PASO 6: armar la lista que se muestra en la tabla --------
  // Cada línea es: [nombre, monto, estilo]
  // El estilo es opcional: "subtotal" o "total" (ver style.css).
  const filas = [
    ["Valor FOB",                     fob],
    ["Flete internacional",           fleteInternac],
    ["Seguro",                        seguro],
    ["Valor CIF",                     cif, "subtotal"],

    ["Derecho de importación",        die],
    ["Tasa de estadística",           tasaEstad],
    ["IVA",                           iva],
    ["Percepción IVA adicional",      ivaAdicional],
    ["Percepción Ganancias",          ganancias],
    ["Percepción Ingresos Brutos",    ingresosBrutos],
    ["Total tributos",                totalTributos, "subtotal"],

    ["Gastos locales",                gastosLocales],
    ["Total a desembolsar",           totalDesembolso, "total"]
  ];

  mostrarResultado(filas, totalDesembolso, cantidad, tipoCambio);
}


/* ---------- MOSTRAR EL RESULTADO EN PANTALLA ---------- */

function mostrarResultado(filas, totalDesembolso, cantidad, tipoCambio) {

  // Tabla: una fila <tr> por cada línea de la lista
  let html = "";
  for (const fila of filas) {
    const nombre = fila[0];
    const monto  = fila[1];
    const estilo = fila[2] || "";   // "" si no tiene estilo especial
    html += `<tr class="${estilo}">
               <td>${nombre}</td>
               <td>${formatoUsd(monto)}</td>
             </tr>`;
  }
  elemento("tablaResultado").innerHTML = html;

  // Indicadores grandes
  const costoUnitarioUsd = totalDesembolso / cantidad;

  elemento("costoUnitarioUsd").textContent = formatoUsd(costoUnitarioUsd);
  elemento("costoUnitarioArs").textContent = formatoArs(costoUnitarioUsd * tipoCambio);
  elemento("totalUsd").textContent         = formatoUsd(totalDesembolso);
  elemento("totalArs").textContent         = formatoArs(totalDesembolso * tipoCambio);
}


/* ---------- CONECTAR EL BOTÓN ---------- */

// Cuando se hace clic en "Calcular", se ejecuta calcular()
elemento("btnCalcular").addEventListener("click", calcular);
