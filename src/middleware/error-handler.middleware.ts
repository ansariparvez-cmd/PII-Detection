import type { ErrorRequestHandler, RequestHandler } from "express";

import { AppError } from "../utils/app-error";

export const notFoundHandler: RequestHandler = (_req, res): void => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "The requested endpoint was not found",
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req,
  res,
  _next,
): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (typeof error === "object" && error !== null && "type" in error) {
    const errorType = error.type;

    if (errorType === "entity.parse.failed") {
      res.status(400).json({
        error: {
          code: "INVALID_JSON",
          message: "Request body contains invalid JSON.",
        },
      });

      return;
    }

    if (errorType === "entity.too.large") {
      res.status(413).json({
        error: {
          code: "PAYLOAD_TOO_LARGE",
          message: "Request payload exceeds the allowed size.",
        },
      });

      return;
    }
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};
