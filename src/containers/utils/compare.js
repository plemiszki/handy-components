export const objectsAreEqual = (obj1, obj2) => {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export const stringIsDate = (string) => {
    if (!/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(string)) { // First check for the pattern
      return false;
    }

    const parts = string.split('/');
    const day = parseInt(parts[1], 10);
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[2], 10);

    if (month == 0 || month > 12) { // Check the range of month
      return false;
    }

    const monthLengths = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) { // Adjust for leap years
      monthLengths[1] = 29;
    }

    return day > 0 && day <= monthLengths[month - 1]; // Check the range of the day
}

export const stringIsNumber = (string) => {
    return !isNaN(string) && !isNaN(parseFloat(string));
}
