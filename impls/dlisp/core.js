const { MalList, MalNil, MalString, MalAtom, createMalString, MalVector, MalSequence, MalSymbol, MalBoolean } = require("./types");
const { isEqual } = require('./isEqual.js');
const { read_str } = require("./reader");
const fs = require('fs');

const getValues = (args) => {
  return args.map(x => x.value ? x.value : x);
}

const ns = {
  '+': (...args) => args.reduce((a, b) => a + b),
  '-': (...args) => args.reduce((a, b) => a - b),
  '*': (...args) => args.reduce((a, b) => a * b),
  '/': (...args) => args.reduce((a, b) => a / b),
  '<': (a, b) => a < b,
  '>': (a, b) => new MalBoolean(a > b),
  '<=': (a, b) => new MalBoolean(a <= b),
  '>=': (a, b) => new MalBoolean(a >= b),
  '=': (a, b) => {
    return a.value != undefined && b.value != undefined ? isEqual(a.value, b.value) : isEqual(a, b);
  },
  'list': (...args) => new MalList(args),
  'list?': (args) => args instanceof MalList,
  'empty?': (args) => args.value === undefined,
  'count': (args) => {
    return args instanceof MalNil ? 0 : args.value.length
  },
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
  },
  'read-string': (str) => read_str(str.value),
  'slurp': (fileName) => {
    return new MalString(fs.readFileSync(fileName.value, 'utf-8'));
  },
  'atom': value => {
    return new MalAtom(value)
  },
  'atom?': value => {
    return value instanceof MalAtom
  },
  'deref': value => value.deref(),
  'swap!': (atom, f, ...args) => atom.swap(f, args),
  'reset!': (currentVal, val) => currentVal.reset(val),
  'cons': (value, list) => new MalList([value, ...list.value]),
  'concat': (...lists) => new MalList(lists.flatMap(x => x.value)),
  'vec': (list) => new MalVector(list.value),
  'nth': (list, n) => list.nth(n),
  'first': (list) => list instanceof MalNil ? new MalNil() : list.first(),
  'rest': (list) => list instanceof MalNil ? new MalList([]) : list.rest(),
}

module.exports = { ns };
