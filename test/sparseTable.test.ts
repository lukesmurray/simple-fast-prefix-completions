import { SparseTable } from "../src/sparseTable";

describe("sparseTable", () => {
  it("computes ranges correctly", () => {
    // example from https://youtu.be/uUatD9AudXo?t=789
    const input = [4, 2, 3, 7, 1, 5, 3, 3, 9, 6, 7, -1, 4];
    const f = (a: number, b: number) => Math.min(a, b);
    const table = new SparseTable(input, f);

    // manually check every possible range
    for (let n = 1; n < input.length; n++) {
      for (let i = 0; i < input.length - n + 1; i++) {
        expect(table.rangeQuery(i, i + n)).toBe(
          Math.min(...input.slice(i, i + n))
        );
      }
    }

    expect(table.rangeQuery(0, input.length)).toBe(Math.min(...input));
  });
});
