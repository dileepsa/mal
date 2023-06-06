const { MalSymbol, MalString, MalKeyword, MalBoolean, MalValue, MalList, MalVector, MalNil, MalHashMap, createMalString } = require('./types.js');
const REG_EXP = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    this.position++;
    return token;
  }
}

const tokenize = (str) =>
  [...str.matchAll(REG_EXP)].map(x => x[1]).slice(0, -1).filter(x => !x.startsWith(';'));

const read_atom = (reader) => {
  const token = reader.next();

  if (token.match(/^-?[0-9]+$/)) {
    return parseInt(token);
  }

  if (token == 'true') {
    return new MalBoolean(true);
  }

  if (token == 'false') {
    return new MalBoolean(false);
  }

  if (token == 'nil') {
    return new MalNil();
  }

  if (token.startsWith('@')) {
    return new MalList([new MalSymbol('deref'), new MalSymbol(token.slice(1))]);
  }

  if (token.startsWith('"') && token.endsWith('"')) {
    const str = createMalString(token.slice(1, -1));
    return new MalString(str);
  }

  return new MalSymbol(token);
}

const read_list = (reader) => {
  const ast = read_seq(reader, ')')
  return new MalList(ast);
}

const read_vector = (reader) => {
  const ast = read_seq(reader, ']')
  return new MalVector(ast);
}

const read_seq = (reader, closingSymbol) => {
  reader.next();

  const ast = [];
  while (reader.peek() != closingSymbol) {
    if (reader.peek() === undefined) {
      throw "unbalanced"
    }

    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
}

const read_hash_map = (reader) => {
  const ast = read_seq(reader, '}')
  return new MalHashMap(ast);
}

const read_keyword = (reader) => {
  return new MalKeyword(reader.next());
}

const read_form = reader => {
  const token = reader.peek();

  switch (token[0]) {
    case '(':
      return read_list(reader)
    case '[':
      return read_vector(reader)
    case '{':
      return read_hash_map(reader)
    case ':':
      return read_keyword(reader)
    case ';':
      reader.next();
      return new MalNil();
    case '@':
      return prependSymbol(reader, 'deref')
    default:
      return read_atom(reader);
  }
}

const prependSymbol = (reader, symbolStr) => {
  reader.next();
  const symbol = new MalSymbol(symbolStr);
  const newAst = read_form(reader);
  return new MalList([symbol, newAst]);
}

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
}

module.exports = { read_str };
