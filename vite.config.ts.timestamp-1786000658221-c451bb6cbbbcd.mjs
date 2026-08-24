// vite.config.ts
import { defineConfig } from "file:///C:/Users/gauta/OneDrive/Desktop/URV%20projects/InSilicoVida/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/gauta/OneDrive/Desktop/URV%20projects/InSilicoVida/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import fs from "fs";
import { componentTagger } from "file:///C:/Users/gauta/OneDrive/Desktop/URV%20projects/InSilicoVida/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\gauta\\OneDrive\\Desktop\\URV projects\\InSilicoVida";
function localCMSPlugin() {
  return {
    name: "local-cms",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith("/api/publications")) return next();
        const jsonPath = path.resolve(__vite_injected_original_dirname, "./src/data/publications.json");
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
          const filtered = data.filter((p) => p.id !== id);
          fs.writeFileSync(jsonPath, JSON.stringify(filtered, null, 2));
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
          return;
        }
        next();
      });
    }
  };
}
var vite_config_default = defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    localCMSPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxnYXV0YVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXFVSViBwcm9qZWN0c1xcXFxJblNpbGljb1ZpZGFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGdhdXRhXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcVVJWIHByb2plY3RzXFxcXEluU2lsaWNvVmlkYVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvZ2F1dGEvT25lRHJpdmUvRGVza3RvcC9VUlYlMjBwcm9qZWN0cy9JblNpbGljb1ZpZGEvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIFBsdWdpbiB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCBmcyBmcm9tIFwiZnNcIjtcclxuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XHJcblxyXG5mdW5jdGlvbiBsb2NhbENNU1BsdWdpbigpOiBQbHVnaW4ge1xyXG4gIHJldHVybiB7XHJcbiAgICBuYW1lOiBcImxvY2FsLWNtc1wiLFxyXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xyXG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgIGlmICghcmVxLnVybD8uc3RhcnRzV2l0aChcIi9hcGkvcHVibGljYXRpb25zXCIpKSByZXR1cm4gbmV4dCgpO1xyXG5cclxuICAgICAgICBjb25zdCBqc29uUGF0aCA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmMvZGF0YS9wdWJsaWNhdGlvbnMuanNvblwiKTtcclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiR0VUXCIpIHtcclxuICAgICAgICAgIHJlcy5zZXRIZWFkZXIoXCJDb250ZW50LVR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoanNvblBhdGgpKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChyZXEubWV0aG9kID09PSBcIlBPU1RcIikge1xyXG4gICAgICAgICAgbGV0IGJvZHkgPSBcIlwiO1xyXG4gICAgICAgICAgcmVxLm9uKFwiZGF0YVwiLCAoY2h1bmspID0+IHtcclxuICAgICAgICAgICAgYm9keSArPSBjaHVuay50b1N0cmluZygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXEub24oXCJlbmRcIiwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBuZXdQdWIgPSBKU09OLnBhcnNlKGJvZHkpO1xyXG4gICAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoanNvblBhdGgsIFwidXRmLThcIikpO1xyXG4gICAgICAgICAgICBkYXRhLnVuc2hpZnQobmV3UHViKTtcclxuICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhqc29uUGF0aCwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMikpO1xyXG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKFwiQ29udGVudC1UeXBlXCIsIFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgICAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeShuZXdQdWIpKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHJlcS5tZXRob2QgPT09IFwiREVMRVRFXCIpIHtcclxuICAgICAgICAgIGNvbnN0IGlkID0gcmVxLnVybC5zcGxpdChcIi9cIikucG9wKCk7XHJcbiAgICAgICAgICBjb25zdCBkYXRhID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoanNvblBhdGgsIFwidXRmLThcIikpO1xyXG4gICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBkYXRhLmZpbHRlcigocDogYW55KSA9PiBwLmlkICE9PSBpZCk7XHJcbiAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGpzb25QYXRoLCBKU09OLnN0cmluZ2lmeShmaWx0ZXJlZCwgbnVsbCwgMikpO1xyXG4gICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSB9KSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuZXh0KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICB9O1xyXG59XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xyXG4gIGJhc2U6IHByb2Nlc3MuZW52LlZJVEVfQkFTRV9QQVRIIHx8IFwiL1wiLFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogXCI6OlwiLFxyXG4gICAgcG9ydDogODA4MCxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICBsb2NhbENNU1BsdWdpbigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pIGFzIFBsdWdpbltdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZXLFNBQVMsb0JBQTRCO0FBQ2xaLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBQ2YsU0FBUyx1QkFBdUI7QUFKaEMsSUFBTSxtQ0FBbUM7QUFNekMsU0FBUyxpQkFBeUI7QUFDaEMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsYUFBTyxZQUFZLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUztBQUN6QyxZQUFJLENBQUMsSUFBSSxLQUFLLFdBQVcsbUJBQW1CLEVBQUcsUUFBTyxLQUFLO0FBRTNELGNBQU0sV0FBVyxLQUFLLFFBQVEsa0NBQVcsOEJBQThCO0FBRXZFLFlBQUksSUFBSSxXQUFXLE9BQU87QUFDeEIsY0FBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsY0FBSSxJQUFJLEdBQUcsYUFBYSxRQUFRLENBQUM7QUFDakM7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLFdBQVcsUUFBUTtBQUN6QixjQUFJLE9BQU87QUFDWCxjQUFJLEdBQUcsUUFBUSxDQUFDLFVBQVU7QUFDeEIsb0JBQVEsTUFBTSxTQUFTO0FBQUEsVUFDekIsQ0FBQztBQUNELGNBQUksR0FBRyxPQUFPLE1BQU07QUFDbEIsa0JBQU0sU0FBUyxLQUFLLE1BQU0sSUFBSTtBQUM5QixrQkFBTSxPQUFPLEtBQUssTUFBTSxHQUFHLGFBQWEsVUFBVSxPQUFPLENBQUM7QUFDMUQsaUJBQUssUUFBUSxNQUFNO0FBQ25CLGVBQUcsY0FBYyxVQUFVLEtBQUssVUFBVSxNQUFNLE1BQU0sQ0FBQyxDQUFDO0FBQ3hELGdCQUFJLFVBQVUsZ0JBQWdCLGtCQUFrQjtBQUNoRCxnQkFBSSxJQUFJLEtBQUssVUFBVSxNQUFNLENBQUM7QUFBQSxVQUNoQyxDQUFDO0FBQ0Q7QUFBQSxRQUNGO0FBRUEsWUFBSSxJQUFJLFdBQVcsVUFBVTtBQUMzQixnQkFBTSxLQUFLLElBQUksSUFBSSxNQUFNLEdBQUcsRUFBRSxJQUFJO0FBQ2xDLGdCQUFNLE9BQU8sS0FBSyxNQUFNLEdBQUcsYUFBYSxVQUFVLE9BQU8sQ0FBQztBQUMxRCxnQkFBTSxXQUFXLEtBQUssT0FBTyxDQUFDLE1BQVcsRUFBRSxPQUFPLEVBQUU7QUFDcEQsYUFBRyxjQUFjLFVBQVUsS0FBSyxVQUFVLFVBQVUsTUFBTSxDQUFDLENBQUM7QUFDNUQsY0FBSSxhQUFhO0FBQ2pCLGNBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxTQUFTLEtBQUssQ0FBQyxDQUFDO0FBQ3pDO0FBQUEsUUFDRjtBQUVBLGFBQUs7QUFBQSxNQUNQLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxNQUFNLFFBQVEsSUFBSSxrQkFBa0I7QUFBQSxFQUNwQyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUMsZUFBZTtBQUFBLEVBQ2pCLEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLEVBQUU7IiwKICAibmFtZXMiOiBbXQp9Cg==
