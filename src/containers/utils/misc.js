export const todayDMY = () => {
    const date = new Date;
    const month = date.getMonth() + 1;
    const dayOfMonth = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${dayOfMonth}/${year}`;
}

export const rearrangeFields = (args) => {
    const { currentOrder, draggedIndex, dropZoneIndex } = args;
    let result = {};
    if (dropZoneIndex == -1) {
      result[0] = currentOrder[draggedIndex];
      delete currentOrder[draggedIndex];
    }
    var currentValues = Object.values(currentOrder);
    for (var i = 0; i < Object.keys(currentOrder).length; i++) {
      if (dropZoneIndex == -1 || i != draggedIndex) {
        result[Object.keys(result).length] = currentValues[i];
      }
      if (i == dropZoneIndex) {
        result[Object.keys(result).length] = currentValues[draggedIndex];
      }
    }
    return result;
}
