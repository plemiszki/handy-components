import React, { Component } from 'react'
import Common from './modules/common.jsx'
import Index from './modules/index.js'
import HandyTools from 'handy-tools'

class ModalSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: ''
    };
  }

  render() {
    const { func, options, property } = this.props;
    const { searchText } = this.state;
    const filteredOptions = Index.filterSearchText({ entities: options, text: searchText, property });
    return(
      <div className="modal-select handy-component">
        <input className="search-box" onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ searchText } data-field="searchText" />
        <ul className="licensor-modal-list">
          { this.renderNoneOption() }
          { HandyTools.alphabetizeArrayOfObjects(filteredOptions, property).map((option, index) => {
            return(
              <li key={ index } onClick={ () => { func(option) } } data-id={ option.id } data-type={ option.itemType }>{ option[property] }</li>
            );
          }) }
        </ul>
      </div>
    );
  }

  renderNoneOption() {
    if (this.props.noneOption) {
      return(
        <li onClick={ this.props.func } data-id={ null } data-type={ null }>(None)</li>
      );
    }
  }
}

export default ModalSelect;
