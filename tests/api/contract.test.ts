import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { createTestClient } from "./client";
import { loadTestConfig } from "./config";
import {
  flattenProtectedGetEndpoints,
  flattenPublicGetEndpoints,
} from "./endpoints.manifest";
import { getSchemaForPath } from "./schemas";

const SKIP = process.env.API_TEST_SKIP !== "0";

describe("API contract tests", { skip: SKIP }, () => {
  const client = createTestClient();
  const config = loadTestConfig();

  before(async () => {
    console.log(`Testing against: ${config.baseUrl} (mode: ${config.serviceMode})`);
    await client.login();
  });

  for (const endpoint of flattenPublicGetEndpoints()) {
    const fullPath = `${endpoint.path}${endpoint.query ?? ""}`;
    it(`GET ${fullPath} returns valid JSON`, async () => {
      const res = await client.get(fullPath, { auth: false });
      assert.ok(res.ok, `Expected 200, got ${res.status} for ${fullPath}`);
      const body = await res.json();
      const schema = getSchemaForPath(endpoint.path);
      if (schema) {
        const parsed = schema.safeParse(body);
        assert.ok(parsed.success, `Schema mismatch for ${fullPath}: ${parsed.error?.message}`);
      }
    });
  }

  for (const endpoint of flattenProtectedGetEndpoints()) {
    const fullPath = `${endpoint.path}${endpoint.query ?? ""}`;
    it(`GET ${fullPath} returns valid JSON (authenticated)`, async () => {
      const res = await client.get(fullPath);
      assert.ok(res.ok, `Expected 200, got ${res.status} for ${fullPath}`);
      const body = await res.json();
      const schema = getSchemaForPath(endpoint.path);
      if (schema) {
        const parsed = schema.safeParse(body);
        assert.ok(parsed.success, `Schema mismatch for ${fullPath}: ${parsed.error?.message}`);
      }
    });
  }
});

describe("API auth contract", { skip: SKIP }, () => {
  const config = loadTestConfig();

  it("POST /auth/check-mobile returns exists + status", async () => {
    const res = await fetch(`${config.baseUrl}/auth/check-mobile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile: config.mobile }),
    });
    assert.equal(res.status, 200);
    const body = (await res.json()) as { exists: boolean; status: string | null };
    assert.equal(typeof body.exists, "boolean");
    assert.ok(body.status === null || typeof body.status === "string");
  });

  it("Protected endpoint returns 401 without token", async () => {
    const res = await fetch(`${config.baseUrl}/wallet/summary`);
    assert.equal(res.status, 401);
    const body = (await res.json()) as { error: string };
    assert.equal(body.error, "unauthorized");
  });
});
