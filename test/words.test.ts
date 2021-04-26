import fs from "fs";
import { words } from "../perf/words";
import { SuffixArray } from "../src";

const SEPARATOR = "\u0001";

describe("suffix", () => {
  const sa = new SuffixArray({ SEPARATOR, words });

  const debugArray = sa.array.reduce((p, c, i) => {
    const separatorIndex = sa.string.indexOf(sa.SEPARATOR, c + 1);
    p[`${i}_${c}`] = sa.string.substring(
      c,
      separatorIndex !== -1 ? separatorIndex : undefined
    );
    return p;
  }, {} as any);
  fs.writeFileSync("words-debug.json", JSON.stringify(debugArray, null, 2));

  it("finds the correct leftmost", () => {
    expect(sa.array[sa.suffixArrayLeftMostPrefixMatch("chess")]).toEqual(
      sa.string.indexOf(`${SEPARATOR}chess`)
    );
  });
  it("finds the correct suffixes", () => {
    expect(sa.findWords("cherub")).toEqual([
      "cherub",
      "cherubic",
      "cherubically",
      "cherubim",
      "cherubs",
    ]);
  });

  it("finds the correct suffixes for chess", () => {
    expect(sa.findWords("chess")).toEqual([
      "chess",
      "chessboard",
      "chessboards",
      "chessman",
      "chessmen",
    ]);
  });
});
