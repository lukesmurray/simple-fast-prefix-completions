import { binarySearchLeftmost, binarySearchRightmost } from "./binarySearch";
import PriorityQueue from "./priorityQueue";
import { SegmentTree } from "./segmentTree";

// if user wants topk
// they pass in array of rankedWords
// sort array of ranked words by the words

export class SimpleFastPrefixCompletions {
  public string: string;
  public wordStarts: number[];
  public SEPARATOR: string;

  // only used in top k
  public wordRankings?: number[];
  public tree?: SegmentTree;

  constructor(options: {
    SEPARATOR?: string;
    // pass an unranked list of words to get prefix completions
    words?: string[];
    // pass a ranked list of words [word, ranking][] to get top-k completions
    rankedWords?: [string, number][];
    // remaining options passed in json deserialization
    wordStarts?: number[];
    string?: string;
    wordRankings?: number[];
    tree?: string;
  }) {
    const {
      SEPARATOR = "\u0001",
      words,
      wordStarts: cachedWordStarts,
      string,
      rankedWords,
      tree: serializedTree,
      wordRankings
    } = options;

    // initialize properties
    this.wordStarts = [];
    this.string = "";
    this.SEPARATOR = SEPARATOR;

    if (SEPARATOR.length !== 1) {
      // this can be removed by storing the separator length instead of assuming
      // that it has length 1 but at least prevent the user from creating errors
      throw new Error("Separator must have a length of 1");
    }

    // handle deserialized case (passed serialized data using fromJSON)
    if (cachedWordStarts !== undefined && string !== undefined) {
      this.string = string;
      this.wordStarts = cachedWordStarts;
      if (serializedTree !== undefined && wordRankings !== undefined) {
        this.wordRankings = wordRankings;
        this.tree = SegmentTree.fromJSON(serializedTree, this.treeCmpFunc());
      }
    }
    // handle prefix completions case (passed words)
    else if (words !== undefined) {
      words.sort((a, b) => a.localeCompare(b));
      this.buildString(words, SEPARATOR, i => words[i]);
    }
    // handle top k completions case (passed rankedWords)
    else if (rankedWords !== undefined) {
      rankedWords.sort((a, b) => a[0].localeCompare(b[0]));
      this.buildString(rankedWords, SEPARATOR, i => rankedWords[i][0]);
      this.wordRankings = rankedWords.map(v => v[1]);
      this.tree = new SegmentTree({
        values: rankedWords.map((_, i) => i),
        f: this.treeCmpFunc()
      });
    } else {
      throw new Error("Either pass words or all necessary properties");
    }
  }

  private treeCmpFunc() {
    return (a: number, b: number) => {
      // the values in the segment tree are indices in the wordRanking array
      // we compute the min ranking and then return the index associated with the
      // min
      const aRank = this.wordRankings![a];
      const bRank = this.wordRankings![b];
      if (aRank <= bRank) {
        return a;
      } else {
        return b;
      }
    };
  }

  private buildString<T>(
    words: T[],
    SEPARATOR: string,
    getWordForIndex: (i: number) => string
  ) {
    this.string = "";
    this.wordStarts = [];
    for (let i = 0; i < words.length; i++) {
      this.wordStarts.push(this.string.length);
      const word = getWordForIndex(i);
      if (word.length === 0) {
        throw new Error("invalid word");
      }
      // prefix each word with the SEPARATOR
      this.string += SEPARATOR + word;
    }
    // Suffix the array with a separator
    this.string += SEPARATOR;
  }

  private leftMostPrefixMatchIndex(prefix: string) {
    return binarySearchLeftmost(this.wordStarts, prefix, this.prefixCmpFunc());
  }

  private rightMostPrefixMatchIndex(prefix: string) {
    return binarySearchRightmost(this.wordStarts, prefix, this.prefixCmpFunc());
  }

  /**
   * Create a comparison function which has a closure over the suffix array
   */
  private prefixCmpFunc() {
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

  public findWords(prefix: string) {
    // prefix the prefix with a separator
    const separatorPrefix = this.SEPARATOR + prefix;
    // find the left and right indices in the word start array
    const left = this.leftMostPrefixMatchIndex(separatorPrefix);
    const right = this.rightMostPrefixMatchIndex(separatorPrefix) + 1;

    if (left === right) {
      return [];
    }

    // increment each word start by 1 to skip the separator
    const wordIndices = this.wordStarts.slice(left, right).map(i => i + 1);

    return wordIndices.map(wordStartIdx => {
      // find the end of the word by searching for the first separator after
      // the word start
      const wordEndIdx = this.string.indexOf(this.SEPARATOR, wordStartIdx);
      if (wordEndIdx !== -1) {
        return this.string.substring(wordStartIdx, wordEndIdx);
      } else {
        return this.string.substring(wordStartIdx);
      }
    });
  }

  public findTopKWords(prefix: string, k: number) {
    if (this.tree === undefined) {
      throw new Error("tree is undefined");
    }
    if (this.wordRankings === undefined) {
      throw new Error("word rankings are undefined");
    }

    // prefix the prefix with a separator
    const separatorPrefix = this.SEPARATOR + prefix;
    // find the left and right indices in the word start array
    const left = this.leftMostPrefixMatchIndex(separatorPrefix);
    const right = this.rightMostPrefixMatchIndex(separatorPrefix) + 1;

    if (left === right) {
      return [];
    }

    // indices into ranking/word starts for min words found
    let foundIndices = [];
    // each interval is a map from an idx to an interval (left, right, idx)
    let intervalMap = new Map<number, [number, number, number]>();
    // create a priority queue for the intervals
    const queue = new PriorityQueue<number>();

    let firstMinIdx = this.tree.rangeQuery(left, right);
    intervalMap.set(firstMinIdx, [left, right, firstMinIdx]);
    queue.push(firstMinIdx, this.wordRankings[firstMinIdx]);

    while (!queue.isEmpty() && foundIndices.length < k) {
      const nextMinIdx = queue.pop()!;
      const [left, right] = intervalMap.get(nextMinIdx)!;
      foundIndices.push(nextMinIdx);

      // if the left interval is valid
      if (nextMinIdx > left) {
        // find the idx of the min on the left side
        const leftIdx = this.tree.rangeQuery(left, nextMinIdx);
        // add the left interval to the interval map
        intervalMap.set(leftIdx, [left, nextMinIdx, leftIdx]);
        // add the left interval to the queue
        queue.push(leftIdx, this.wordRankings[leftIdx]);
      }

      // do the same for the right
      if (nextMinIdx + 1 < right) {
        const rightIdx = this.tree.rangeQuery(nextMinIdx + 1, right);
        intervalMap.set(rightIdx, [nextMinIdx + 1, right, rightIdx]);
        queue.push(rightIdx, this.wordRankings[rightIdx]);
      }
    }

    // increment each word start by 1 to skip the separator
    const wordIndices = foundIndices.map(i => this.wordStarts[i] + 1);
    return wordIndices.map(wordStartIdx => {
      // find the end of the word by searching for the first separator after
      // the word start
      const wordEndIdx = this.string.indexOf(this.SEPARATOR, wordStartIdx);
      if (wordEndIdx !== -1) {
        return this.string.substring(wordStartIdx, wordEndIdx);
      } else {
        return this.string.substring(wordStartIdx);
      }
    });
  }

  public toJSON() {
    if (this.tree !== undefined && this.wordRankings !== undefined) {
      return JSON.stringify({
        string: this.string,
        array: this.wordStarts,
        SEPARATOR: this.SEPARATOR,
        tree: this.tree.toJSON(),
        wordRankings: this.wordRankings
      });
    }
    return JSON.stringify({
      string: this.string,
      array: this.wordStarts,
      SEPARATOR: this.SEPARATOR
    });
  }

  public static fromJSON(json: string) {
    const { string, array, SEPARATOR, tree, wordRankings } = JSON.parse(json);
    return new SimpleFastPrefixCompletions({
      SEPARATOR,
      wordStarts: array,
      string,
      tree,
      wordRankings
    });
  }
}
