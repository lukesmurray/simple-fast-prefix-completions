import { SimpleFastPrefixCompletions } from "../src";

describe("SimpleFastPrefixCompletions", () => {
  it("finds the correct suffixes", () => {
    const words = ["so", "soap", "soupy", "soapy"];
    const sa = new SimpleFastPrefixCompletions({ words });
    expect(sa.findWords("s")).toEqual(["so", "soap", "soapy", "soupy"]);
    expect(sa.findWords("so")).toEqual(["so", "soap", "soapy", "soupy"]);
    expect(sa.findWords("soa")).toEqual(["soap", "soapy"]);
    expect(sa.findWords("sou")).toEqual(["soupy"]);
    expect(sa.findWords("soap")).toEqual(["soap", "soapy"]);
    expect(sa.findWords("soapy")).toEqual(["soapy"]);
    expect(sa.findWords("a")).toEqual([]);
    expect(sa.findWords("")).toEqual(["so", "soap", "soapy", "soupy"]);
    expect(sa.findWords("z")).toEqual([]);
  });

  it("finds the correct left prefix", () => {
    const words = ["so", "soap", "soupy", "soapy"];
    const sa = new SimpleFastPrefixCompletions({ words });
    expect(sa.findWords("soap")).toEqual(["soap", "soapy"]);
  });

  it("works with separator prefixes", () => {
    const words = [`so`, `soap`, `soupy`, `soapy`];
    const sa = new SimpleFastPrefixCompletions({ words });
    expect(sa.findWords(`soap`)).toEqual([`soap`, `soapy`]);
  });

  it("finds all words with incomplete array", () => {
    const words = [`so`, `soap`, `soupy`, `soapy`];
    const sa = new SimpleFastPrefixCompletions({ words });
    expect(sa.findWords("s")).toEqual(["so", "soap", "soapy", "soupy"]);
  });

  it("works for tongue twisters", () => {
    const words = ["sally", "sells", "seashells", "by", "the", "seashore"];
    const completions = new SimpleFastPrefixCompletions({ words });
    expect(completions.findWords("se")).toEqual([
      "seashells",
      "seashore",
      "sells"
    ]);
  });

  it("finds top k", () => {
    const rankedWords: [string, number][] = [
      ["sally", 2],
      ["sells", 5],
      ["seashells", 3],
      ["by", 8],
      ["the", 1],
      ["seashore", 6]
    ];
    const completions = new SimpleFastPrefixCompletions({ rankedWords });
    expect(completions.findWords("se")).toEqual([
      "seashells",
      "seashore",
      "sells"
    ]);

    expect(completions.findTopKWords("se", 1)).toEqual(["seashells"]);
    expect(completions.findTopKWords("se", 2)).toEqual(["seashells", "sells"]);
    expect(completions.findTopKWords("se", 3)).toEqual([
      "seashells",
      "sells",
      "seashore"
    ]);

    expect(completions.findTopKWords("", Infinity)).toEqual([
      "the",
      "sally",
      "seashells",
      "sells",
      "seashore",
      "by"
    ]);

    expect(completions.findTopKWords("s", Infinity)).toEqual([
      "sally",
      "seashells",
      "sells",
      "seashore"
    ]);

    const serialized = completions.toJSON();
    const deserialized = SimpleFastPrefixCompletions.fromJSON(serialized);

    expect(deserialized.findWords("se")).toEqual([
      "seashells",
      "seashore",
      "sells"
    ]);

    expect(deserialized.findTopKWords("se", 1)).toEqual(["seashells"]);
    expect(deserialized.findTopKWords("se", 2)).toEqual(["seashells", "sells"]);
    expect(deserialized.findTopKWords("se", 3)).toEqual([
      "seashells",
      "sells",
      "seashore"
    ]);

    expect(deserialized.findTopKWords("", Infinity)).toEqual([
      "the",
      "sally",
      "seashells",
      "sells",
      "seashore",
      "by"
    ]);

    expect(deserialized.findTopKWords("s", Infinity)).toEqual([
      "sally",
      "seashells",
      "sells",
      "seashore"
    ]);
  });
});
