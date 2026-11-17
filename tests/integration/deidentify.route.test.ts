import { describe, expect, it } from "@jest/globals";

import request from "supertest";

import { createApp } from "../../src/app";

const app = createApp();

describe("POST /deidentify", () => {
  it("should successfully de-identify email and phone", async () => {
    const response = await request(app)
      .post("/deidentify")
      .send({
        text: "Contact john.doe@example.com at +1-415-555-0134",
        entities: ["EMAIL", "PHONE"],
      });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      deidentifiedText: "Contact [EMAIL] at [PHONE]",
      entitiesDetected: {
        EMAIL: 1,
        PHONE: 1,
      },
    });
  });

  it("should process all supported entities when entities is omitted", async () => {
    const response = await request(app).post("/deidentify").send({
      text: "Contact john@example.com",
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      deidentifiedText: "Contact [EMAIL]",
      entitiesDetected: {
        EMAIL: 1,
      },
    });
  });

  it("should return an empty result when entities is empty", async () => {
    const response = await request(app).post("/deidentify").send({
      text: "Contact john@example.com",
      entities: [],
    });

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      deidentifiedText: "Contact john@example.com",
      entitiesDetected: {},
    });
  });

  it("should reject missing text", async () => {
    const response = await request(app)
      .post("/deidentify")
      .send({
        entities: ["EMAIL"],
      });

    expect(response.status).toBe(400);

    expect(response.body.error.code).toBe("INVALID_TEXT");
  });

  it("should reject empty text", async () => {
    const response = await request(app).post("/deidentify").send({
      text: "   ",
    });

    expect(response.status).toBe(400);

    expect(response.body.error.code).toBe("INVALID_TEXT");
  });

  it("should reject non-string text", async () => {
    const response = await request(app).post("/deidentify").send({
      text: 12345,
    });

    expect(response.status).toBe(400);
  });

  it("should reject invalid entity values", async () => {
    const response = await request(app)
      .post("/deidentify")
      .send({
        text: "Contact john@example.com",
        entities: ["EMAIL", "UNKNOWN"],
      });

    expect(response.status).toBe(400);

    expect(response.body.error.code).toBe("UNSUPPORTED_ENTITY");
  });

  it("should reject entities when they are not supplied as an array", async () => {
    const response = await request(app).post("/deidentify").send({
      text: "Contact john@example.com",
      entities: "EMAIL",
    });

    expect(response.status).toBe(400);
  });

  it("should reject an invalid JSON request body", async () => {
    const response = await request(app)
      .post("/deidentify")
      .set("Content-Type", "application/json")
      .send("{ invalid json");

    expect(response.status).toBe(400);

    expect(response.body.error.code).toBe("INVALID_JSON");
  });

  it("should return 404 for an unknown endpoint", async () => {
    const response = await request(app).post("/unknown");

    expect(response.status).toBe(404);

    expect(response.body.error.code).toBe("NOT_FOUND");
  });
});
