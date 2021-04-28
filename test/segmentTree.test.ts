import { SegmentTree } from "../src/segmentTree";

describe("segment tree", () => {
  it("computes ranges correctly", () => {
    // example from https://youtu.be/uUatD9AudXo?t=789
    const values = [4, 2, 3, 7, 1, 5, 3, 3, 9, 6, 7, -1, 4];
    const f = (a: number, b: number) => Math.min(a, b);
    const tree = new SegmentTree({
      values,
      f
    });

    // manually check every possible range
    for (let n = 1; n < values.length; n++) {
      for (let i = 0; i < values.length - n + 1; i++) {
        expect(tree.rangeQuery(i, i + n)).toBe(
          Math.min(...values.slice(i, i + n))
        );
      }
    }

    expect(tree.rangeQuery(0, values.length)).toBe(Math.min(...values));

    const serialized = tree.toJSON();
    const deserialized = SegmentTree.fromJSON(serialized, f);

    for (let n = 1; n < values.length; n++) {
      for (let i = 0; i < values.length - n + 1; i++) {
        expect(deserialized.rangeQuery(i, i + n)).toBe(
          Math.min(...values.slice(i, i + n))
        );
      }
    }
  });
});
