import { describe, expect, it } from "vitest";
import { parseProductHtml } from "./parse-product-html";

describe("parseProductHtml", () => {
  it("extracts data from JSON-LD Product markup", () => {
    const html = `
      <html><head>
        <title>Fallback Title</title>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Zapatillas Azules",
            "description": "Zapatillas deportivas azules",
            "image": ["https://example.com/shoe.jpg"],
            "color": "Azul",
            "brand": { "@type": "Brand", "name": "Nike" },
            "offers": {
              "@type": "Offer",
              "price": "129.99",
              "priceCurrency": "USD"
            }
          }
        </script>
      </head><body></body></html>
    `;

    const result = parseProductHtml(html);

    expect(result.title).toBe("Zapatillas Azules");
    expect(result.price).toBe(129.99);
    expect(result.currency).toBe("USD");
    expect(result.brand).toBe("Nike");
    expect(result.color).toBe("Azul");
    expect(result.image).toBe("https://example.com/shoe.jpg");
  });

  it("falls back to Open Graph meta tags when there is no JSON-LD", () => {
    const html = `
      <html><head>
        <meta property="og:title" content="Producto de Ejemplo" />
        <meta property="og:description" content="Una descripción" />
        <meta property="og:image" content="https://example.com/img.jpg" />
        <meta property="product:price:amount" content="49.90" />
        <meta property="product:price:currency" content="USD" />
      </head><body></body></html>
    `;

    const result = parseProductHtml(html);

    expect(result.title).toBe("Producto de Ejemplo");
    expect(result.description).toBe("Una descripción");
    expect(result.image).toBe("https://example.com/img.jpg");
    expect(result.price).toBe(49.9);
    expect(result.currency).toBe("USD");
  });

  it("uses lowPrice from an AggregateOffer when there is no fixed price", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "iPhone Pro",
            "offers": [{
              "@type": "AggregateOffer",
              "lowPrice": 1099.00,
              "highPrice": 1499.00,
              "priceCurrency": "USD"
            }]
          }
        </script>
      </head><body></body></html>
    `;

    const result = parseProductHtml(html);

    expect(result.price).toBe(1099);
    expect(result.currency).toBe("USD");
  });

  it("collects every image from JSON-LD and og:image tags", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Zapatillas Azules",
            "image": ["https://example.com/1.jpg", "https://example.com/2.jpg"]
          }
        </script>
        <meta property="og:image" content="https://example.com/2.jpg" />
        <meta property="og:image" content="https://example.com/3.jpg" />
      </head><body></body></html>
    `;

    const result = parseProductHtml(html);

    expect(result.images).toEqual([
      "https://example.com/1.jpg",
      "https://example.com/2.jpg",
      "https://example.com/3.jpg",
    ]);
    expect(result.image).toBe("https://example.com/1.jpg");
  });

  it("returns nulls when nothing usable is present", () => {
    const result = parseProductHtml("<html><head></head><body></body></html>");

    expect(result.title).toBeNull();
    expect(result.price).toBeNull();
    expect(result.image).toBeNull();
  });

  it("ignores malformed JSON-LD blocks instead of throwing", () => {
    const html = `
      <html><head>
        <script type="application/ld+json">{ not valid json </script>
        <meta property="og:title" content="Todavía funciona" />
      </head><body></body></html>
    `;

    const result = parseProductHtml(html);

    expect(result.title).toBe("Todavía funciona");
  });
});
