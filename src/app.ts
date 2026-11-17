import express, { type Express } from "express";

import deidentifyRoutes from "./routes/deidentify.routes";

import {
  notFoundHandler,
  errorHandler,
} from "./middleware/error-handler.middleware";

import { JSON_BODY_LIMIT } from "./config/app-config";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(
    express.json({
      limit: JSON_BODY_LIMIT,
      strict: true,
    }),
  );

  app.use("/deidentify", deidentifyRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
