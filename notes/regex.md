# regex

This bot accepts unsanitised user input to create regular expressions for some of its features.
In order to avoid this providing a security hazard, where cheeky users could submit patterns and input that cause it to run forever, this project uses an alternate linear time regex engine for these situations.

At the time of writing this, there seem to be a variety of options for how to accomplish this, including:
- V8 experimental flag: https://v8.dev/blog/non-backtracking-regexp
- Google's re2: https://github.com/google/re2
  - a pure JS version: https://github.com/le0pard/re2js 
  - a wasm version: https://github.com/google/re2-wasm/
  - a node bindings version: https://github.com/uhop/node-re2/

There are also some older projects that attempt to detect/sanitise regex pattern input but these are known to suffer both false positives and false negatives.

It's unclear to me how the V8 experimental flag compares with re2, though the article linked above notes that it is "based on this algorithm and its implementation in the re2 and Rust regex libraries".
The re2 library has a page detailing the syntax that is available to it, and I'm too lazy to manually check how much this differs from the ECMAscript spec beyond removing the back and forward reference features: https://github.com/google/re2/wiki/Syntax.
Nevertheless, the V8 flag seems to be identical to normal JS regex syntax save for throwing errors when the input includes forbidden features.

In terms of performance the node binding re2 should beat the other two re2 options, but it's again unclear how it compares against what seems to be a re2 implementation directly within V8 via the flag option.

For simplicity, I have chosen to go with the flag option at this point since it minimises extra dependencies.

## Misc

- For some reason beyond my comprehension the V8 flag throws an error when the `i` flag is used in the regex
  - The re2 syntax states that `i` flag is supported, making this even more perplexing

## Update

The inability to use the `i` flag has become overbearing and I have switched to using the re2-wasm module.
