# l0

![example workflow](https://github.com/hopeless-programmer-online/l0/actions/workflows/node.js.yml/badge.svg)

Small programming language.

## Quick start

- Install [prerequisites](#prerequisites).
- Install `l0` package with `npm install https://github.com/hopeless-programmer-online/l0.git#refactoring3`.
- Interpret the desired `.l0` file with `npx l0 file.l0`.

## Code samples

```l0
; hello world
print("Hello, World!")
```

### Logic

```l0
x : not(true) print(x)
x : and(true, false) print(x)
x : or(true, false) print(x)
then() { print("then") }
if (true, then)
x : type(true) print(x)
```

### Numbers

```l0
x : +(5,2) print(x)
x : -(5,2) print(x)
x : *(5,2) print(x)
x : /(5,2) print(x)
x : >(5,2) print(x)
x : >=(5,2) print(x)
x : <(5,2) print(x)
x : <=(5,2) print(x)
x : type(5) print(x)
```

### Strings

```l0
x : length("text") print(x)
x : +("a", "b") print(x)
x : type("text") print(x)
```

### Variables

```l0
v : var(5) print(v)
=(v, 10) print(v)
x : type(v) print(x)
```

### Lists

```l0
l : List() print(l)
push_front(l, 1) print(l)
push_back(l, 2) print(l)
pop_front(l) print(l)
pop_back(l) print(l)
x : type(l) print(x)
```

## Prerequisites

- [Node.js 14+](https://nodejs.org/en/download).
- [Git 2.0+](https://git-scm.com/downloads).
