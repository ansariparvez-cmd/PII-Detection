import { describe, expect, it } from "@jest/globals";

import { detectEntities } from "../../src/detectors/entity-detector";

describe("Entity Detector", () => {
  describe("EMAIL detection", () => {
    it("should detect a valid email address", () => {
      const text = "Contact john.doe@example.com today.";

      const result = detectEntities(text);

      const emails = result.filter((item) => item.entity === "EMAIL");

      expect(emails).toHaveLength(1);

      expect(emails[0]?.value).toBe("john.doe@example.com");
    });

    it("should detect multiple email addresses", () => {
      const text = "john@example.com and jane@example.org";

      const result = detectEntities(text);

      const emails = result.filter((item) => item.entity === "EMAIL");

      expect(emails).toHaveLength(2);
    });

    it("should not detect malformed email addresses", () => {
      const text = "Invalid: john..doe@example.com";

      const result = detectEntities(text);

      expect(result.filter((item) => item.entity === "EMAIL")).toHaveLength(0);
    });
  });

  describe("PHONE detection", () => {
    it("should detect multiple common phone formats", () => {
      const text =
        "Call +1-415-555-0134, " + "(415) 555-0199 or +91 98765 43210.";

      const result = detectEntities(text);

      const phones = result.filter((item) => item.entity === "PHONE");

      expect(phones).toHaveLength(3);

      expect(phones.map((item) => item.value)).toEqual([
        "+1-415-555-0134",
        "(415) 555-0199",
        "+91 98765 43210",
      ]);
    });

    it("should reject short ordinary numbers", () => {
      const text = "Order ID: 12345, PIN: 8342, ZIP: 90210";

      const result = detectEntities(text);

      expect(result.filter((item) => item.entity === "PHONE")).toHaveLength(0);
    });

    it("should reject repeated-digit phone candidates", () => {
      const text = "Phone: 1111111111";

      const result = detectEntities(text);

      expect(result.filter((item) => item.entity === "PHONE")).toHaveLength(0);
    });
  });

  describe("SSN detection", () => {
    it("should detect a valid-format SSN", () => {
      const text = "SSN: 123-45-6789";

      const result = detectEntities(text);

      const ssns = result.filter((item) => item.entity === "SSN");

      expect(ssns).toHaveLength(1);
      expect(ssns[0]?.value).toBe("123-45-6789");
    });

    it("should reject invalid SSN ranges", () => {
      const text = "000-12-3456, 666-12-3456, 900-12-3456";

      const result = detectEntities(text);

      expect(result.filter((item) => item.entity === "SSN")).toHaveLength(0);
    });
  });

  describe("DATE_OF_BIRTH detection", () => {
    it("should detect ISO date following DOB context", () => {
      const text = "DOB: 1990-05-12";

      const result = detectEntities(text);

      const dates = result.filter((item) => item.entity === "DATE_OF_BIRTH");

      expect(dates).toHaveLength(1);

      expect(dates[0]?.value).toBe("1990-05-12");
    });

    it("should detect US date following Date of Birth context", () => {
      const text = "Date of Birth: 02/29/2024";

      const result = detectEntities(text);

      const dates = result.filter((item) => item.entity === "DATE_OF_BIRTH");

      expect(dates).toHaveLength(1);
    });

    it("should reject an invalid calendar date", () => {
      const text = "DOB: 2023-02-29";

      const result = detectEntities(text);

      expect(
        result.filter((item) => item.entity === "DATE_OF_BIRTH"),
      ).toHaveLength(0);
    });

    it("should not detect a date without DOB context", () => {
      const text = "Meeting date: 1990-05-12";

      const result = detectEntities(text);

      expect(
        result.filter((item) => item.entity === "DATE_OF_BIRTH"),
      ).toHaveLength(0);
    });
  });

  describe("CREDIT_CARD detection", () => {
    it("should detect a Luhn-valid credit card number", () => {
      const text = "Card: 4111 1111 1111 1111";

      const result = detectEntities(text);

      const cards = result.filter((item) => item.entity === "CREDIT_CARD");

      expect(cards).toHaveLength(1);
    });

    it("should reject a number failing Luhn validation", () => {
      const text = "Card: 4111 1111 1111 1112";

      const result = detectEntities(text);

      expect(
        result.filter((item) => item.entity === "CREDIT_CARD"),
      ).toHaveLength(0);
    });
  });

  describe("IP_ADDRESS detection", () => {
    it("should detect a valid IPv4 address", () => {
      const text = "Server IP: 192.168.1.10";

      const result = detectEntities(text);

      const addresses = result.filter((item) => item.entity === "IP_ADDRESS");

      expect(addresses).toHaveLength(1);

      expect(addresses[0]?.value).toBe("192.168.1.10");
    });

    it("should reject invalid IPv4 octets", () => {
      const text = "Invalid IP: 999.168.1.10";

      const result = detectEntities(text);

      expect(
        result.filter((item) => item.entity === "IP_ADDRESS"),
      ).toHaveLength(0);

      expect(result.filter((item) => item.entity === "PHONE")).toHaveLength(0);
    });

    it("should reject IPv4 addresses with unnecessary leading zeros", () => {
      const text = "Invalid IP: 192.168.001.10";

      const result = detectEntities(text);

      expect(
        result.filter((item) => item.entity === "IP_ADDRESS"),
      ).toHaveLength(0);
    });
  });
});
