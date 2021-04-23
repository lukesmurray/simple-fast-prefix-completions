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

Concatenate dictionary together into a string D
Each word is separated by a sentinel \$.

- `so`, `soap`, `soupy`, `soapy`

- `so$soap$soupy$soapy$`

We create a suffix array from these words

```js
{
  '19': '$',
  '2': '$soap$soupy$soapy$',
  '13': '$soapy$',
  '7': '$soupy$soapy$',
  '5': 'ap$soupy$soapy$',
  '16': 'apy$',
  '1': 'o$soap$soupy$soapy$',
  '4': 'oap$soupy$soapy$',
  '15': 'oapy$',
  '9': 'oupy$soapy$',
  '6': 'p$soupy$soapy$',
  '17': 'py$',
  '11': 'py$soapy$',
  '0': 'so$soap$soupy$soapy$',
  '3': 'soap$soupy$soapy$',
  '14': 'soapy$',
  '8': 'soupy$soapy$',
  '10': 'upy$soapy$',
  '18': 'y$',
  '12': 'y$soapy$'
}
```

Now we try to find completions using the suffix array.

**Proposed Algorithm**

If we type a prefix P we can find the first suffix which starts with P
and the last suffix which starts with P.

Any suffixes in between are completions but only up until the first sentinel.

For any suffix the suffix is only valid if the index is 0 or the previous character in the array is a sentinel.

**Where I'm stuck**

How do we search? We can do leftmost or rightmost binary search but we need a comparison function. SOLVED.
