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
