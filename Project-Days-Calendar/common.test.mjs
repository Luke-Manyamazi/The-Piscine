import { getCommemorativeDatesForYear } from "./common.mjs";
import assert from "node:assert";
import test from "node:test";

test("getCommemorativeDatesForYear returns expected structure", () => {
  const result = getCommemorativeDatesForYear(2024);
  assert.ok(typeof result === "object", "Result should be an object");

  
  assert.strictEqual(result["2024-10-08"], "Ada Lovelace Day");
  
});
