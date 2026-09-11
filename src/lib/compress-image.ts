// sessionStorage key used to hand off a pasted/attached image from the
// home hero search to the /solicitar form (base64 is too big for a URL
// query param, and the pendingSolicitud restore-after-login flow is a
// separate concern from this one-time handoff).
export const PENDING_IMAGE_KEY = "pendingImagenSolicitud";

const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.75;

// Reduce fotos de camara (que pueden pesar varios MB) a un JPEG liviano
// antes de guardarlas como base64, ya que se guardan directo en la fila
// de la solicitud en vez de en un storage de archivos aparte.
export function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo procesar la imagen."));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function getPastedImageFile(
  clipboardData: DataTransfer | null,
): File | null {
  if (!clipboardData) return null;
  for (const item of clipboardData.items) {
    if (item.type.startsWith("image/")) {
      return item.getAsFile();
    }
  }
  return null;
}

// Returns null (not an error) when the clipboard simply had no image, so
// callers can let normal text paste continue undisturbed.
export async function extractPastedImage(
  clipboardData: DataTransfer | null,
): Promise<string | null> {
  const file = getPastedImageFile(clipboardData);
  if (!file) return null;
  return compressImageFile(file);
}
