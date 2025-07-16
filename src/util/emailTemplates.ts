export function generarCorreoCliente({
  nombre,
  tieneFactura,
}: {
  nombre: string;
  tieneFactura: boolean;
}) {
  return `
    <h2>Hola ${nombre || "cliente"},</h2>
    <p>Gracias por confiar en nuestro servicio de tintado de lunas.</p>
    <p>Adjuntamos su ${tieneFactura ? "factura" : "recibo"} y garantía del trabajo realizado.</p>
    <p>Un saludo,<br/>Tintado Valencia</p>
  `;
}
