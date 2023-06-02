const { MalList, MalNil, MalString } = require("./types");
const { isEqual } = require('./isEqual.js');

const getValues = (args) => {
  return args.map(x => x.value ? x.value : x);
}

const ns = {
  '+': (...args) => args.reduce((a, b) => a + b),
  '-': (...args) => args.reduce((a, b) => a - b),
  '*': (...args) => args.reduce((a, b) => a * b),
  '/': (...args) => args.reduce((a, b) => a / b),
  '<': (a, b) => a < b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '>=': (a, b) => a >= b,
  '=': (a, b) => {
    return a.value != undefined && b.value != undefined ? isEqual(a.value, b.value) : isEqual(a, b);
  },
  'list': (...args) => new MalList(args),
  'list?': (args) => args instanceof MalList,
  'empty?': (args) => args.value === undefined,
  'count': (args) => args.value.length,
  'not': args => !args,
  'prn': (...args) => {
    const result = args.map(x => x.value ? `"${x.value}"` : x);
    console.log(...result);
    return new MalNil();
  },
  'pr-str': (...args) => {
    console.log(args.map(x => `\\"${x.value}\\"`));
    return new MalString(...args.map(x => `\\"${x.value}\\"`));
  },
  'println': (...args) => {
    console.log(...args.map(x => x.value));
    return new MalNil();
  },
  'str': (...args) => {
    return new MalString(getValues(args).join(''));
  }
}

module.exports = { ns };
