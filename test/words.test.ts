import { words } from "../perf/words";
import { SuffixArray } from "../src";

const SEPARATOR = "\u0001";

describe("suffix", () => {
  const sa = new SuffixArray({ SEPARATOR, words });

  it("finds the correct suffixes for cherub", () => {
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

  it("finds the correct suffixes for console", () => {
    expect(sa.findWords("console")).toEqual([
      "console",
      "consoled",
      "consoler",
      "consoles",
    ]);
  });

  it("finds the correct suffixes for zzzzzzzzzzzzzzz", () => {
    expect(sa.findWords("zzzzzzzzzzzzzzz")).toEqual([]);
  });
});
