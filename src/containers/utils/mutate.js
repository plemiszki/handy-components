export const removeFromArray = (array, element) => {
    const index = array.indexOf(element);
    if (index >= 0) {
      array.splice(index, 1);
    }
    return array;
}
