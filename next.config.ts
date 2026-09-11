import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // El limite por defecto es 1MB; las imagenes que el cliente pega o
      // adjunta van codificadas en base64 (~33% mas pesadas que el binario).
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
