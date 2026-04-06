import { handleRequest } from "./app.js";
import { middleware } from "./middleware.js";

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";
const isProduction = process.env.NODE_ENV === "production" || process.env.SECURITY_MODE === "restricted";

if (!globalThis.Bun?.serve) {
  throw new Error("This entrypoint must be started with Bun.");
}

Bun.serve({
  port,
  hostname,
  fetch(request) {
    return middleware(request, handleRequest, isProduction ? "production" : "development");
  }
});

console.log(`Bun server listening on http://${hostname}:${port}`);
