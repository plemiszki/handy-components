import ChangeCase from 'change-case'

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const convertBooleanToTFString = (boolean) => {
  return boolean ? 't' : 'f';
}

export const convertObjectKeysToUnderscore = (object) => {
  if (Array.isArray(object)) {
    return object;
  }
  let result = {};
  Object.keys(object).forEach((key) => {
    let value = object[key];
    if (typeof value === 'object' && Array.isArray(value) === false) {
      value = convertObjectKeysToUnderscore(value);
    }
    result[ChangeCase.snakeCase(key)] = value;
  });
  return result;
}

export const convertTFStringsToBoolean = (string) => {
  if (string === "t") {
    return true;
  } else if (string === "f") {
    return false;
  } else {
    return string;
  }
}

export const ellipsis = (string, n) => {
  if (string.length > n) {
    return string.slice(0, n) + "...";
  } else {
    return string;
  }
}

export const ordinatize = (input) => {
  var j = input % 10,
      k = input % 100;
  if (j == 1 && k != 11) {
      return input + "st";
  }
  if (j == 2 && k != 12) {
      return input + "nd";
  }
  if (j == 3 && k != 13) {
      return input + "rd";
  }
  return input + "th";
}

export const pluralize = (string, n) => {
  if (n === 1) {
    return string;
  } else {
    return string + 's';
  }
}

export const removeFinanceSymbols = (string) => {
  return string.replace('$', '').replace(',', '');
}

export const removeFinanceSymbolsFromEntity = (entity, fields) => {
  fields.flat().forEach((field) => {
    if (field.removeFinanceSymbols) {
      entity[field.property] = removeFinanceSymbols(entity[field.property]);
    }
  });
  return entity;
}

export const stringifyDate = (date) => {
  return (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear().toString().slice(-2);
}

export const stringifyFullDate = (date) => {
  return `${MONTHS[date.getMonth()]} ${ordinatize(date.getDate())}, ${date.getFullYear()}`;
}

export const stringifyJSONFields = (args) => {
  const { entity, jsonFields } = args;
  jsonFields.forEach((field) => {
    entity[field] = JSON.stringify(entity[field], null, 2);
  });
  return entity;
}
