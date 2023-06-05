class MalValue {
  constructor(value) {
    this.value = value
  }

  toString() {
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

class MalList extends MalValue {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length == 0;
  }

  isEqual(otherVal) {
    return otherVal instanceof MalList && this.value === otherVal;
  }

  toString() {
    return '(' + this.value.map(x => x.toString()).join(' ') + ')';
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value)
  }

  isEqual(otherVal) {
    return otherVal instanceof MalVector && this.value === otherVal;
  }

  toString() {
    return '[' + this.value.map(x => x.toString()).join(' ') + ']';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null)
  }

  isEqual(otherVal) {
    return otherVal instanceof Malnil && this.value === otherVal;
  }
  toString() {
    return "nil";
  }
}

class MalBoolean extends MalValue {
  constructor(args) {
    super(args)
  }
  isEqual(otherVal) {
    return otherVal instanceof MalBoolean && this.value === otherVal;
  }
  toString() {
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

  toString() {
    return `"${this.value}"`;
  }
}

class MalFunction extends MalValue {
  constructor(ast, binds, env) {
    super(ast);
    this.binds = binds;
    this.env = env;
  }

  toString() {
    return "#<function>";
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

  toString() {
    return '{' + this.value.map(this.#displayObject).join(' ').slice(0, -1) + '}';
  }
}

module.exports = {
  MalFunction,
  MalSymbol,
  MalValue,
  MalList,
  MalVector,
  MalNil,
  MalBoolean,
  MalHashMap,
  MalKeyword,
  MalString
};
