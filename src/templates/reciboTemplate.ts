export function generarReciboHTML(data: {
  nombre: string;
  telefono: string;
  email: string;
  fecha: string;
  descripcion: string;
  items: { descripcion: string; cantidad: number; precioUnit: number }[];
  total: number;
  numeroRecibo?: string;
  direccionCliente?: string;
  documentoIdentidadCliente?: string;
  logoBase64?: string;
  marcaModelo?: string;
  matricula?: string;
}) {
  const {
    nombre,
    telefono,
    email,
    fecha,
    descripcion,
    items,
    total,
    numeroRecibo = "",
    direccionCliente = "",
    documentoIdentidadCliente = "",
    logoBase64 = "",
    marcaModelo = "",
    matricula = "",
  } = data;

  // Datos fijos de la empresa
  const empresa = {
    nombre: "AHUMAGLASS",
    propietario: "ELADIO J. HERNANDEZ C.",
    cif: "15475991G",
    direccion: "C/ ALVAREZ SOTOMAYOR 21 BJ DERECHO",
    ciudad: "VALENCIA / CP 46017",
    telefonos: "641330412 / 960540721",
    email: "contacto@ahumaglass.es",
  };

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Recibo</title>
    <style>
      @import url('https://fonts.googleapis.com/css?family=Roboto:400,700&display=swap');
      html, body { height: 100%; margin: 0; padding: 0; }
      body {
        font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        color: #222;
        background: #fff;
        margin: 0;
        padding: 0;
      }
      .factura-a4 {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 20mm;
        box-sizing: border-box;
        background: #fff;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .encabezado {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 32px;
      }
      .empresa-info {
        width: 55%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding-top: 0;
      }
      .empresa-logo {
        width: 240px;
        height: 180px;
        object-fit: contain;
        margin-bottom: 8px;
        margin-left: 0;
        margin-top: 0;
        align-self: flex-start;
      }
      .empresa-datos {
        font-size: 15px;
        margin-top: 8px;
        line-height: 1.5;
      }
      .recibo-info {
        width: 45%;
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .recibo-titulo {
        font-size: 2.2rem;
        font-weight: 700;
        color: #888;
        letter-spacing: 2px;
        margin-bottom: 24px;
      }
      .recibo-campos {
        font-size: 15px;
        color: #222;
        margin-bottom: 2px;
        line-height: 1.5;
      }
      .tabla-servicios {
        width: 100%;
        border-collapse: collapse;
        margin-top: 24px;
        margin-bottom: 0;
      }
      .tabla-servicios th, .tabla-servicios td {
        border: 1px solid #ccc;
        padding: 8px 10px;
        font-size: 15px;
      }
      .tabla-servicios th {
        background: #f4f4f4;
        font-weight: 700;
        text-align: left;
        letter-spacing: 1px;
      }
      .tabla-servicios tr:nth-child(even) td { background: #f7f7f7; }
      .tabla-servicios tr:nth-child(odd) td { background: #fff; }
      .tabla-servicios td:last-child, .tabla-servicios th:last-child { text-align: right; }
      .totales {
        width: 100%;
        margin-top: 0;
        margin-bottom: 24px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }
      .totales-tabla {
        min-width: 320px;
        border-collapse: collapse;
        font-size: 15px;
      }
      .totales-tabla td {
        padding: 6px 12px;
        text-align: right;
      }
      .totales-tabla tr td:first-child {
        text-align: left;
        color: #666;
      }
      .totales-tabla tr.total td {
        font-weight: bold;
        font-size: 1.1em;
        color: #222;
        border-top: 2px solid #888;
      }
      .pie {
        font-size: 11px;
        color: #555;
        margin-top: 32px;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      .agradecimiento {
        text-align: center;
        font-size: 1.1em;
        color: #444;
        margin-top: 18px;
        font-weight: 500;
        letter-spacing: 1px;
      }
    </style>
  </head>
  <body>
    <div class="factura-a4">
      <!-- Encabezado visual -->
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
        <div style="flex: 1; min-width: 220px;">
          <!-- Logo y datos empresa -->
          <img src="${logoBase64}" alt="Logo" class="empresa-logo" />
          <div style="font-weight: bold; margin-bottom: 2px; margin-top: 8px;">${empresa.propietario}</div>
          <div style="font-size: 14px; color: #222;">CIF: ${empresa.cif}</div>
          <div style="font-size: 14px; color: #222;">${empresa.direccion}</div>
          <div style="font-size: 14px; color: #222;">${empresa.ciudad}</div>
          <div style="font-size: 14px; color: #222;">${empresa.telefonos}</div>
        </div>
        <div style="flex: 1; text-align: right; min-width: 320px;">
          <div style="font-size: 44px; font-weight: 700; color: #aaa; letter-spacing: 4px; margin-bottom: 12px;">RECIBO</div>
          <table style="width: 100%; max-width: 340px; margin-left: auto; border-collapse: separate; border-spacing: 0; font-size: 15px; background: none; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; min-width: 120px;">FECHA:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${fecha}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa;">N.º DE RECIBO:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${numeroRecibo}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; font-weight: bold;">Nombre:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${nombre}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; font-weight: bold;">Dirección:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${direccionCliente}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; font-weight: bold;">NIF/DNI/NIE:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${documentoIdentidadCliente}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; font-weight: bold;">Vehículo:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${marcaModelo}</td>
            </tr>
            <tr>
              <td style="padding: 7px 12px; color: #444; text-align: right; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fafafa; font-weight: bold;">Matrícula:</td>
              <td style="padding: 7px 12px; color: #222; text-align: left; border-bottom: 1px solid #e0e0e0; border-top: 1px solid #e0e0e0; background: #fff;">${matricula}</td>
            </tr>
          </table>
        </div>
      </div>

      <!-- Tabla de servicios -->
      <table class="tabla-servicios">
        <thead>
          <tr>
            <th>DESCRIPCIÓN</th>
            <th>CANTIDAD</th>
            <th>€</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) =>
                `<tr><td>${item.descripcion}</td><td style="text-align:center;">${item.cantidad}</td><td>${(item.cantidad * item.precioUnit).toFixed(2)} €</td></tr>`
            )
            .join("")}
        </tbody>
      </table>

      <!-- Total -->
      <div class="totales">
        <table class="totales-tabla">
          <tr class="total"><td>TOTAL</td><td>${total.toFixed(2)} €</td></tr>
        </table>
      </div>

      <!-- Pie de recibo -->
      <div class="pie">
        <b>Protección de Datos</b><br>
        En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), le informamos que sus datos personales serán tratados por AhumaGlass, con domicilio en Calle Alvarez Sotomayor 21, La Torre, Valencia, CP 46017, con la finalidad de gestionar la relación comercial y fiscal. Puede ejercer sus derechos en contacto@ahumaglass.es.
      </div>
      <div class="agradecimiento">GRACIAS POR SU CONFIANZA</div>
    </div>
  </body>
  </html>
  `;
}
