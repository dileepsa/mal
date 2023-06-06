const readline = require('readline');
const { read_str } = require('./reader.js');
const { Env } = require('./env.js');
const { ns } = require('./core.js');
const { toString } = require('./printer.js');
const { MalSymbol, MalList, MalFunction, MalVector, MalHashMap, MalNil } = require('./types.js');

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
  const [bindings, ...forms] = ast.value.slice(1);
  const env2 = new Env(env);

  for (let index = 0; index < bindings.value.length; index += 2) {
    env2.set(bindings.value[index], EVAL(bindings.value[index + 1], env2));
  }

  const doForms = new MalList([new MalSymbol('do'), ...forms]);
  return [doForms, env2];
}

const handleIf = (ast, env) => {
  const condResult = EVAL(ast.value[1], env);
  if (condResult != "nil" && condResult != false) {
    return ast.value[2];
  }

  if (ast.value[3]) {
    return ast.value[3];
  }

  return new MalNil();
}

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1])
}

const handleDo = (ast, env) => {
  const lists = ast.value.slice(1);
  lists.slice(0, -1).forEach(x => EVAL(x, env));
  return lists[lists.length - 1];
}

const handleFn = (ast, env) => {
  const [bindings, ...body] = ast.value.slice(1);
  const doForms = new MalList([new MalSymbol('do'), ...body]);

  const fn = (...args) => {
    const newEnv = new Env(env, bindings.value, args);
    return EVAL(ast.value[2], newEnv);
  }

  return new MalFunction(doForms, bindings, env, fn);
}

const EVAL = (ast, env) => {

  while (true) {
    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    if (ast.isEmpty()) {
      return ast;
    }

    switch (ast.value[0].value) {
      case "def!": return handleDef(ast, env);
      case "let*":
        [ast, env] = handleLet(ast, env);
        break;
      case "do":
        ast = handleDo(ast, env);
        break;
      case "if":
        ast = handleIf(ast, env);
        break;
      case "fn*":
        ast = handleFn(ast, env);
        break;
      default:
        const [fn, ...args] = eval_ast(ast, env).value;
        if (fn instanceof MalFunction) {
          const oldEnv = fn.env;
          const binds = fn.binds;
          ast = fn.value;
          env = new Env(oldEnv, binds.value, args);
        } else {
          return fn.apply(null, args);
        }
    }
  }
};

const PRINT = malValue => toString(malValue, true);

const rep = str => PRINT(EVAL(READ(str), env));

const env = new Env();
Object.entries(ns).forEach(([symbol, val]) => env.set(new MalSymbol(symbol), val));
env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
env.set(new MalSymbol("*ARGV*"), new MalList(process.argv.slice(2)));

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

const repl = () =>
  rl.question('user> ', line => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    }
    repl();
  });

if (process.argv.length >= 3) {
  rep(`(load-file "${process.argv[2]}")`)
  rl.close()
} else {
  repl();
}
