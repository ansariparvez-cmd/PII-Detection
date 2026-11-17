# Rule-Based Text De-identification Service

A lightweight Node.js and TypeScript service that identifies
and de-identifies common sensitive information using
regular expressions and custom validation logic.

No external PII detection APIs or prebuilt PII detection
libraries are used.

## 1. Technology Stack

- Node.js 24
- TypeScript
- Express 5
- Jest
- Supertest
- Regular Expressions
- Custom Validation Functions

## 2. Supported Entities

| Entity | Description |
|---|---|
| EMAIL | Email addresses |
| PHONE | Common phone number formats |
| SSN | US Social Security numbers |
| DATE_OF_BIRTH | Dates in recognizable DOB contexts |
| CREDIT_CARD | Credit card number candidates |
| IP_ADDRESS | IPv4 addresses |

## 3. Project Structure

```text
src/
  config/
  controllers/
  detectors/
  middleware/
  routes/
  services/
  types/
  utils/
  app.ts
  server.ts

tests/
  unit/
  integration/
```

## 4. Installation

Install dependencies:

```bash
npm install
```

## 5. Running in Development

```bash
npm run dev
```

The application starts at:

http://localhost:3000

## 6. Build

Compile TypeScript:

```bash
npm run build
```

Compiled files are generated inside the `dist` directory.

## 7. Run Production Build

```bash
npm start
```

## 8. Run Tests

Execute all tests:

```bash
npm test
```

Execute tests in watch mode:

```bash
npm run test:watch
```

Generate coverage:

```bash
npm run test:coverage
```

Run TypeScript validation:

```bash
npm run typecheck
```

## 9. API Documentation

### POST /deidentify

Accepts text and an optional list of entity types.

### Request

```json
{
  "text": "Contact john.doe@example.com at +1-415-555-0134",
  "entities": ["EMAIL", "PHONE"]
}
```

### Response

```json
{
  "deidentifiedText": "Contact [EMAIL] at [PHONE]",
  "entitiesDetected": {
    "EMAIL": 1,
    "PHONE": 1
  }
}
```

### Supported Entity Values

- EMAIL
- PHONE
- SSN
- DATE_OF_BIRTH
- CREDIT_CARD
- IP_ADDRESS

### Default Behavior

When entities is omitted, all supported entities are processed.

An explicitly empty entity list means no entities should
be de-identified.

Detection counts include only entity types that were
actually detected and replaced.

## 10. Detection Rules and Limitations

### EMAIL

Uses a regular expression supporting common email
addresses, including Unicode letters in local parts
and domain labels.

Validation checks domain labels, local-part length,
and consecutive or leading/trailing dots.

Limitations:
- Quoted email local parts are unsupported.
- Some valid RFC-compliant edge cases are not supported.
- The supported top-level domain pattern is limited.

### PHONE

Supports 10 to 15 digits in common formats, including
international country codes, spaces, hyphens, dots,
and parentheses.

Limitations:
- Short local telephone numbers are not detected.
- Extensions are not separately recognized.
- Long numeric identifiers may resemble phone numbers.
- Full international numbering-plan validation is not implemented.

### SSN

Matches XXX-XX-XXXX.

Rejects reserved or invalid area, group, and serial ranges.

Limitations:
- Only the specified US SSN format is supported.
- Other country-specific identification numbers are unsupported.

### DATE_OF_BIRTH

Matches dates appearing after recognizable labels:

- DOB
- D.O.B.
- Date of Birth
- Birth Date

Supports:
- YYYY-MM-DD
- MM/DD/YYYY

Uses calendar validation, including leap-year checks.

Limitations:
- Dates without recognizable DOB context are not detected.
- Ambiguous slash-separated dates are interpreted as MM/DD/YYYY.
- Other date formats are not supported.

### CREDIT_CARD

Detects 13 to 19 digit candidates separated by spaces
or hyphens.

Luhn validation is required.

Limitations:
- Luhn validation does not prove that a card exists.
- Not every payment card numbering standard is explicitly modeled.
- Some non-card numbers can coincidentally pass the checksum.

### IP_ADDRESS

Detects IPv4 addresses and validates each octet.

Each octet must be between 0 and 255.

Leading zeros are rejected, except for the value 0.

Limitations:
- IPv6 is unsupported.
- IP addresses with leading-zero octets are rejected.
- Network address semantics and routability are not validated.

## 11. Overlapping Detection Rules

The detector assigns priorities to entity types.

CREDIT_CARD > SSN > IP_ADDRESS > DATE_OF_BIRTH > EMAIL > PHONE

Only non-overlapping detections are accepted.

This prevents the same section of text from being replaced
more than once.

## 12. Error Handling

The API returns appropriate HTTP status codes:

- 400: Invalid request
- 404: Route not found
- 413: Request or text exceeds size limits
- 500: Unexpected application error

## 13. Design Decisions

1. Detection and replacement are separate operations.
2. Each entity has an independent detection function.
3. Custom validation supplements regular expressions.
4. Detection offsets preserve original text.
5. Overlapping matches are resolved before replacement.
6. Entity selection is controlled by the API caller.
7. The application processes data locally without external
   PII detection or de-identification APIs.
8. Invalid requests are rejected instead of silently ignored.

## 14. Known Limitations

This is a deterministic, rule-based implementation.

It cannot guarantee complete PII detection in arbitrary
free-form text.

A number can resemble a phone number, and a valid-looking
email or card number may still be incorrectly classified.

Names are intentionally not detected because reliable
free-form name recognition is not achievable with these
regular expressions alone.

This implementation should not be treated as a guaranteed
privacy or regulatory compliance boundary.

Before production use with sensitive datasets, detection
coverage must be evaluated against representative data,
with additional security controls and appropriate review.