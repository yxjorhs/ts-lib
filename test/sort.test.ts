import { sort } from "../src/index";
import { assert } from "chai";

test("quick", () => {
  assert.deepStrictEqual(sort.quick([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.quick([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.quick([1, 2, 3]), [1, 2, 3]);
});

test("insert", () => {
  assert.deepStrictEqual(sort.insert([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.insert([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.insert([1, 2, 3]), [1, 2, 3]);
});

test("insert_shell", () => {
  assert.deepStrictEqual(sort.insert_shell([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.insert_shell([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.insert_shell([1, 2, 3]), [1, 2, 3]);
});

test("select", () => {
  assert.deepStrictEqual(sort.select([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.select([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.select([1, 2, 3]), [1, 2, 3]);
});

test("bubble", () => {
  assert.deepStrictEqual(sort.bubble([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.bubble([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.bubble([1, 2, 3]), [1, 2, 3]);
});

test("heap", () => {
  assert.deepStrictEqual(sort.heap([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.heap([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.heap([1, 2, 3]), [1, 2, 3]);
});

test("merge", () => {
  assert.deepStrictEqual(sort.merge([3, 2, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.merge([2, 3, 1]), [1, 2, 3]);
  assert.deepStrictEqual(sort.merge([1, 2, 3]), [1, 2, 3]);
});