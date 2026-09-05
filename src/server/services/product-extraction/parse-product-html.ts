import * as cheerio from "cheerio";

export interface ExtractedProductInfo {
  title: string | null;
  description: string | null;
  image: string | null;
  images: string[];
  price: number | null;
  currency: string | null;
  brand: string | null;
  color: string | null;
}

interface JsonLdOffer {
  "@type"?: string;
  price?: string | number;
  lowPrice?: string | number;
  highPrice?: string | number;
  priceCurrency?: string;
}

interface JsonLdProduct {
  "@type"?: string | string[];
  name?: string;
  description?: string;
  image?: string | string[];
  color?: string;
  brand?: { name?: string } | string;
  offers?: JsonLdOffer | JsonLdOffer[];
}

function toNumber(value: string | number | undefined): number | null {
  if (value == null) return null;
  const num = typeof value === "number" ? value : parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}

function firstOf<T>(value: T | T[] | undefined): T | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

const MAX_IMAGES = 12;

// CDNs (Shopify, Apple, imgix, Cloudinary...) resize the same photo through
// query params, so two URLs that only differ there are the same picture.
function dedupeImages(urls: string[]): string[] {
  const seenKeys = new Set<string>();
  const result: string[] = [];
  for (const url of urls) {
    let key = url;
    try {
      const parsed = new URL(url);
      key = parsed.origin + parsed.pathname;
    } catch {
      // Keep the raw URL as the key if it fails to parse.
    }
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    result.push(url);
  }
  return result;
}

function findAllProductNodes(node: unknown): JsonLdProduct[] {
  if (Array.isArray(node)) {
    return node.flatMap(findAllProductNodes);
  }

  if (node && typeof node === "object") {
    const obj = node as JsonLdProduct & { "@graph"?: unknown[] };
    const type = obj["@type"];
    const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
    if (isProduct) return [obj];
    if (obj["@graph"]) return findAllProductNodes(obj["@graph"]);
  }

  return [];
}

// A page comparing several models (e.g. "you might also like iPhone 16
// Plus") can embed more than one Product block. One with a fixed Offer is
// the actual configured SKU; an AggregateOffer-only block is usually a
// price-range summary for a whole product line, not this exact item.
function hasFixedOffer(product: JsonLdProduct): boolean {
  return toArray(product.offers).some((offer) => offer["@type"] !== "AggregateOffer");
}

export function parseProductHtml(html: string): ExtractedProductInfo {
  const $ = cheerio.load(html);

  const meta = (name: string) =>
    $(`meta[property="${name}"]`).attr("content") ??
    $(`meta[name="${name}"]`).attr("content") ??
    null;

  const productNodes: JsonLdProduct[] = [];
  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const el of scripts) {
    try {
      const parsed: unknown = JSON.parse($(el).text());
      productNodes.push(...findAllProductNodes(parsed));
    } catch {
      // Ignore malformed JSON-LD blocks; fall back to meta tags.
    }
  }
  const jsonLdProduct =
    productNodes.find(hasFixedOffer) ?? productNodes[0] ?? null;

  const offer = firstOf(jsonLdProduct?.offers);
  const brand = jsonLdProduct?.brand;
  const brandName = typeof brand === "string" ? brand : brand?.name ?? null;

  const title =
    jsonLdProduct?.name ??
    meta("og:title") ??
    $("title").first().text().trim() ??
    null;

  const description =
    jsonLdProduct?.description ?? meta("og:description") ?? meta("description");

  const ogImages = $('meta[property="og:image"], meta[name="og:image"]')
    .map((_, el) => $(el).attr("content"))
    .toArray()
    .filter((src): src is string => Boolean(src));

  const images = dedupeImages(
    [...toArray(jsonLdProduct?.image), ...ogImages].filter((src) =>
      /^https?:\/\//.test(src),
    ),
  ).slice(0, MAX_IMAGES);

  const image = images[0] ?? null;

  const price =
    toNumber(offer?.price) ??
    toNumber(offer?.lowPrice) ??
    toNumber(offer?.highPrice) ??
    toNumber(meta("product:price:amount") ?? undefined) ??
    toNumber(meta("og:price:amount") ?? undefined);

  const currency =
    offer?.priceCurrency ??
    meta("product:price:currency") ??
    meta("og:price:currency");

  return {
    title: title || null,
    description: description || null,
    image,
    images,
    price,
    currency: currency || null,
    brand: brandName,
    color: jsonLdProduct?.color ?? null,
  };
}
