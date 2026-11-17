import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("Invalid PORT configuration.");
}

const app = createApp();

const server = app.listen(PORT, () => {
  console.info(`De-identification service running on port ${PORT}`);
});

function shutdown(signal: NodeJS.Signals): void {
  console.info(`Received ${signal}. Shutting down server.`);
  server.close((error) => {
    if (error) {
      console.error("Server shutdonw failed");
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));
