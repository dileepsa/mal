const areArrays = function (lhs, rhs) {
  const isArray = Array.isArray;
  return isArray(lhs) && isArray(rhs);
};

const isEqual = function (lhs, rhs) {
  if (!areArrays(lhs, rhs)) {
    return lhs === rhs;
  }

  const array1 = lhs;
  const array2 = rhs;

  if (array1.length !== array2.length) {
    return false;
  }

  for (let index = 0; index < array1.length; index++) {
    if (!isEqual(array1[index], array2[index])) {
      return false;
    }
  }
  return true;
};

exports.isEqual = isEqual;
