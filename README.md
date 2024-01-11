# The Real Doctest

This library provides commands to execute TSDoc @example tags in Typescript.  
We also have a VS Code extension that uses this library directly from the IDE.

## Usage

`npx the-real-doctest src/lib/utils.ts`

Expression statements with ==, !=, === or !== will be checked for equality

```typescript
// src/lib/utils.ts

/**
 * @example f(0) == 10
 * @example f(0) != 10 // This shoukd fail
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
Passed tests: 2
FAILED TESTS: 1
-----------------
Error at line 3:
30 == 20
```

## Help

`npx the-real-doctest --help`


## Setup

We use the tsx compiler by default, so you need to install it in your project: `npm i -D tsx`.
Alternatively, you can specify a custom run command (run `npx the-real-doctest --help`)
