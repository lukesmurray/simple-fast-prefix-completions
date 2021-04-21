//@ts-nocheck
import SuffixArray from "mnemonist/suffix-array";

// TODO(lukemurray): when finding a word for an index backtrack to the start of the word

// const SEPARATOR = "\u0001";
const SEPARATOR = "\u0001";

describe("suffix", () => {
  it("suffixes", () => {
    const words = [
      "so",
      "soa",
      "soap",
      "soapy",
      "soap suds",
      "soapy suds",
    ].sort();
    const sa = new SuffixArray(words.join(SEPARATOR));

    console.log(sa.string);
    console.log(sa.array);

    for (const target of ["s", "so", "soa", "soap", "soapy"]) {
      console.log(target);
      const left = leftMostSuffixPrefix(sa, target);
      console.log("left", left, wordForIndex(sa, left));
      const right = rightMostSuffixPrefix(sa, target);
      console.log("right", right, wordForIndex(sa, right));
    }
  });
});

function leftMostSuffixPrefix(
  suffixArray: { string: string; array: number[] },
  target: string
) {
  return binarySearchLeftmost(
    suffixArray.array,
    target,
    prefixCmp(suffixArray)
  );
}

function rightMostSuffixPrefix(suffixArray: SuffixArray, target: string) {
  return binarySearchRightmost(
    suffixArray.array,
    target,
    prefixCmp(suffixArray)
  );
}

function prefixCmp(suffixArray: { string: string; array: number[] }) {
  return (a: number, target: string) => {
    const suffix = wordForIndex(suffixArray, a);
    // compare the suffix with target
    // if suffix matches but is longer then a is after target so return 1
    // if suffix matches but is shorter then a is before target so return -1
    // if the suffix matches but is shorter then return -1
    // if the suffix matches but is longer return 0 (i think)
    // otherwise return normal sort compare
    return suffix.localeCompare(target);
  };
}

function wordForIndex(
  suffixArray: { string: string; array: number[] },
  a: number
) {
  return suffixArray.string.substring(
    a,
    suffixArray.string.indexOf(SEPARATOR, a)
  );
}

function binarySearchLeftmost<A, T>(
  array: A[],
  target: T,
  cmp: (a: A, b: T) => number
) {
  const n = array.length;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cmpResult = cmp(array[mid], target);
    if (cmpResult < 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return lo;
}

function binarySearchRightmost<A, T>(
  array: A[],
  target: T,
  cmp: (a: A, b: T) => number
) {
  const n = array.length;
  let lo = 0;
  let hi = n - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cmpResult = cmp(array[mid], target);
    if (cmpResult > 0) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }

  return hi - 1;
}
