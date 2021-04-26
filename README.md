# Suffix Array Prefix Search

Algorithm to do prefix matching based on a suffix array.
All strings T are concatenated into a string of length m.
To match a pattern of length n takes O(n log m) time since we need to do O(log m) comparisons of an n letter prefix.
We then need to iterate through suffixes which takes O(m) time.

Final run time O(n log m) + O(m).

## TODOs

Ranking is currently alphabetical rather than passed in rank.

```ts
const words = ["so", "soap", "soupy", "soapy"];
const sa = new SuffixArray({ SEPARATOR, words });
// current semantics
expect(sa.findWords("s")).toEqual(["so", "soap", "soapy", "soupy"]);
// expected semantics
expect(sa.findWords("s")).toEqual(["so", "soap", "soupy", "soapy"]);
```

We may be able to fix by iterating through the word in the leftmost match until we find a word which doesn't prefix match our target. (No doesn't work, unless input is sorted)

One of the tests isn't working

~~Add a sentinel to the start of each word~~

~~Currently the algorithm isn't working because the underlying suffix tree isn't correctly lexographically sorted. Need to debug.~~

Solving top k

- we want range maximum for a range
- once we find the maximum we can just split
- array of numbers with priority associated wiht each number, left binary search, right binary search to find interval, use range data structure to find largest priority, once you find that split in two and find largest priority in two sides
- interval range maximum query

- could potentially split into higher and lower priority

# Range Maximum Query

Divide array into blocks of size `(log n) / 4`.
The minimum for each block can be computed in `O(n)` time and stored in a new array.
