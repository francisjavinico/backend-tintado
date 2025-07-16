import puppeteer from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { generarGarantiaHTML } from "@src/templates/garantiaTemplate";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export async function generarGarantiaPDF(citaId: number): Promise<Buffer> {
  const garantia = await prisma.garantia.findUnique({
    where: { citaId },
    include: {
      cliente: true,
      cita: { include: { vehiculo: true } },
    },
  });

  if (!garantia || !garantia.cliente || !garantia.cita) {
    throw new Error("Garantía, cliente o cita no encontrados");
  }

  // Leer logos en base64
  function getLogoBase64(filename: string) {
    try {
      const logoPath = path.resolve(__dirname, `../public/${filename}`);
      const logoBuffer = fs.readFileSync(logoPath);
      return `data:image/png;base64,${logoBuffer.toString("base64")}`;
    } catch (err) {
      return "";
    }
  }

  const logoEmpresa = getLogoBase64("logo.png");
  const logo3M = getLogoBase64("3m.png");
  const logoLlumar = getLogoBase64("lumar.png");
  const logoSolar = getLogoBase64("solar.png");

  const nombreCompleto =
    [garantia.cliente.nombre, garantia.cliente.apellido]
      .filter(Boolean)
      .join(" ") || "Cliente";
  const vehiculo = garantia.cita.vehiculo;
  const marcaModelo = vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : "-";
  const matricula = garantia.cita.matricula ?? "-";
  const tipoLamina = garantia.descripcion ?? "-";
  const fechaEmision = garantia.fechaInicio.toLocaleDateString("es-ES");

  // Texto y años de garantía según tipo de lámina
  let textoLamina = "";
  let aniosGarantia = "";
  if (tipoLamina.toLowerCase().includes("poliester")) {
    textoLamina =
      "La lámina de poliéster instalada ofrece protección solar básica y durabilidad estándar.";
    aniosGarantia = "7 años de garantía";
  } else if (tipoLamina.toLowerCase().includes("nanoceramica")) {
    textoLamina =
      "La lámina nanocerámica instalada proporciona máxima protección térmica y visibilidad superior.";
    aniosGarantia = "10 años de garantía";
  } else if (tipoLamina.toLowerCase().includes("nanocarbon")) {
    textoLamina =
      "La lámina nanocarbon instalada combina alta protección solar con tecnología avanzada de carbono.";
    aniosGarantia = "Garantía de por vida";
  } else {
    textoLamina =
      "La lámina instalada cuenta con garantía profesional de Ahumaglass.";
    aniosGarantia = "Garantía profesional";
  }

  const html = generarGarantiaHTML({
    nombre: nombreCompleto,
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
  });

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const pdfBuffer = Buffer.from(
    await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      preferCSSPageSize: true,
    })
  );
  await browser.close();

  return pdfBuffer;
}
