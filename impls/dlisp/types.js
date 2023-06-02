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
}

class MalList extends MalValue {
  constructor(value) {
    super(value)
  }

  isEmpty() {
    return this.value.length == 0;
  }

  toString() {
    return '(' + this.value.map(x => x.toString()).join(' ') + ')';
  }
}

class MalVector extends MalValue {
  constructor(value) {
    super(value)
  }

  toString() {
    return '[' + this.value.map(x => x.toString()).join(' ') + ']';
  }
}

class MalNil extends MalValue {
  constructor() {
    super(null)
  }

  toString() {
    return "nil";
  }
}

class MalBoolean extends MalValue {
  constructor(args) {
    super(args)
  }
}

class MalKeyword extends MalValue {
  constructor(args) {
    super(args)
  }

  toString() {
    return this.value.toString();
  }
}

class MalString extends MalValue {
  constructor(args) {
    super(args)
  }


  toString() {
    return this.value.toString();
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
