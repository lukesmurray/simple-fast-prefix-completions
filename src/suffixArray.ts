import { default as SuffixArray_ } from "mnemonist/suffix-array";
import { binarySearchLeftmost, binarySearchRightmost } from "./binarySearch";

export class SuffixArray {
  public readonly string: string;
  public readonly array: number[];
  public readonly SEPARATOR: string;
  public readonly wordStarts: Set<number>;

  constructor(options: {
    SEPARATOR: string;
    words?: string[];
    array?: number[];
    wordStarts?: number[];
    string?: string;
  }) {
    const {
      SEPARATOR,
      words,
      array: cachedArray,
      wordStarts,
      string,
    } = options;
    if (
      cachedArray !== undefined &&
      string !== undefined &&
      wordStarts !== undefined
    ) {
      this.string = string;
      this.array = cachedArray;
      this.SEPARATOR = SEPARATOR;
      this.wordStarts = new Set(wordStarts);
    } else if (words !== undefined) {
      this.wordStarts = new Set();
      this.string = "";
      for (let i = 0; i < words.length; i++) {
        this.wordStarts.add(this.string.length);
        this.string += words[i] + SEPARATOR;
      }
      const { array } = new SuffixArray_(this.string);
      this.array = array;
      this.SEPARATOR = SEPARATOR;
    } else {
      throw new Error("Either pass words or all necessary properties");
    }
  }

  private suffixArrayLeftMostPrefixMatch(target: string) {
    return binarySearchLeftmost(
      this.array,
      target,
      this.suffixArrayPrefixCmpFunc()
    );
  }

  private suffixArrayRightMostPrefixMatch(target: string) {
    return binarySearchRightmost(
      this.array,
      target,
      this.suffixArrayPrefixCmpFunc()
    );
  }

  /**
   * Create a comparison function which has a closure over the suffix array
   */
  private suffixArrayPrefixCmpFunc() {
    // compare an element from the SuffixArray.array to a target string
    // the element is an index in the SuffixArray.string
    // simply compares the characters from the suffix start to the target length
    return (suffixStart: number, target: string) => {
      const suffixEnd = suffixStart + target.length;
      let suffix = this.string.slice(suffixStart, suffixEnd);
      const separatorIndex = suffix.indexOf(this.SEPARATOR);
      if (separatorIndex !== -1) {
        suffix = suffix.substring(0, separatorIndex);
      }
      return suffix.localeCompare(target);
    };
  }

  private findSuffixIndices(prefix: string) {
    const left = this.suffixArrayLeftMostPrefixMatch(prefix);
    const right = this.suffixArrayRightMostPrefixMatch(prefix);
    return this.array.slice(left, right + 1);
  }

  private findWordIndices(prefix: string) {
    return this.findSuffixIndices(prefix).filter((s) => this.wordStarts.has(s));
  }

  public findWords(prefix: string) {
    return this.findWordIndices(prefix).map((i) => {
      const separatorIndex = this.string.indexOf(this.SEPARATOR, i);
      if (separatorIndex !== -1) {
        return this.string.substring(i, separatorIndex);
      } else {
        return this.string.substring(i);
      }
    });
  }

  public toJSON() {
    return {
      string: this.string,
      array: this.array,
      SEPARATOR: this.SEPARATOR,
      wordStarts: [...this.wordStarts],
    };
  }

  public fromJSON(json: string) {
    const { string, array, SEPARATOR, wordStarts } = JSON.parse(json);
    return new SuffixArray({
      SEPARATOR,
      array,
      string,
      wordStarts,
    });
  }
}
