import { PENDING_IMAGE_KEY } from "@/lib/compress-image";
import { compressSharedImage } from "@/server/services/share-target/compress-shared-image";

// sharp needs the Node runtime, not Edge.
export const runtime = "nodejs";

const URL_PATTERN = /^https?:\/\//i;

function escapeForScript(value: string): string {
  return JSON.stringify(value);
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();

  const sharedUrl = String(formData.get("url") ?? "").trim();
  const sharedText = String(formData.get("text") ?? "").trim();
  const sharedTitle = String(formData.get("title") ?? "").trim();
  const photo = formData.get("photo");

  // Different apps put the link in different fields, so check in order of
  // preference: a dedicated url, then text (some sources put the link
  // there instead), then fall back to plain text/title as a description.
  const prefill = URL_PATTERN.test(sharedUrl)
    ? sharedUrl
    : URL_PATTERN.test(sharedText)
      ? sharedText
      : sharedText || sharedTitle || "";

  let imageDataUrl: string | null = null;
  if (photo instanceof File && photo.size > 0) {
    imageDataUrl = await compressSharedImage(photo);
  }

  const target = prefill ? `/solicitar?prefill=${encodeURIComponent(prefill)}` : "/solicitar";

  // Respond directly with HTML instead of a redirect: this has no
  // destructive side effect (nothing is written to the DB, only
  // sessionStorage), and a redirect couldn't carry the base64 image
  // payload anyway (cookies are capped around 4KB).
  const html = `<!doctype html>
<html lang="es">
  <head><meta charset="utf-8" /><title>Enviando...</title></head>
  <body>
    <script>
      try {
        ${imageDataUrl ? `sessionStorage.setItem(${escapeForScript(PENDING_IMAGE_KEY)}, ${escapeForScript(imageDataUrl)});` : ""}
      } catch (e) {}
      location.replace(${escapeForScript(target)});
    </script>
  </body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
