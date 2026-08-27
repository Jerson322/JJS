import { fetchProductPage } from "./fetch-product-page";
import { parseProductHtml, type ExtractedProductInfo } from "./parse-product-html";

export type { ExtractedProductInfo };

export async function extractProductInfo(url: string): Promise<ExtractedProductInfo> {
  const html = await fetchProductPage(url);
  return parseProductHtml(html);
}
