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

    if (SEPARATOR.length !== 1) {
      // this can be removed by storing the separator length instead of assuming
      // that it has length 1 but at least prevent the user from creating errors
      throw new Error("Separator must have a length of 1");
    }

    // handle the case where the data structure has been serialized
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
      // build the data structure based on a word list
      this.wordStarts = new Set();
      this.string = "";
      for (let i = 0; i < words.length; i++) {
        this.wordStarts.add(this.string.length);
        // prefix each word with the SEPARATOR
        this.string += SEPARATOR + words[i];
      }
      // Suffix the array with a separator
      this.string += SEPARATOR;
      const { array } = new SuffixArray_(this.string);

      // since all searches are prefixed with separator throw out any suffixes
      // which don't start with the separator
      const nonSeparatorSuffix = array.findIndex(
        (s) => this.string.charAt(s) !== SEPARATOR
      );
      if (nonSeparatorSuffix !== -1) {
        this.array = array.slice(0, nonSeparatorSuffix);
      } else {
        this.array = array;
      }
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

      // find the end word boundary, we start at the 1 index to skip the prefix
      // separator
      const endSeparatorIndex = suffix.indexOf(this.SEPARATOR, 1);
      if (endSeparatorIndex !== -1) {
        suffix = suffix.substring(0, endSeparatorIndex);
      }
      return suffix.localeCompare(target);
    };
  }

  private findSuffixIndices(prefix: string) {
    const separatorPrefix = this.SEPARATOR + prefix;
    const left = this.suffixArrayLeftMostPrefixMatch(separatorPrefix);
    const right = this.suffixArrayRightMostPrefixMatch(separatorPrefix);
    return this.array.slice(left, right + 1);
  }

  private findWordIndices(prefix: string) {
    return (
      this.findSuffixIndices(prefix)
        .filter((s) => this.wordStarts.has(s))
        // add 1 to each string index to black box the separator prefix
        .map((i) => i + 1)
    );
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
