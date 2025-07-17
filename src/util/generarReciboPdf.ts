import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { generarReciboHTML } from "@src/templates/reciboTemplate";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function generarReciboPDF(reciboId: number): Promise<Buffer> {
  const recibo = await prisma.recibo.findUnique({
    where: { id: reciboId },
    include: {
      cliente: true,
      cita: { include: { vehiculo: true } },
      items: true,
    },
  });
  if (!recibo || !recibo.cliente) {
    throw new Error("Recibo o cliente no encontrado");
  }

  // Leer logo en base64
  let logoBase64 = "";
  try {
    const logoPath = path.resolve(__dirname, "../public/logo.png");
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    logoBase64 = "";
  }

  const nombreCompleto = [recibo.cliente.nombre, recibo.cliente.apellido]
    .filter(Boolean)
    .join(" ");
  const direccionCliente = recibo.cliente.direccion || "";
  const documentoIdentidadCliente = recibo.cliente.documentoIdentidad || "";

  const marcaModelo =
    recibo.cita && recibo.cita.vehiculo
      ? `${recibo.cita.vehiculo.marca} ${recibo.cita.vehiculo.modelo}`
      : "";
  const matricula =
    recibo.cita && recibo.cita.matricula ? recibo.cita.matricula : "";

  const html = generarReciboHTML({
    nombre: nombreCompleto || "Cliente",
    telefono: recibo.cliente.telefono ?? "—",
    email: recibo.cliente.email ?? "—",
    fecha: recibo.fecha.toLocaleDateString("es-ES"),
    descripcion: recibo.descripcion ?? "—",
    items: recibo.items,
    total: recibo.monto,
    numeroRecibo: recibo.numeroAnual ? recibo.numeroAnual.toString() : "",
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

  const pdfUint8 = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20mm", bottom: "20mm", left: "15mm", right: "15mm" },
  });

  await browser.close();
  return Buffer.from(pdfUint8);
}
