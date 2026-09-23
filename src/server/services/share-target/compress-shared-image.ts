import sharp from "sharp";

// Mirrors the constants in src/lib/compress-image.ts (client-side) so a
// photo shared via the OS share sheet gets the same treatment as one
// pasted/attached by hand before it's stored as base64 in the DB.
const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 75;

export async function compressSharedImage(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const resized = await sharp(buffer)
    .resize({
      width: MAX_DIMENSION,
      height: MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();

  return `data:image/jpeg;base64,${resized.toString("base64")}`;
}
