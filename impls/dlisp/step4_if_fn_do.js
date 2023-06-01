const readline = require('readline');
const { read_str } = require('./reader.js');
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

const handleLet = (ast, env) => {
  const bindings = ast.value[1].value;
  const env2 = new Env(env);

  for (let index = 0; index < bindings.length; index += 2) {
    env2.set(bindings[index], EVAL(bindings[index + 1], env2));
  }

  if (ast.value.length < 3) {
    return new MalNil();
  }
  return EVAL(ast.value[ast.value.length - 1], env2);
}

const handleIf = (ast, env) => {
  const condResult = EVAL(ast.value[1], env);

  if (condResult.value != "nil" && condResult.value !== false) {
    return EVAL(ast.value[2], env);
  }

  if (ast.value[3]) {
    return EVAL(ast.value[3], env);
  }
  return new MalNil();
}

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1])
}

const handleDo = (ast, env) => {
  const lists = ast.value.slice(1);
  const result = lists.map(x => EVAL(x, env));
  return result[result.length - 1];
}

const handleFn = (ast, env) => {
  return (...exprs) => {
    const newEnv = new Env(env);
    const variables = ast.value[1].value;

    for (let index = 0; index < variables.length; index++) {
      newEnv.set(variables[index], exprs[index]);
    }

    const result = EVAL(ast.value[2], newEnv);
    return result;
  }
}

const EVAL = (ast, env) => {
  if (!(ast instanceof MalList)) {
    return eval_ast(ast, env);
  }

  if (ast.isEmpty()) {
    return ast;
  }

  switch (ast.value[0].value) {
    case "def!": return handleDef(ast, env);
    case "let*": return handleLet(ast, env);
    case "do": return handleDo(ast, env);
    case "if": return handleIf(ast, env);
    case "fn*": return handleFn(ast, env);
  }

  const [fn, ...args] = eval_ast(ast, env).value;
  return fn.apply(null, args);
};

const PRINT = malValue => {
  return malValue.toString()
};

const env = new Env();

env.set(new MalSymbol('+'), (...args) => args.reduce((a, b) => a + b));
env.set(new MalSymbol('*'), (...args) => args.reduce((a, b) => a * b));
env.set(new MalSymbol('/'), (...args) => args.reduce((a, b) => a / b));
env.set(new MalSymbol('-'), (...args) => args.reduce((a, b) => a - b));
env.set(new MalSymbol('<'), (...args) => args[0] < args[1]);
env.set(new MalSymbol('>'), (...args) => args[0] > args[1]);
env.set(new MalSymbol('<='), (...args) => args[0] <= args[1]);
env.set(new MalSymbol('>='), (...args) => args[0] >= args[1]);
env.set(new MalSymbol('='), (...args) => args[0] === args[1]);
env.set(new MalSymbol('list'), (...args) => new MalList(args));
env.set(new MalSymbol('list?'), (args) => args instanceof MalList);
env.set(new MalSymbol('empty?'), (...args) => args[0].value === undefined);
env.set(new MalSymbol('count'), (...args) => args[0].value.length);

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
