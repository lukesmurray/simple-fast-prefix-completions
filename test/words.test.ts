import { words } from "../perf/words";
import { SimpleFastPrefixCompletions } from "../src";

const SEPARATOR = "\u0001";

describe("prefix completions for words", () => {
  const sa = new SimpleFastPrefixCompletions({ SEPARATOR, words });

  it("finds the correct suffixes for cherub", () => {
    expect(sa.findWords("cherub")).toEqual([
      "cherub",
      "cherubic",
      "cherubically",
      "cherubim",
      "cherubs"
    ]);
  });

  it("finds the correct suffixes for chess", () => {
    expect(sa.findWords("chess")).toEqual([
      "chess",
      "chessboard",
      "chessboards",
      "chessman",
      "chessmen"
    ]);
  });

  it("finds the correct suffixes for console", () => {
    expect(sa.findWords("console")).toEqual([
      "console",
      "consoled",
      "consoler",
      "consoles"
    ]);
  });

  it("finds the correct suffixes for zzzzzzzzzzzzzzz", () => {
    expect(sa.findWords("zzzzzzzzzzzzzzz")).toEqual([]);
  });

  it("serializes", () => {
    const serializedSA = sa.toJSON();
    const deserializedSA = SimpleFastPrefixCompletions.fromJSON(serializedSA);
    expect(deserializedSA.findWords("console")).toEqual([
      "console",
      "consoled",
      "consoler",
      "consoles"
    ]);
  });
});
