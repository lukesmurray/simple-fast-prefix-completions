import { binarySearchLeftmost, binarySearchRightmost } from "./binarySearch";

export class SuffixArray {
  public readonly string: string;
  public readonly wordStarts: number[];
  public readonly SEPARATOR: string;

  constructor(options: {
    SEPARATOR: string;
    words?: string[];
    wordStarts?: number[];
    string?: string;
  }) {
    const { SEPARATOR, words, wordStarts: cachedWordStarts, string } = options;

    if (SEPARATOR.length !== 1) {
      // this can be removed by storing the separator length instead of assuming
      // that it has length 1 but at least prevent the user from creating errors
      throw new Error("Separator must have a length of 1");
    }

    // handle the case where the data structure has been serialized
    if (cachedWordStarts !== undefined && string !== undefined) {
      this.string = string;
      this.wordStarts = cachedWordStarts;
      this.SEPARATOR = SEPARATOR;
    } else if (words !== undefined) {
      // sort the words and create the data structure
      const wordsSorted = words.sort((a, b) => a.localeCompare(b));
      this.string = "";
      this.wordStarts = [];
      for (let i = 0; i < wordsSorted.length; i++) {
        this.wordStarts.push(this.string.length);
        // prefix each word with the SEPARATOR
        this.string += SEPARATOR + words[i];
        if ((words[i] + "").length === 0) {
          throw new Error(`invalid word, ${i}`);
        }
      }
      // Suffix the array with a separator
      this.string += SEPARATOR;

      this.SEPARATOR = SEPARATOR;
    } else {
      throw new Error("Either pass words or all necessary properties");
    }
  }

  private suffixArrayLeftMostPrefixMatch(target: string) {
    return binarySearchLeftmost(
      this.wordStarts,
      target,
      this.suffixArrayPrefixCmpFunc()
    );
  }

  private suffixArrayRightMostPrefixMatch(target: string) {
    return binarySearchRightmost(
      this.wordStarts,
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
    return this.wordStarts.slice(left, right + 1);
  }

  private findWordIndices(prefix: string) {
    return this.findSuffixIndices(prefix).map((i) => i + 1);
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
    return JSON.stringify({
      string: this.string,
      array: this.wordStarts,
      SEPARATOR: this.SEPARATOR,
    });
  }

  public static fromJSON(json: string) {
    const { string, array, SEPARATOR } = JSON.parse(json);
    return new SuffixArray({
      SEPARATOR,
      wordStarts: array,
      string,
    });
  }
}
