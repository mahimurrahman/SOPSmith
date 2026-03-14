import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#091018",
    categories: ["business", "productivity"],
    description: "Turn rough operational notes into clear SOPs your team can use today.",
    display: "standalone",
    id: "/",
    icons: [
      {
        sizes: "any",
        src: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    name: "SOPSmith",
    orientation: "portrait",
    short_name: "SOPSmith",
    scope: "/",
    start_url: "/",
    theme_color: "#091018",
  };
}
