## Resources

- [Stanford Slides](http://web.stanford.edu/class/archive/cs/cs166/cs166.1166/lectures/04/Small04.pdf)

## Learning

Suffix array for a string T is an array of suffixes for the string followed by a sentinel stored in sorted order.
By convention the sentinel is stored first.

Suffix arrays are represented by storing the indices of the suffixes in sorted order rather than the suffixes themselves.

T = nonsense\$

| index |   suffix   |
| :---: | :--------: |
|   8   |     \$     |
|   7   |    e\$     |
|   4   |   ense\$   |
|   0   | nonsense\$ |
|   5   |   nse\$    |
|   2   |  nsense\$  |
|   1   | onsense\$  |
|   6   |    se\$    |
|   3   |  sense\$   |

The suffix string can be used to locate every occurrence of a substring pattern P within a string S. Finding every occurrence of the pattern is equivalent to finding every suffix that begins with the substring.
Finding every occurrence of the pattern is equivalent to finding every suffix that begins with that substring.

Finding the substring pattern P of length m in the string S of length n takes O(m log n) time. Can be improved to O(m + logn) time with an LCP.

Aho Corasick finds all words in O(n + m + z).

## Karger Meeting

- {{[[TODO]]}} can we try to create a prefix array?
  - take all of the words in the dictionary
  - reverse them
  - if somebody has typed part of a word you want to reverse that and ask if the reversal can be found in the reversed prefix array, if so what completions reach from it
  - when you type abc you want to find suffixes that start with abc, the suffix array sorts all of the suffixes, you can find the first suffix that starts with abc and the last suffix that starts with abc
  - wouldn't some of your completions be incomplete words?
    - `abcapple$abcbanana$abckiwi$`
    - find suffixes that start with abc and continue until you see end of word marker
  - sort by top k and now you have log + constant time
