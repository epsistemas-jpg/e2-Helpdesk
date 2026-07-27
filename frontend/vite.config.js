import { defineConfig } from "vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const htmlEntries = [
  "index.html",
  "pages/auth/login.html",
  "pages/dashboard/dashboard.html",
  "pages/reports/reports.html",
  "pages/settings/settings.html",
  "pages/tickets/tickets.html",
  "pages/tickets/createTicket.html",
  "pages/tickets/ticketDetails.html",
  "pages/users/users.html"
].map(file => resolve(projectRoot, file));

export default defineConfig({
  root: projectRoot,
  build: {
    rollupOptions: {
      input: htmlEntries
    }
  },
  server: {
    port: 5173
  }
});
