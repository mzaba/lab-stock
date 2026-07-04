import type { MetadataRoute } from "next";

// A dynamic manifest (instead of public/manifest.json) so start_url and icon
// paths pick up NEXT_PUBLIC_BASE_PATH — required on HS, where this app is
// mounted under /lab-stock instead of the root.
export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  return {
    name: "Lab Stock",
    short_name: "Lab Stock",
    description:
      "Control de stock para el equipo de guardia del laboratorio de hematología",
    start_url: `${basePath}/`,
    display: "standalone",
    background_color: "#0d5e57",
    theme_color: "#0d5e57",
    orientation: "portrait",
    icons: [
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
