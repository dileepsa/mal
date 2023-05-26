const { stdin } = require('process');

const READ = (args) => args
const EVAL = (args) => args
const PRINT = (args) => args

const rep = (args) => PRINT(EVAL(READ(args)));

const repl = () => {
  stdin.setEncoding('utf-8');
  stdin.write('user> ');
  stdin.on('data', (data) => {
    stdin.write(rep(data));
    stdin.write('user> ');
  });
}

repl();
