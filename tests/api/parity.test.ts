/**
 * Parity tests: compare BFF (Prisma mode) responses with external backend (v2).
 *
 * Prerequisites:
 *   1. BFF running locally with API_SERVICE_MODE=mock  → API_TEST_BASE_URL
 *   2. External backend available at API_TEST_BACKEND_URL
 *   3. Same test user credentials work on both
 *
 * Run: API_TEST_SKIP=0 npm run test:api:parity
 */
import { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import { createTestClient } from "./client";
import { loadTestConfig } from "./config";
import { flattenProtectedGetEndpoints } from "./endpoints.manifest";

const SKIP = process.env.API_TEST_SKIP !== "0";

describe("Prisma vs Backend API parity", { skip: SKIP }, () => {
  const client = createTestClient();
  const config = loadTestConfig();

  before(async () => {
    console.log(`Parity: BFF=${config.baseUrl} vs Backend=${config.backendBaseUrl}`);
    await client.login();
  });

  const parityEndpoints = flattenProtectedGetEndpoints().filter(
    (e) =>
      !e.path.includes("/network/funds") &&
      !e.path.includes("/capital/funds") &&
      !e.path.includes("/leaderboard/honors") &&
      !e.path.includes("/leaderboard/history") &&
      !e.path.includes("/dashboard/charts"),
  );

  for (const endpoint of parityEndpoints) {
    const fullPath = `${endpoint.path}${endpoint.query ?? ""}`;
    it(`${fullPath} — BFF and backend return same top-level keys`, async () => {
      const [bffBody, backendBody] = await Promise.all([
        client.getJson<Record<string, unknown>>(fullPath),
        client.getBackendJson<Record<string, unknown>>(endpoint.path + (endpoint.query ?? "")),
      ]);

      const bffKeys = Object.keys(bffBody).sort();
      const backendKeys = Object.keys(backendBody).sort();
      assert.deepEqual(
        bffKeys,
        backendKeys,
        `Key mismatch for ${fullPath}\nBFF: ${bffKeys.join(", ")}\nBackend: ${backendKeys.join(", ")}`,
      );
    });
  }
});
