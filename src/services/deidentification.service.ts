import {
  ENTITY_TYPES,
  type DeidentificationResult,
  type EntityType,
} from "../types/entity.types";

import { detectEntities } from "../detectors/entity-detector";

/**
 * De-identifies sensitive information in the given text.
 *
 * @param text Original input text.
 * @param requestedEntities Entity types to replace.
 * @returns De-identified text and detection counts.
 */

export function deidentifyText(
  text: string,
  requestedEntities: readonly EntityType[] = ENTITY_TYPES,
): DeidentificationResult {
  const selectedEntities = new Set(requestedEntities);

  const detections = detectEntities(text);

  const selectedDetections = detections.filter((detection) =>
    selectedEntities.has(detection.entity),
  );

  const entityCounts: Partial<Record<EntityType, number>> = {};
  const output: string[] = [];
  let cursor = 0;

  for (const detection of selectedDetections) {
    output.push(text.slice(cursor, detection.start));

    output.push(`[${detection.entity}]`);

    entityCounts[detection.entity] = (entityCounts[detection.entity] ?? 0) + 1;

    cursor = detection.end;
  }

  output.push(text.slice(cursor));

  return {
    deidentifiedText: output.join(""),
    entitiesDetected: entityCounts,
  };
}
