const readline = require('readline');
const { read_str } = require('./reader.js');
const { pr_str } = require('./printer.js');
const { Env } = require('./env.js');

const { MalSymbol, MalList, MalValue, MalVector, MalHashMap, MalNil } = require('./types.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const eval_ast = (ast, env) => {

  if (ast instanceof MalSymbol) {
    return env.get(ast);
  }

  if (ast instanceof MalList) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalList(newAst);
  }

  if (ast instanceof MalVector) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalVector(newAst);
  }
  if (ast instanceof MalHashMap) {
    const newAst = ast.value.map(x => EVAL(x, env));
    return new MalHashMap(newAst);
  }

  return ast;

}

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case "def!":
      env.set(ast.value[1], EVAL(ast.value[2], env));
      return env.get(ast.value[1])
    case "let*":

      const bindings = ast.value[1].value;
      const env2 = new Env(env);

      for (let index = 0; index < bindings.length; index += 2) {
        env2.set(bindings[index], EVAL(bindings[index + 1], env2));
      }

      if (ast.value.length < 3) {
        return new MalNil();
      }

      return EVAL(ast.value[2], env2);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = malValue => malValue.toString();

const env = new Env();

env.set(new MalSymbol('+'), (...args) => args.reduce((a, b) => a + b));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b) => a * b));
env.set(new MalSymbol('/'), (...args) => args.reduce((a, b) => a / b));
env.set(new MalSymbol('-'), (...args) => args.reduce((a, b) => a - b));

const rep = str => PRINT(EVAL(READ(str), env));

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));

    } catch (e) {
      console.log(e);
    }
    repl();
  });

repl();
