import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { generarFacturaHTML } from "@src/templates/facturaTemplate";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function generarFacturaPDF(facturaId: number): Promise<Buffer> {
  const factura = await prisma.factura.findUnique({
    where: { id: facturaId },
    include: {
      cliente: true,
      items: true,
      cita: { include: { vehiculo: true } },
    },
  });

  if (!factura || !factura.cliente) {
    throw new Error("Factura o cliente no encontrado");
  }

  const nombreCompleto = [factura.cliente.nombre, factura.cliente.apellido]
    .filter(Boolean)
    .join(" ");
  const direccionCliente = factura.cliente.direccion || "";
  const documentoIdentidadCliente = factura.cliente.documentoIdentidad || "";

  const marcaModelo =
    factura.cita && factura.cita.vehiculo
      ? `${factura.cita.vehiculo.marca} ${factura.cita.vehiculo.modelo}`
      : "";
  const matricula =
    factura.cita && factura.cita.matricula ? factura.cita.matricula : "";

  // Depuración de lectura de logo
  let logoBase64 = "";
  try {
    const logoPath = path.resolve(__dirname, "../public/logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    logoBase64 = "";
  }

  const html = generarFacturaHTML({
    nombre: nombreCompleto || "Cliente",
    telefono: factura.cliente.telefono,
    email: factura.cliente.email ?? "",
    fecha: factura.fecha.toLocaleDateString("es-ES"),
    subtotal: factura.subtotal,
    iva: factura.iva,
    total: factura.total,
    items: factura.items,
    numeroFactura: factura.numeroAnual ? factura.numeroAnual.toString() : "",
    nombreCompleto,
    direccionCliente,
    documentoIdentidadCliente,
    logoBase64,
    marcaModelo,
    matricula,
  });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfBuffer = Buffer.from(
    await page.pdf({ format: "A4", printBackground: true })
  );
  await browser.close();

  return pdfBuffer;
}
