import { MAX_TEXT_LENGTH } from "../config/app-config";
import {
  DeidentifyRequest,
  ENTITY_TYPES,
  EntityType,
  isEntityType,
} from "../types/entity.types";
import { AppError } from "./app-error";

export function validateRequestBody(body: unknown): DeidentifyRequest {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new AppError(400, "INVALID_REQUEST", "Invalid request body");
  }

  const payload = body as Record<string, unknown>;

  if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
    throw new AppError(
      400,
      "INVALID_TEXT",
      "Text is required and must not be empty.",
    );
  }

  if (payload.text.length > MAX_TEXT_LENGTH) {
    throw new AppError(
      413,
      "TEXT_TOO_LARGE",
      `Text must not exceed ${MAX_TEXT_LENGTH} UTF-16 code units.`,
    );
  }

  let entities: EntityType[] = [...ENTITY_TYPES];

  if (Object.prototype.hasOwnProperty.call(payload, "entities")) {
    if (!Array.isArray(payload.entities)) {
      throw new AppError(
        400,
        "INVALID_ENTITIES",
        "Entities must be an array of supported entity types.",
      );
    }

    const invalidEntities = payload.entities.filter(
      (entity) => !isEntityType(entity),
    );

    if (invalidEntities.length > 0) {
      throw new AppError(
        400,
        "UNSUPPORTED_ENTITY",
        `Unsupported entity types: ${invalidEntities.join(", ")}.`,
      );
    }

    entities = [...new Set(payload.entities as EntityType[])];
  }

  return {
    text: payload.text,
    entities,
  };
}
