import dns from "node:dns/promises";
import net from "node:net";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BODY_BYTES = 3 * 1024 * 1024;
const MAX_REDIRECTS = 3;

// Guards against SSRF: a logged-in customer supplies this URL, and the
// server fetches it directly, so it must never be able to reach internal
// or link-local network addresses.
function isPrivateIp(ip: string): boolean {
  const type = net.isIP(ip);

  if (type === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 198 && (b === 18 || b === 19)) return true;
    if (a >= 224) return true; // multicast + reserved
    return false;
  }

  if (type === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true; // unique local
    if (normalized.startsWith("fe80")) return true; // link-local
    if (normalized.startsWith("::ffff:")) {
      return isPrivateIp(normalized.replace("::ffff:", ""));
    }
    return false;
  }

  return true; // Unknown shape: fail closed.
}

async function assertPublicHost(hostname: string): Promise<void> {
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new Error("No se permiten direcciones de red internas.");
    }
    return;
  }

  const addresses = await dns.lookup(hostname, { all: true });
  if (addresses.length === 0) {
    throw new Error("No se pudo resolver el dominio del producto.");
  }
  if (addresses.some((addr) => isPrivateIp(addr.address))) {
    throw new Error("No se permiten direcciones de red internas.");
  }
}

export async function fetchProductPage(rawUrl: string): Promise<string> {
  let currentUrl = rawUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    const url = new URL(currentUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Solo se permiten links http o https.");
    }

    await assertPublicHost(url.hostname);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; TiendaImportacionBot/1.0; +https://tienda-importacion.local)",
          Accept: "text/html",
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("El link redirige sin destino válido.");
      }
      currentUrl = new URL(location, url).toString();
      continue;
    }

    if (!response.ok) {
      throw new Error(`No se pudo obtener la página (HTTP ${response.status}).`);
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      throw new Error("El link no apunta a una página de producto válida.");
    }

    return readBodyWithLimit(response, MAX_BODY_BYTES);
  }

  throw new Error("Demasiadas redirecciones al obtener el producto.");
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return response.text();

  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    if (received > maxBytes) {
      await reader.cancel();
      throw new Error("La página del producto es demasiado grande para analizarla.");
    }
    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf-8");
}
