export function generarGarantiaHTML(data: {
  nombre: string;
  marcaModelo: string;
  matricula: string;
  tipoLamina: string;
  fechaEmision: string;
  textoLamina: string;
  aniosGarantia: string;
  logoEmpresa: string;
  logo3M: string;
  logoLlumar: string;
  logoSolar: string;
}) {
  const {
    nombre,
    marcaModelo,
    matricula,
    tipoLamina,
    fechaEmision,
    textoLamina,
    aniosGarantia,
    logoEmpresa,
    logo3M,
    logoLlumar,
    logoSolar,
  } = data;

  return `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>Certificado de Garantía</title>
    <style>
      @import url('https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap');
      body {
        font-family: 'Montserrat', 'Segoe UI', Arial, sans-serif;
        background: linear-gradient(135deg, #f7fafc 60%, #e3e9f3 100%);
        color: #222;
        margin: 0;
        padding: 0;
      }
      .container {
        background: #fff;
        max-width: 750px;
        margin: 24px auto;
        border-radius: 14px;
        box-shadow: 0 6px 24px rgba(44,62,80,0.10);
        padding: 28px 18px 18px 18px;
        position: relative;
        overflow: hidden;
      }
      .container:before {
        content: '';
        position: absolute;
        top: -60px;
        right: -60px;
        width: 200px;
        height: 200px;
        background: rgba(43,108,176,0.07);
        border-radius: 50%;
        z-index: 0;
      }
      .logo-empresa {
        display: block;
        margin: 0 auto 18px auto;
        max-width: 140px;
        z-index: 1;
        position: relative;
      }
      h1 {
        text-align: center;
        color: #2b6cb0;
        margin-bottom: 12px;
        font-size: 1.7rem;
        letter-spacing: 1px;
        font-weight: 700;
        z-index: 1;
        position: relative;
      }
      .anios-garantia {
        text-align: center;
        color: #fff;
        background: linear-gradient(90deg, #2b6cb0 60%, #4fd1c5 100%);
        font-weight: bold;
        font-size: 1.05rem;
        border-radius: 8px;
        padding: 5px 0;
        margin-bottom: 14px;
        box-shadow: 0 2px 8px rgba(43,108,176,0.08);
        z-index: 1;
        position: relative;
      }
      .datos {
        margin-bottom: 14px;
        font-size: 1em;
        background: #f7fafc;
        border-radius: 8px;
        padding: 10px 12px;
        box-shadow: 0 1px 4px rgba(44,62,80,0.03);
        z-index: 1;
        position: relative;
        display: flex;
        justify-content: center;
      }
      .datos-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0 6px;
      }
      .datos-table td {
        text-align: center;
        padding: 6px 12px;
        background: #fff;
        border-radius: 6px;
        font-size: 1em;
        color: #222;
        border: 1px solid #e0e0e0;
        min-width: 120px;
      }
      .texto-lamina, .garantia-info {
        font-size: 10px;
        color: #555;
        line-height: 1.5;
        text-align: justify;
        margin-bottom: 10px;
        font-family: 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      }
      .garantia-info {
        font-size: 0.97em;
        margin-bottom: 12px;
      }
      .logos-secundarios {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 18px;
        z-index: 1;
        position: relative;
      }
      .logos-secundarios img {
        max-height: 32px;
        opacity: 0.85;
        filter: grayscale(0.2);
      }
      .logos-secundarios img.logo-solar {
        max-height: 44px;
      }
      .footer {
        text-align: center;
        font-size: 0.93em;
        color: #888;
        margin-top: 18px;
        z-index: 1;
        position: relative;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <img src="${logoEmpresa}" class="logo-empresa" alt="Ahumaglass" />
      <h1>Certificado de Garantía</h1>
      <div class="anios-garantia">${aniosGarantia}</div>
      <div class="datos">
        <table class="datos-table">
          <tr>
            <td><strong>Cliente</strong><br>${nombre}</td>
            <td><strong>Marca y Modelo</strong><br>${marcaModelo}</td>
          </tr>
          <tr>
            <td><strong>Matrícula</strong><br>${matricula}</td>
            <td><strong>Tipo de lámina</strong><br>${tipoLamina}</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Fecha de emisión</strong><br>${fechaEmision}</td>
          </tr>
        </table>
      </div>
      <div class="texto-lamina">
        ${textoLamina} ¿Qué cubre la garantía? Defectos de fabricación como burbujas, pelado, pérdida de color, delaminación o fallos de adhesión. No cubre daños por mal uso, limpieza inadecuada o instalación por terceros. Condiciones de validez: Limpieza sólo con productos neutros y paño de microfibra. No usar productos abrasivos ni calor directo. Instalación y manipulación sólo por AhumaGlass. Válida para el primer propietario. ¿Cómo reclamar? Contacta con AhumaGlass y presenta tu comprobante. Evaluaremos y, si corresponde, sustituiremos la lámina sin coste. Confía en AhumaGlass: Más de 10 años de experiencia, materiales homologados y tecnología avanzada para tu tranquilidad y confort.
      </div>
      <div class="logos-secundarios">
        <img src="${logo3M}" alt="3M" />
        <img src="${logoLlumar}" alt="Llumar" />
        <img src="${logoSolar}" alt="Solar Screen" class="logo-solar" />
      </div>
      <div class="footer">
        Este certificado acredita la instalación profesional de láminas solares en su vehículo.<br>
        Ahumaglass &copy; ${new Date().getFullYear()}<br>
        <span style="font-size:0.93em;">Para cualquier consulta o gestión de garantía, contacte con nosotros.</span>
      </div>
    </div>
  </body>
  </html>
  `;
}
