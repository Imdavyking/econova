import request from "supertest";
import { app } from "../app";

describe("GET /", () => {
  it("should return hello world", async () => {
    request(app)
      .get("/")
      .expect("Content-Type", /json/)
      .expect(200)
      .expect((res) => {
        if (res.body !== "Hello World!")
          throw new Error("Hello World! not returned");
      })
      .end(function (err, res) {
        if (err) throw err;
      });
  });
});

describe("GET /api/tweets", () => {
  it("should return a list of tweets", async () => {
    request(app)
      .get("/api/tweets")
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) throw err;
      });
  });
});
