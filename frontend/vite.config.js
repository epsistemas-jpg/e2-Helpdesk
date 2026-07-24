import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readdirSync } from "node:fs";

function htmlEntries(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    if (["node_modules", "dist", ".git"].includes(entry.name)) return [];
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) return htmlEntries(absolute, relative);
    return entry.name.endsWith(".html") ? absolute : [];
  });
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlEntries(resolve("."))
    }
  },
  server: {
    port: 5173
  }
});
