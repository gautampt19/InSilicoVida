import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function localCMSPlugin(): Plugin {
  return {
    name: "local-cms",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/publications")) return next();

        const jsonPath = path.resolve(__dirname, "./src/data/publications.json");

        if (req.method === "GET") {
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(jsonPath));
          return;
        }

        if (req.method === "POST") {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            const newPub = JSON.parse(body);
            const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
            data.unshift(newPub);
            fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(newPub));
          });
          return;
        }

        if (req.method === "DELETE") {
          const id = req.url.split("/").pop();
          const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
          const filtered = data.filter((p: any) => p.id !== id);
          fs.writeFileSync(jsonPath, JSON.stringify(filtered, null, 2));
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    localCMSPlugin(),
  ].filter(Boolean) as Plugin[],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

