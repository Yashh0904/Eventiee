import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("Auth Middleware Protection", () => {
  it("should return 401 when accessing protected routes without a token", async () => {
    const response = await request(app).get("/api/order/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      accessTokenPresent: false,
    });
  })
})

describe("Auth Email Check", () => {
  it("should return 400 when when invalid email used", async () => {
    const data = {
      "name": "Test User",
      "email": "not-a-valid-email",
      "password": "123"
    }

    const response = (await request(app).post("/api/auth/register").send(data));

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors.email).toContain("Please enter a valid email address");
  })
})