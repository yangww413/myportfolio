import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist-refined",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "index.next": "index.next.html",
        "portfolio-preview.next": "portfolio-preview.next.html",
        "projects/creative-direction": "projects/creative-direction.html",
        "projects/wedding-space-design": "projects/wedding-space-design.html",
      },
    },
  },
});

