const toString = malValue => {
  if (typeof (malValue) === 'function') {
    return "#<function>";
  }

  return malValue.toString()
}

module.exports = { toString };
