import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tienda Importación",
    short_name: "Tienda Importación",
    description:
      "Compramos y te enviamos lo que necesites importar desde tus tiendas favoritas.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0071e3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    share_target: {
      action: "/api/share-target",
      method: "POST",
      enctype: "multipart/form-data",
      params: {
        title: "title",
        text: "text",
        url: "url",
        files: [{ name: "photo", accept: ["image/*"] }],
      },
    },
  };
}
