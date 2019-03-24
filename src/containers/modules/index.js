export default {

  clickNew() {
    this.setState({
      newEntityModalOpen: true
    });
  },

  filterSearchText(inputArray, searchText, property) {
    if (searchText !== '') {
      var re = new RegExp(searchText, "i");
      return inputArray.filter(function(entity) {
        return re.test(entity[property]);
      });
    } else {
      return inputArray;
    }
  },

  sortClass(property) {
    var state = this.state.searchProperty;
    return state === property ? 'sort-header-active' : 'sort-header-inactive';
  }
}
