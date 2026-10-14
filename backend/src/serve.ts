import { pathToFileURL } from "node:url";
import { env } from "./env";
import app from "./app";

export async function startServer() {
  try {
    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });

    console.log(`Server is running on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  startServer();
}
