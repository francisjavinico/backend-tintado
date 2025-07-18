export function generarCorreoCliente({
  nombre,
  tieneFactura,
}: {
  nombre: string;
  tieneFactura: boolean;
}) {
  return `
    <h2 style="color:#2b6cb0;">¡Gracias por confiar en AhumaGlass!</h2>
    <p>Adjuntamos la documentación de tu servicio:</p>
    <ul>
      <li>${tieneFactura ? "Factura" : "Recibo"}</li>
      <li>Certificado de Garantía (si aplica)</li>
    </ul>
    <hr style="margin:18px 0;"/>
    <h3 style="color:#2b6cb0;">🧼 Cuidados y Recomendaciones para tu Lámina Solar</h3>
    <ul style="font-size:1em;">
      <li><b>Limpieza:</b> Usa únicamente productos neutros (sin amoníaco) y paños de microfibra.</li>
      <li>🚫 <b>Evita:</b> Productos abrasivos, herramientas punzantes o estropajos.</li>
      <li>☀️ <b>No apliques calor directo:</b> No uses secadores, pistolas térmicas ni dejes el vehículo expuesto a calor extremo durante el curado.</li>
      <li>⏳ <b>Curado:</b> No manipules la lámina durante el proceso de curado (de 3 a 7 días tras la instalación).</li>
      <li>🧰 <b>Instalación:</b> La garantía es válida solo si la instalación y manipulación la realiza AhumaGlass.</li>
      <li>🧾 <b>Propietario:</b> Garantía válida únicamente para el primer propietario tras la instalación.</li>
    </ul>
    <hr style="margin:18px 0;"/>
    <h3 style="color:#2b6cb0;">🔽 ¿Cómo activar o reclamar tu garantía?</h3>
    <ol style="font-size:1em;">
      <li>Detecta un problema cubierto por la garantía (defectos de fabricación, burbujas, pelado, pérdida de color, delaminación, fallos de adhesión).</li>
      <li>📞 Contáctanos con el comprobante de instalación o número de pedido.</li>
      <li>🔍 Evaluaremos el estado de la lámina.</li>
      <li>🔄 Si corresponde, sustituiremos el material sin coste adicional para ti.</li>
    </ol>
    <hr style="margin:18px 0;"/>
    <h3 style="color:#2b6cb0;">🔽 ¿Por qué confiar en AhumaGlass?</h3>
    <ul style="font-size:1em;">
      <li>🔧 <b>Materiales homologados</b> y tecnología avanzada.</li>
      <li>🏆 <b>Más de 10 años de experiencia</b> en el sector.</li>
      <li>👨‍🔧 <b>Instaladores profesionales</b> y atención personalizada.</li>
      <li>📋 <b>Garantía real y transparente</b>: tu satisfacción y seguridad son nuestra prioridad.</li>
      <li>🎯 <b>Compromiso:</b> Queremos que disfrutes de un tintado con el máximo confort, estética y protección.</li>
    </ul>
    <hr style="margin:18px 0;"/>
    <p style="font-size:1.1em;">¿Tienes dudas o necesitas ayuda?<br>Estamos a tu disposición para cualquier consulta o gestión de garantía.</p>
    <p style="font-size:1.1em;">¡Gracias por elegirnos!<br><b>El equipo de AhumaGlass</b></p>
  `;
}
