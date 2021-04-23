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
