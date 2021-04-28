import { binarySearchLeftmost, binarySearchRightmost } from "./binarySearch";
import PriorityQueue from "./priorityQueue";
import { SegmentTree } from "./segmentTree";

export class SimpleFastPrefixCompletions<I> {
  private string: string;
  private wordStarts: number[];
  private SEPARATOR: string;

  // only used in top k
  private wordRankings?: number[];
  private tree?: SegmentTree;

  // used for mapping words to ids
  private wordIds?: I[];

  constructor(options: {
    SEPARATOR?: string;
    // pass an unranked list of words to get prefix completions
    words?: string[];
    wordsWithIds?: [string, I][];
    // pass a ranked list of words [word, ranking][] to get top-k completions
    rankedWords?: [string, number][];
    rankedWordsWithIds?: [string, number, I][];
    // remaining options passed in json deserialization
    wordStarts?: number[];
    string?: string;
    wordRankings?: number[];
    tree?: string;
    wordIds?: I[];
  }) {
    const {
      SEPARATOR = "\u0001",
      words,
      wordStarts: cachedWordStarts,
      string,
      rankedWords,
      tree: serializedTree,
      wordRankings,
      wordsWithIds,
      rankedWordsWithIds,
      wordIds
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
      if (wordIds !== undefined) {
        this.wordIds = wordIds;
      }
    }
    // handle prefix completions case (passed words)
    else if (words !== undefined) {
      words.sort((a, b) => a.localeCompare(b));
      this.buildString(words, SEPARATOR, i => words[i]);
    }
    // handle prefix completion case (passed wordsWithIds)
    else if (wordsWithIds !== undefined) {
      wordsWithIds.sort((a, b) => a[0].localeCompare(b[0]));
      this.wordIds = wordsWithIds.map(v => v[1]);
      this.buildString(wordsWithIds, SEPARATOR, i => wordsWithIds[i][0]);
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
    }
    // handle top k completions with ids case (passed rankedWordsWithIds)
    else if (rankedWordsWithIds !== undefined) {
      rankedWordsWithIds.sort((a, b) => a[0].localeCompare(b[0]));
      this.buildString(
        rankedWordsWithIds,
        SEPARATOR,
        i => rankedWordsWithIds[i][0]
      );
      this.wordRankings = rankedWordsWithIds.map(v => v[1]);
      this.wordIds = rankedWordsWithIds.map(v => v[2]);
      this.tree = new SegmentTree({
        values: rankedWordsWithIds.map((_, i) => i),
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

  private getLeftAndRightForPrefix(prefix: string) {
    // prefix the prefix with a separator
    const separatorPrefix = this.SEPARATOR + prefix;
    // find the left and right indices in the word start array
    const left = this.leftMostPrefixMatchIndex(separatorPrefix);
    const right = this.rightMostPrefixMatchIndex(separatorPrefix) + 1;
    return { left, right };
  }

  private getWordForIndex(idx: number): string {
    const wordStartIdx = this.wordStarts[idx] + 1;
    const wordEndIdx = this.string.indexOf(this.SEPARATOR, wordStartIdx);
    if (wordEndIdx !== -1) {
      return this.string.substring(wordStartIdx, wordEndIdx);
    } else {
      return this.string.substring(wordStartIdx);
    }
  }

  public findWords(prefix: string) {
    const { left, right } = this.getLeftAndRightForPrefix(prefix);
    if (left === right) {
      return [];
    }
    const words = [];
    for (let i = left; i < right; i++) {
      words.push(this.getWordForIndex(i));
    }
    return words;
  }

  public findWordsWithIds(prefix: string) {
    if (this.wordIds === undefined) {
      throw new Error("word ids is undefined");
    }
    const { left, right } = this.getLeftAndRightForPrefix(prefix);
    if (left === right) {
      return [];
    }
    const wordsWithIds: [string, I][] = [];
    for (let i = left; i < right; i++) {
      wordsWithIds.push([this.getWordForIndex(i), this.wordIds[i]]);
    }
    return wordsWithIds;
  }

  private findTopKIndices(prefix: string, k: number) {
    if (this.tree === undefined) {
      throw new Error("tree is undefined");
    }
    if (this.wordRankings === undefined) {
      throw new Error("word rankings are undefined");
    }
    const { left, right } = this.getLeftAndRightForPrefix(prefix);
    if (left === right) {
      return [];
    }

    // indices for top k words
    let foundIndices = [];
    // each interval is a map from an idx to an interval (left, right, idx)
    let intervalMap = new Map<number, [number, number, number]>();
    // create a priority queue for the intervals
    const queue = new PriorityQueue<number>();

    // add the initial interval to the queue and map
    let firstMinIdx = this.tree.rangeQuery(left, right);
    intervalMap.set(firstMinIdx, [left, right, firstMinIdx]);
    queue.push(firstMinIdx, this.wordRankings[firstMinIdx]);

    // while the queue is not empty and we haven't found all the terms
    while (!queue.isEmpty() && foundIndices.length < k) {
      // pop the queue and get the associated interval
      const nextMinIdx = queue.pop()!;
      const [left, right] = intervalMap.get(nextMinIdx)!;

      // add the new min to the found indices
      foundIndices.push(nextMinIdx);

      // if the left interval is valid add it to the queue and map
      if (nextMinIdx > left) {
        const leftIdx = this.tree.rangeQuery(left, nextMinIdx);
        intervalMap.set(leftIdx, [left, nextMinIdx, leftIdx]);
        queue.push(leftIdx, this.wordRankings[leftIdx]);
      }

      // if the right interval is valid add it to the queue and map
      if (nextMinIdx + 1 < right) {
        const rightIdx = this.tree.rangeQuery(nextMinIdx + 1, right);
        intervalMap.set(rightIdx, [nextMinIdx + 1, right, rightIdx]);
        queue.push(rightIdx, this.wordRankings[rightIdx]);
      }
    }
    return foundIndices;
  }

  public findTopKWords(prefix: string, k: number) {
    let foundIndices = this.findTopKIndices(prefix, k);

    if (foundIndices.length === 0) {
      return [];
    }
    let foundWords = [];
    for (let i = 0; i < foundIndices.length; i++) {
      foundWords.push(this.getWordForIndex(foundIndices[i]));
    }
    return foundWords;
  }

  public findTopKWordsWithIds(prefix: string, k: number) {
    if (this.wordIds === undefined) {
      throw new Error("word ids is undefined");
    }
    let foundIndices = this.findTopKIndices(prefix, k);

    if (foundIndices.length === 0) {
      return [];
    }

    let foundWordsWithIds = [];
    for (let i = 0; i < foundIndices.length; i++) {
      const foundIdx = foundIndices[i];
      foundWordsWithIds.push([
        this.getWordForIndex(foundIdx),
        this.wordIds[foundIdx]
      ]);
    }
    return foundWordsWithIds;
  }

  public toJSON() {
    const objToSave: any = {
      string: this.string,
      array: this.wordStarts,
      SEPARATOR: this.SEPARATOR
    };
    if (this.tree !== undefined && this.wordRankings !== undefined) {
      objToSave.tree = this.tree.toJSON();
      objToSave.wordRankings = this.wordRankings;
    }
    if (this.wordIds !== undefined) {
      objToSave.wordIds = this.wordIds;
    }

    return JSON.stringify(objToSave);
  }

  public static fromJSON(json: string) {
    const {
      string,
      array,
      SEPARATOR,
      tree,
      wordRankings,
      wordIds
    } = JSON.parse(json);
    return new SimpleFastPrefixCompletions({
      SEPARATOR,
      wordStarts: array,
      string,
      tree,
      wordRankings,
      wordIds
    });
  }
}
