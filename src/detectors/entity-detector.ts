import path from "path";
import type { EntityDetection, EntityType } from "../types/entity.types";

import { isValidDate } from "../utils/date-validator";
import { isValidLuhnNumber } from "../utils/luhn";

/**
 * Detection patterns
 */

// EMAIL
const EMAIL_PATTERN =
  /(?<![\p{L}\p{N}._%+-])[\p{L}\p{N}][\p{L}\p{N}._%+-]*@(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?\.)+[A-Za-z]{2,63}(?![\p{L}\p{N}_-])/gu;

// PHONE
const PHONE_PATTERN =
  /(?<![\p{L}\p{N}])\+?(?:\(\d{2,4}\)|\d)[\d \t().-]{5,}\d(?![\p{L}\p{N}])/gu;

// SSN
const SSN_PATTERN = /(?<![\p{L}\p{N}])\d{3}-\d{2}-\d{4}(?![\p{L}\p{N}])/gu;

// DATE OF BIRTH
const DOB_PATTERN =
  /(?<![\p{L}\p{N}])(?:DOB|D\.O\.B\.|DATE\s+OF\s+BIRTH|BIRTH\s+DATE)\s*[:=-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})(?![\p{L}\p{N}])/giu;

// CREDIT CARD
const CREDIT_CARD_PATTERN =
  /(?<![\p{L}\p{N}])(?:\d[ -]?){12,18}\d(?![\p{L}\p{N}])/gu;

// IP ADDRESS
const IP_ADDRESS_PATTERN =
  /(?<![\p{L}\p{N}.])(?:\d{1,3}\.){3}\d{1,3}(?![\p{L}\p{N}.])/gu;

const ENTITY_PRIORITY: Record<EntityType, number> = {
  CREDIT_CARD: 60,
  SSN: 50,
  IP_ADDRESS: 40,
  DATE_OF_BIRTH: 30,
  EMAIL: 20,
  PHONE: 10,
};

function createDetection(
  entity: EntityType,
  value: string,
  start: number,
): EntityDetection {
  return {
    entity,
    value,
    start,
    end: start + value.length,
  };
}

function isValidEmail(value: string): boolean {
  const parts = value.split("@");

  if (parts.length !== 2) {
    return false;
  }

  const localPart = parts[0] ?? "";
  const domain = parts[1] ?? "";

  if (
    localPart.length === 0 ||
    localPart.length > 64 ||
    domain.length === 0 ||
    domain.length > 253
  ) {
    return false;
  }

  if (
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return false;
  }

  const labels = domain.split(".");

  if (labels.length < 2) {
    return false;
  }

  const domainLabelPattern = /^[\p{L}\p{N}](?:[\p{L}\p{N}-]*[\p{L}\p{N}])?$/u;

  return (
    labels.every(
      (label) => label.length <= 63 && domainLabelPattern.test(label),
    ) && (labels[labels.length - 1]?.length ?? 0) >= 2
  );
}

/**
 * PHONE VALIDATION
 */
function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    return false;
  }

  // Reject numbers consisting of only repeated digits.
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }

  // Avoid interpreting an IPv4-shaped value as a phone number,
  // even when that IPv4 address is invalid.
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(value)) {
    return false;
  }

  // Avoid interpreting common numeric date formats as phone numbers.
  if (
    /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(value) ||
    /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}$/.test(value)
  ) {
    return false;
  }

  return true;
}

/**
 * SSN VALIDATION
 */
function isValidSSN(value: string): boolean {
  const parts = value.split("-");

  if (parts.length !== 3) {
    return false;
  }

  const area = parts[0] ?? "";
  const group = parts[1] ?? "";
  const serial = parts[2] ?? "";

  if (
    area === "000" ||
    area === "666" ||
    Number(area) >= 900 ||
    group === "00" ||
    serial === "0000"
  ) {
    return false;
  }

  return true;
}

/**
 * IP ADDRESS VALIDATION
 */
function isValidIPAddress(value: string): boolean {
  const parts = value.split(".");

  if (parts.length !== 4) {
    return false;
  }

  return parts.every((part) => {
    if (
      part.length === 0 ||
      part.length > 3 ||
      (part.length > 1 && part.startsWith("0"))
    ) {
      return false;
    }

    const octet = Number(part);

    return Number.isInteger(octet) && octet >= 0 && octet <= 255;
  });
}

/**
 * Detect EMAIL entities.
 */

function detectEmails(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(EMAIL_PATTERN)) {
    const value = match[0];

    if (match.index === undefined || !isValidEmail(value)) {
      continue;
    }

    detections.push(createDetection("EMAIL", value, match.index));
  }
  return detections;
}

/**
 * Detect PHONE entities.
 */
function detectPhones(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(PHONE_PATTERN)) {
    const value = match[0];

    if (match.index === undefined || !isValidPhone(value)) {
      continue;
    }

    detections.push(createDetection("PHONE", value, match.index));
  }

  return detections;
}

/**
 * Detect SSN entities.
 */
function detectSSNs(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(SSN_PATTERN)) {
    const value = match[0];

    if (match.index === undefined || !isValidSSN(value)) {
      continue;
    }

    detections.push(createDetection("SSN", value, match.index));
  }

  return detections;
}

/**
 * Detect DATE_OF_BIRTH entities.
 *
 * Only dates following recognizable DOB-related
 * labels will be detected.
 */
function detectDatesOfBirth(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(DOB_PATTERN)) {
    const fullMatch = match[0] ?? "";
    const value = match[1];

    if (match.index === undefined || !value || !isValidDate(value)) {
      continue;
    }

    // Capture only the date, not the DOB label.
    const relativeStart = fullMatch.lastIndexOf(value);

    const start = match.index + relativeStart;

    detections.push(createDetection("DATE_OF_BIRTH", value, start));
  }

  return detections;
}

/**
 * Detect CREDIT_CARD entities.
 *
 * Luhn validation is mandatory.
 */
function detectCreditCards(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(CREDIT_CARD_PATTERN)) {
    const value = match[0];

    if (match.index === undefined) {
      continue;
    }

    const digits = value.replace(/\D/g, "");

    if (!isValidLuhnNumber(digits)) {
      continue;
    }

    detections.push(createDetection("CREDIT_CARD", value, match.index));
  }

  return detections;
}

/**
 * Detect IPv4 addresses.
 */
function detectIPAddresses(text: string): EntityDetection[] {
  const detections: EntityDetection[] = [];

  for (const match of text.matchAll(IP_ADDRESS_PATTERN)) {
    const value = match[0];

    if (match.index === undefined || !isValidIPAddress(value)) {
      continue;
    }

    detections.push(createDetection("IP_ADDRESS", value, match.index));
  }

  return detections;
}

/**
 * Resolves overlapping detection ranges.
 *
 * Higher-priority entities take precedence.
 * No accepted detection can overlap another.
 */

function resolveOverlaps(
  candidates: EntityDetection[],
  textLength: number,
): EntityDetection[] {
  const sortedCandidates = [...candidates].sort((a, b) => {
    const priorityDifference =
      ENTITY_PRIORITY[b.entity] - ENTITY_PRIORITY[a.entity];

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    if (a.start !== b.start) {
      return a.start - b.start;
    }

    return b.end - b.start - (a.end - a.start);
  });

  const occupied = new Uint8Array(textLength);

  const accepted: EntityDetection[] = [];

  for (const candidate of sortedCandidates) {
    let overlapse = false;

    for (let position = candidate.start; position < candidate.end; position++) {
      if (occupied[position] === 1) {
        overlapse = true;
        break;
      }
    }
    if (overlapse) {
      continue;
    }

    for (let position = candidate.start; position < candidate.end; position++) {
      occupied[position] = 1;
    }
    accepted.push(candidate);
  }

  return accepted.sort((a, b) => a.start - b.start);
}

/**
 * Main detection function.
 *
 * This function always detects all supported entities.
 * Entity filtering happens later in the de-identification service.
 */

export function detectEntities(text: string): EntityDetection[] {
  const candidates: EntityDetection[] = [
    ...detectEmails(text),
    ...detectPhones(text),
    ...detectSSNs(text),
    ...detectDatesOfBirth(text),
    ...detectCreditCards(text),
    ...detectIPAddresses(text),
  ];

  return resolveOverlaps(candidates, text.length);
}
