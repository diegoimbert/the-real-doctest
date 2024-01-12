# The Real Doctest

This library provides commands to execute TSDoc @example tags in Typescript.

We also have <a href="https://marketplace.visualstudio.com/items?itemName=Kanso.the-real-doctest-ts">a Visual Studio Code extension</a> that uses this library directly from the IDE:  

## Usage


`npx the-real-doctest src/lib/utils.ts`

Expression statements with ==, !=, === or !== will be checked for equality

```typescript
// src/lib/utils.ts

/**
 * @example f(0) == 10
 * @example f(0) != 10 // This should fail
 * @example f(10) == 20
 * @example f(20) != 20
 * @example f(20) == 20 // This should fail
 */
function f(x: number) {
  return x + 10
}
```

Output:

```
Passed tests: 3
FAILED TESTS: 2
-----------------
Error at line 4: 
10 != 10
-----------------
Error at line 7: 
30 == 20
```

## Help

`npx the-real-doctest --help`


## Setup

We use the tsx compiler by default, so you need to install it in your project: `npm i -D the-real-doctest tsx`.
Alternatively, you can specify a custom run command (run `npx the-real-doctest --help`)
