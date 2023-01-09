function tokenizer(input) {
    let index = 0;
    let tokens = [];

    while (index < input.length) {
        let char = input[index];

        if (char === "(") {
            tokens.push({
                type: "paren",
                value: "(",
            });

            index++;
            continue;
        }

        if (char === ")") {
            tokens.push({
                type: "paren",
                value: ")",
            });

            index++;
            continue;
        }

        let WHITESPACE = /\s/;
        if (WHITESPACE.test(char)) {
            index++;
            continue;
        }

        let NUMBERS = /[0-9]/;
        if (NUMBERS.test(char)) {
            let value = "";

            while (NUMBERS.test(char)) {
                value += char;
                char = input[++index];
            }

            tokens.push({
                type: "number",
                value,
            });
            continue;
        }

        if (char === '"') {
            let value = "";
            char = input[++index];

            while (char !== '"') {
                value += char;
                char = input[++index];
            }

            char = input[++index];

            tokens.push({
                type: "string",
                value,
            });

            continue;
        }

        let LETTERS = /[a-z]/;

        if (LETTERS.test(char)) {
            let value = "";

            while (LETTERS.test(char)) {
                value += char;
                char = input[++index];
            }

            tokens.push({
                type: "name",
                value,
            });

            continue;
        }

        throw new TypeError("Don't know this character" + char);
    }

    return tokens;
}

function parser(tokens) {
    let index = 0;

    function walk() {
        let token = tokens[index];

        if (token.type === "number") {
            index++;

            return {
                type: "NumberLiteral",
                value: token.value,
            };
        }

        if (token.type === "string") {
            index++;

            return {
                type: "StringLiteral",
                value: token.value,
            };
        }

        if (token.type === "paren" && token.value === "(") {
            token = tokens[++index];

            let node = {
                type: "CallExpression",
                name: token.value,
                params: [],
            };

            token = tokens[++index];

            while (token.type !== "paren" || (token.type === "paren" && token.value !== ")")) {
                node.params.push(walk());
                token = tokens[index];
            }

            index++;
            return node;
        }

        throw new TypeError(token.type);
    }

    let ast = {
        type: "Program",
        body: [],
    };

    while (index < tokens.length) {
        ast.body.push(walk());
    }
    return ast;
}

function traverser(ast, visitor) {
    function traverseArray(array, parent) {
        array.forEach((child) => {
            traverseNode(child, parent);
        });
    }

    function traverseNode(node, parent) {
        let methods = visitor[node.type];

        if (methods && methods.enter) {
            methods.enter(node, parent);
        }

        switch (node.type) {
            case "Program":
                traverseArray(node.body, node);
                break;
            case "CallExpression":
                traverseArray(node.params, node);
                break;
            case "NumberLiteral":
                break;
            case "StringLiteral":
                break;

            default:
                throw new TypeError(node.type);
        }

        if (methods && methods.exit) {
            methods.exit(node, parent);
        }
    }

    traverseNode(ast, null);
}

function transformer(ast) {
    let newAst = {
        type: "Program",
        body: [],
    };

    ast._context = newAst.body;

    traverser(ast, {
        NumberLiteral: {
            enter(node, parent) {
                parent._context.push({
                    type: "NumberLiteral",
                    value: node.value,
                });
            },
        },

        StringLiteral: {
            enter(node, parent) {
                parent._context.push({
                    type: "StringLiteral",
                    value: node.value,
                });
            },
        },

        CallExpression: {
            enter(node, parent) {
                let expression = {
                    type: "CallExpression",
                    callee: {
                        type: "Identifier",
                        name: node.name,
                    },
                    arguments: [],
                };

                node._context = expression.arguments;

                if (parent.type !== "CallExpression") {
                    expression = {
                        type: "ExpressionStatement",
                        expression: expression,
                    };
                }

                parent._context.push(expression);
            },
        },
    });

    return newAst;
}

function codeGenerator(node) {
    switch (node.type) {
        case "Program":
            return node.body.map(codeGenerator).join("\n");

        case "ExpressionStatement":
            return codeGenerator(node.expression) + ";";

        case "CallExpression":
            console.log(node.callee);
            return (
                codeGenerator(node.callee) + "(" + node.arguments.map(codeGenerator).join(",") + ")"
            );
        case "Identifier":
            return node.name;

        case "NumberLiteral":
            return node.value;

        case "StringLiteral":
            return '"' + node.value + '"';

        default:
            throw new TypeError(node.type);
    }
}

function compiler(input) {
    let tokens = tokenizer(input);
    let ast = parser(tokens);
    let newAst = transformer(ast);
    let output = codeGenerator(newAst);
    console.log(`\x1b[33m ${output}\x1b[0m`);

    console.log(tokens, ast, newAst);

    return output;
}

module.exports = {
    tokenizer,
    parser,
    traverser,
    transformer,
    codeGenerator,
    compiler,
};

compiler("(add 2 (substract 4 2))");
