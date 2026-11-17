export const ENTITY_TYPES = [
  "EMAIL",
  "PHONE",
  "SSN",
  "DATE_OF_BIRTH",
  "CREDIT_CARD",
  "IP_ADDRESS",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export interface EntityDetection {
  entity: EntityType;
  value: string;
  start: number;
  end: number;
}

export interface DeidentificationResult {
  deidentifiedText: string;
  entitiesDetected: Partial<Record<EntityType, number>>;
}

export function isEntityType(value: unknown): value is EntityType {
  return (
    typeof value === "string" && ENTITY_TYPES.includes(value as EntityType)
  );
}

export interface DeidentifyRequest {
  text: string;
  entities: EntityType[];
}
