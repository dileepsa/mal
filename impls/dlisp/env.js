class Env {
  #outer;
  constructor(outer, binds, exprs) {
    this.#outer = outer;
    this.data = {}
  }

  set(symbolKey, Malvalue) {
    this.data[symbolKey.value] = Malvalue;
  }

  find(symbol) {
    if (this.data[symbol.value]) {
      return this;
    }
    if (this.#outer) {
      return this.#outer.find(symbol);
    }
  }

  get(symbol) {
    const env = this.find(symbol)
    if (!env) {
      throw `${symbol.value} not found`;
    }

    return env.data[symbol.value];
  }
}

module.exports = { Env }