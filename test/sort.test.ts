import ytl from "../src/index";
import { assert } from "chai";

describe("sort", () => {
  it("quick", () => {
    assert.deepStrictEqual(ytl.sort.quick([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.quick([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.quick([1, 2, 3]), [1, 2, 3]);
  });

  it("insert", () => {
    assert.deepStrictEqual(ytl.sort.insert([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.insert([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.insert([1, 2, 3]), [1, 2, 3]);
  });

  it("insert_shell", () => {
    assert.deepStrictEqual(ytl.sort.insert_shell([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.insert_shell([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.insert_shell([1, 2, 3]), [1, 2, 3]);
  });

  it("select", () => {
    assert.deepStrictEqual(ytl.sort.select([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.select([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.select([1, 2, 3]), [1, 2, 3]);
  });

  it("bubble", () => {
    assert.deepStrictEqual(ytl.sort.bubble([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.bubble([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.bubble([1, 2, 3]), [1, 2, 3]);
  });

  it("heap", () => {
    assert.deepStrictEqual(ytl.sort.heap([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.heap([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.heap([1, 2, 3]), [1, 2, 3]);
  });

  it("merge", () => {
    assert.deepStrictEqual(ytl.sort.merge([3, 2, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.merge([2, 3, 1]), [1, 2, 3]);
    assert.deepStrictEqual(ytl.sort.merge([1, 2, 3]), [1, 2, 3]);
  });
})
