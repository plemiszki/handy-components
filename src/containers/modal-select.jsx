import React, { Component } from 'react'
import Common from './modules/common.js'
import Index from './modules/index.js'

class ModalSelect extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: ''
    };
  }

  render() {
    return(
      <div className="modal-select">
        <input className="search-box" onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ this.state.searchText } data-field="searchText" />
        <ul className="licensor-modal-list">
          { this.renderNoneOption() }
          { Index.filterSearchText(this.props.options, this.state.searchText, this.props.property).map((option, index) => {
            return(
              <li key={ index } onClick={ this.props.func } data-id={ option.id } data-type={ option.itemType }>{ option[this.props.property] }</li>
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
