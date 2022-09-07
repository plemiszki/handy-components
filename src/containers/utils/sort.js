export const alphabetizeArrayOfObjects = (array, property) => {
  if (array === undefined) {
    throw `alphabetize array of objects - array is missing (alphabetizing by ${property})`;
  }
  if (property === undefined) {
    throw `alphabetize array of objects - property is missing`;
  }
  return array.sort(function(a, b) {
    if (a[property] === undefined || b[property] === undefined) {
      throw `alphabetize array of objects - ${property} property does not exist in array element`;
    }
    if (a[property].toString().toUpperCase() < b[property].toString().toUpperCase()) {
      return -1;
    } else if (a[property].toString().toUpperCase() > b[property].toString().toUpperCase()) {
      return 1;
    } else {
      return 0;
    }
  });
}

export const commonSort = (property, entity) => {
  if (!property || !entity) {
    throw `commonSort is missing proper arguments`;
  }
  var propertyValue = entity[property];
  if (typeof propertyValue === "string" || propertyValue instanceof String) {
    return propertyValue.toLowerCase();
  } else if (typeof propertyValue == "boolean") {
    return propertyValue.toString().toLowerCase();
  } else {
    return propertyValue;
  }
}

export const sortArrayOfObjects = (array, arg) => {
  let property = Array.isArray(arg) ? arg[0] : arg;
  return array.sort(function(a, b) {
    if (parseInt(a[property]) < parseInt(b[property])) {
      return -1;
    } else if (parseInt(a[property]) > parseInt(b[property])) {
      return 1;
    } else {
      if (Array.isArray(arg)) {
        property = arg[1];
        if (parseInt(a[property]) < parseInt(b[property])) {
          return -1;
        } else if (parseInt(a[property]) > parseInt(b[property])) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
  });
}
