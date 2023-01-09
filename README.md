
# CompilerUsingJS

This is a super mini compiler built using javascript. This compiler can do very very limited stuff (might be useless as well for most of you though great for learning ).



## What's it's Superpower ?

Well, It can convert your LISP function into C function. So it will convert this :

```lisp

(fn para1 para2)

```

to 

```c
fn(para1,para2)

```

The first function is in LISP language and the Second one is in C language.

## Use This

Clone this Repo to Your PC

```bash
git clone https://github.com/omraval18/compilerUsingJS.git

```

Go to the Folder

```bash
cd compilerUsingJS
```

Run index.js of import functions to your file and run it.

```bash
node index.js
```

Use it externally by adding following code to your file.

```js
const {
  tokenizer,
  parser,
  transformer,
  codeGenerator,
  compiler,
} = require('./index.js');

```
