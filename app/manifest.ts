import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "PBTI — Pet Behavior Type Indicator", short_name: "PBTI", description: "Discover your pet's personality.", start_url: "/", display: "standalone", background_color: "#fff9f2", theme_color: "#ff7a1a", icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }] };
}
