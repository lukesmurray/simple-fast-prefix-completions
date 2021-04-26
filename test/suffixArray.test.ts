import { SuffixArray } from "../src";

const SEPARATOR = "\u0001";

describe("suffix", () => {
  it("finds the correct suffixes", () => {
    const words = ["so", "soap", "soupy", "soapy"];
    const sa = new SuffixArray({ SEPARATOR, words });
    expect(sa.findWords("s")).toEqual(["so", "soap", "soapy", "soupy"]);
    expect(sa.findWords("so")).toEqual(["so", "soap", "soapy", "soupy"]);
    expect(sa.findWords("soa")).toEqual(["soap", "soapy"]);
    expect(sa.findWords("sou")).toEqual(["soupy"]);
    expect(sa.findWords("soap")).toEqual(["soap", "soapy"]);
    expect(sa.findWords("soapy")).toEqual(["soapy"]);
    expect(sa.findWords("a")).toEqual([]);
    expect(sa.findWords("")).toEqual(["so", "soap", "soapy", "soupy"]);
  });

  it("finds the correct left prefix", () => {
    const words = ["so", "soap", "soupy", "soapy"];
    const sa = new SuffixArray({ SEPARATOR, words });
    expect(sa.findWords("soap")).toEqual(["soap", "soapy"]);
  });

  it("works with separator prefixes", () => {
    const words = [`so`, `soap`, `soupy`, `soapy`];
    const sa = new SuffixArray({ SEPARATOR, words });
    expect(sa.findWords(`soap`)).toEqual([`soap`, `soapy`]);
  });

  it("finds all words with incomplete array", () => {
    const words = [`so`, `soap`, `soupy`, `soapy`];
    const sa = new SuffixArray({ SEPARATOR, words });
    expect(sa.findWords("s")).toEqual(["so", "soap", "soapy", "soupy"]);
  });
});
