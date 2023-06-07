const readline = require('readline');
const { read_str } = require('./reader.js');
const { Env } = require('./env.js');
const { ns } = require('./core.js');
const { toString } = require('./printer.js');
const { MalSymbol,
  MalList,
  MalFunction,
  MalVector,
  MalSequence,
  MalHashMap,
  MalNil } = require('./types.js');

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
  if (condResult.value !== false && !(condResult instanceof MalNil)) {
    return ast.value[2] ?? new MalNil();
  }

  if (ast.value[3] !== undefined) {
    return ast.value[3];
  }

  return new MalNil();
}

const handleDef = (ast, env) => {
  env.set(ast.value[1], EVAL(ast.value[2], env));
  return env.get(ast.value[1])
}

const handleDefMacro = (ast, env) => {
  const macro = EVAL(ast.value[2], env);
  macro.isMacro = true;
  env.set(ast.value[1], macro);
  return env.get(ast.value[1]);
}

const isMacroCall = (ast, env) => {

  try {
    return (ast instanceof MalList &&
      !ast.isEmpty() &&
      ast.value[0] instanceof MalSymbol &&
      env.get(ast.value[0]).isMacro
    );
  } catch (error) {
    return false;
  };
}

const macroExpand = (ast, env) => {

  while (isMacroCall(ast, env)) {
    const macro = env.get(ast.value[0]);
    ast = macro.apply(null, ast.value.slice(1));
  };
  return ast;
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

    ast = macroExpand(ast, env);

    if (!(ast instanceof MalList)) {
      return eval_ast(ast, env);
    }

    switch (ast.value[0].value) {
      case "def!": return handleDef(ast, env);
      case "defmacro!": return handleDefMacro(ast, env);
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
      case "quote":
        return ast.value[1];
      case "unquote":
        ast = ast.value[1];
        break;
      case "quasiquote":
        ast = quasiquote(ast.value[1], env);
        break;
      case "quasiquoteexpand":
        return quasiquote(ast.value[1], env);
      case "macroexpand":
        return macroExpand(ast.value[1], env);
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

const handleMalSequence = (ast, env) => {
  let result = new MalList([]);

  for (let index = ast.value.length - 1; index >= 0; index--) {
    const element = ast.value[index];

    if (element instanceof MalList && element.beginsWith('splice-unquote')) {
      result = new MalList(
        [new MalSymbol('concat'), element.value[1], result]);
    } else {
      result = new MalList(
        [new MalSymbol('cons'), quasiquote(element), result]);
    }
  }

  return result;
}

const quasiquote = (ast, env) => {
  if (ast instanceof MalList && ast.beginsWith('unquote')) {
    return ast.value[1];
  }

  if (ast instanceof MalSequence) {
    let result = handleMalSequence(ast, env);

    if (ast instanceof MalList) {
      return result;
    }

    return new MalList([new MalSymbol('vec'), result])
  }

  if (ast instanceof MalSymbol) {
    return new MalList([new MalSymbol('quote'), ast])
  }
  return ast;
}

const PRINT = malValue => toString(malValue, true);

const rep = str => PRINT(EVAL(READ(str), env));

const env = new Env();
Object.entries(ns).forEach(([symbol, val]) => env.set(new MalSymbol(symbol), val));
env.set(new MalSymbol("eval"), (ast) => EVAL(ast, env));
env.set(new MalSymbol("*ARGV*"), new MalList(process.argv.slice(2)));

rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');
rep('(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list \'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw "odd number of forms to cond")) (cons \'cond (rest (rest xs)))))))');
rep("(def! not (fn* (a) (if a false true)))");

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
