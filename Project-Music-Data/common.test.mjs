import assert from "node:assert";
import test from "node:test";
import { countUsers, sumBy } from "./common.mjs";

test("User count is correct", () => {
  assert.equal(countUsers(), 4);
});

test("sumBy correctly sums values by key", () => {
  const data = [
    { category: "rock", duration: 30 },
    { category: "pop", duration: 20 },
    { category: "rock", duration: 40 },
  ];

  const result = sumBy(
    data,
    (item) => item.category,
    (item) => item.duration
  );

  assert.deepStrictEqual(result, {
    rock: 70,
    pop: 20,
  });
});
