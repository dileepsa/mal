const toString = (val, print_readably = false) => {
  if (val instanceof MalValue) {
    return val.toString(print_readably);
  }

  return val.toString();
}

class MalValue {
  constructor(value) {
    this.value = value
  }

  toString(printReadbly = false) {
    return this.value.toString();
  }
}

class MalSymbol extends MalValue {
  constructor(value) {
    super(value);
  }
  isEqual(otherVal) {
    return otherVal instanceof MalSymbol && this.value === otherVal;
  }
}

const createMalString = (str) => {
  const readableString = str.replace(/\\(.)/g, (y, captured) => captured === 'n' ? '\n' : captured);
  return new MalString(readableString);
}

class MalSequence extends MalValue {
  constructor(value) {
    super(value)
  }

  nth(n) {
    if (n >= this.value.length) {
      throw "index out of range"
    }
    return this.value[n];
  }

  first() {
    return this.value[0] ?? new MalNil();
  }

  rest() {
    return new MalList(this.value.slice(1));
  }
}

class MalList extends MalSequence {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length == 0;
  }

  isEqual(otherVal) {
    return otherVal instanceof MalList && this.value === otherVal;
  }

  beginsWith(symbol) {
    return this.value.length > 0 && this.value[0].value === symbol;
  }

  toString(printReadbly) {
    return '(' + this.value.map(x => toString(x, printReadbly)).join(' ') + ')';
  }
}

class MalVector extends MalSequence {
  constructor(value) {
    super(value)
  }

  isEqual(otherVal) {
    return otherVal instanceof MalVector && this.value === otherVal;
  }

  toString(printReadbly = false) {
    return '[' + this.value.map(x => toString(x, printReadbly)).join(' ') + ']';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null)
  }

  isEqual(otherVal) {
    return otherVal instanceof Malnil && this.value === otherVal;
  }

  toString(printReadbly = false) {
    return "nil";
  }

  first() {
    return this;
  }
}

class MalBoolean extends MalValue {
  constructor(args) {
    super(args)
  }
  isEqual(otherVal) {
    return otherVal instanceof MalBoolean && this.value === otherVal;
  }

  toString(printReadbly = false) {
    return this.value;
  }
}

class MalKeyword extends MalValue {
  constructor(args) {
    super(args)
  }

  isEqual(otherVal) {
    return otherVal instanceof MalKeyword && this.value === otherVal.value;
  }
}

class MalString extends MalValue {
  constructor(args) {
    super(args)
  }

  isEqual(otherVal) {
    return otherVal instanceof MalString && this.value === otherVal.value;
  }

  toString(printReadbly) {
    if (printReadbly) {
      return '"' + this.value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n") + '"';
    }

    return `"${this.value}"`;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env, fn, isMacro = false) {
    super(ast);
    this.binds = binds;
    this.env = env;
    this.fn = fn
    this.isMacro = isMacro
  }

  toString(printReadbly = false) {
    return "#<function>";
  }

  apply(ctx, args) {
    return this.fn.apply(ctx, args);
  }
}

class MalHashMap extends MalValue {
  constructor(args) {
    super(args)
  }

  #displayObject(x, i) {
    if ((i + 1) % 2 == 0) {
      return `${x},`;
    }
    return x;
  }

  isEqual(otherVal) {
    return otherVal instanceof MalHashMap && this.value === otherVal.value;
  }

  toString(printReadbly = false) {
    return '{' + this.value.map(this.#displayObject).join(' ').slice(0, -1) + '}';
  }
}

class MalAtom extends MalValue {
  constructor(args) {
    super(args)
  }

  toString(printReadbly = false) {
    return `(atom ${toString(this.value, printReadbly)})`
  };

  deref() {
    return this.value;
  }

  reset(value) {
    this.value = value;
    return this.value
  }

  swap(f, args) {
    this.value = f.apply(null, [this.value, ...args]);
    return this.value;
  }
}

module.exports = {
  MalAtom,
  MalFunction,
  MalSymbol,
  MalValue,
  MalList,
  MalVector,
  MalNil,
  MalBoolean,
  MalHashMap,
  MalKeyword,
  MalString,
  MalSequence,
  createMalString,
  toString
};
