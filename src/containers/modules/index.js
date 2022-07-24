export default {

  clickNew() {
    this.setState({
      newEntityModalOpen: true
    });
  },

  filterSearchText(args) {
    const { entities, property, text } = args;
    if (text !== '') {
      let re = new RegExp(text, 'i');
      return entities.filter((entity) => {
        return re.test(entity[property]);
      });
    } else {
      return entities;
    }
  },

  sortClass(property, searchColumn) {
    return searchColumn.name === property ? 'sort-header-active' : 'sort-header-inactive';
  },

  sortDirection(sampleEntity) {
    if (sampleEntity && this.props.sortDesc && this.props.sortDesc[this.state.tab] && this.props.sortDesc[this.state.tab].indexOf(this.state.searchProperty) > -1) {
      return 'desc';
    } else {
      return 'asc';
    }
  },

  sortIndex(entity) {
    let propertyValue = entity[this.state.searchProperty];
    if (entity[`${this.state.searchProperty}Unix`]) {
      return entity[`${this.state.searchProperty}Unix`];
    } else if (typeof propertyValue === 'string' || propertyValue instanceof String) {
      return propertyValue.toLowerCase();
    } else if (typeof propertyValue == 'boolean') {
      return propertyValue.toString().toLowerCase();
    } else {
      return propertyValue;
    }
  }
}
