import { describe, expect, it } from "@jest/globals";

import { deidentifyText } from "../../src/services/deidentification.service";

describe("De-identification Service", () => {
  it("should replace EMAIL and PHONE entities", () => {
    const text = "Contact john.doe@example.com at +1-415-555-0134";

    const result = deidentifyText(text, ["EMAIL", "PHONE"]);

    expect(result.deidentifiedText).toBe("Contact [EMAIL] at [PHONE]");

    expect(result.entitiesDetected).toEqual({
      EMAIL: 1,
      PHONE: 1,
    });
  });

  it("should replace multiple occurrences of the same entity", () => {
    const text = "Contact john@example.com or jane@example.com";

    const result = deidentifyText(text, ["EMAIL"]);

    expect(result.deidentifiedText).toBe("Contact [EMAIL] or [EMAIL]");

    expect(result.entitiesDetected).toEqual({
      EMAIL: 2,
    });
  });

  it("should replace all supported entities by default", () => {
    const text =
      "Email john@example.com, phone +1-415-555-0134, " +
      "SSN 123-45-6789, DOB: 1990-05-12, " +
      "Card 4111 1111 1111 1111, IP 192.168.1.10";

    const result = deidentifyText(text);

    expect(result.deidentifiedText).toBe(
      "Email [EMAIL], phone [PHONE], " +
        "SSN [SSN], DOB: [DATE_OF_BIRTH], " +
        "Card [CREDIT_CARD], IP [IP_ADDRESS]",
    );

    expect(result.entitiesDetected).toEqual({
      EMAIL: 1,
      PHONE: 1,
      SSN: 1,
      DATE_OF_BIRTH: 1,
      CREDIT_CARD: 1,
      IP_ADDRESS: 1,
    });
  });

  it("should leave unselected entities unchanged", () => {
    const text = "Contact john@example.com or +1-415-555-0134";

    const result = deidentifyText(text, ["EMAIL"]);

    expect(result.deidentifiedText).toBe("Contact [EMAIL] or +1-415-555-0134");

    expect(result.entitiesDetected).toEqual({
      EMAIL: 1,
    });
  });

  it("should not replace anything when entity list is empty", () => {
    const text = "Contact john@example.com";

    const result = deidentifyText(text, []);

    expect(result.deidentifiedText).toBe(text);

    expect(result.entitiesDetected).toEqual({});
  });

  it("should preserve punctuation and line breaks", () => {
    const text = "नमस्ते,\nContact john@example.com!\nKeep this sentence. 🚀";

    const result = deidentifyText(text, ["EMAIL"]);

    expect(result.deidentifiedText).toBe(
      "नमस्ते,\nContact [EMAIL]!\nKeep this sentence. 🚀",
    );
  });

  it("should not modify text containing no sensitive entities", () => {
    const text = "This is an ordinary sentence without PII.";

    const result = deidentifyText(text);

    expect(result.deidentifiedText).toBe(text);

    expect(result.entitiesDetected).toEqual({});
  });

  it("should not classify a credit card as a phone when only PHONE is selected", () => {
    const text = "4111 1111 1111 1111";

    const result = deidentifyText(text, ["PHONE"]);

    expect(result.deidentifiedText).toBe(text);

    expect(result.entitiesDetected).toEqual({});
  });
});
