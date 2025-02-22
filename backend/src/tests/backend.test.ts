import request from "supertest";
import app from "../app";
import { expect, test, describe } from "@jest/globals";

describe("Backend tests", () => {
  test("GET /", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/html|json/);
    console.log(res.body);
    expect(res.body).toBe("Hello World!");
  });

  test("GET /api/tweets", async () => {
    const res = await request(app).get("/api/tweets");
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
