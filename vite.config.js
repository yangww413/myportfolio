import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        preview: "portfolio-preview.html",
        "projects/1018-xijiao-one": "projects/1018-xijiao-one.html",
        "projects/brand-film-direction": "projects/brand-film-direction.html",
        "projects/liushen-brand-content": "projects/liushen-brand-content.html",
        "projects/multi-brand-content": "projects/multi-brand-content.html",
        "projects/creative-direction": "projects/creative-direction.html",
        "projects/wedding-space-design": "projects/wedding-space-design.html",
        "projects/meijiajing-content": "projects/meijiajing-content.html",
        "projects/qichu-content": "projects/qichu-content.html",
        "projects/yousiming-content": "projects/yousiming-content.html",
        "projects/culture-in-motion": "projects/culture-in-motion.html",
        "projects/wedding-ppt-preview": "projects/wedding-ppt-preview.html",
        "projects/south-france-floral": "projects/south-france-floral.html",
        "projects/yu-ming": "projects/yu-ming.html",
      },
    },
  },
});
