import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import _ from 'lodash'
import { fetchEntities } from '../actions/index'
import Common from './modules/common.js'
import Index from './modules/index.js'

class StandardIndex extends React.Component {

  constructor(props) {
    super(props);

    let entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    let directory = ChangeCase.snakeCase(entityNamePlural);
    let arrayName = ChangeCase.camelCase(entityNamePlural);

    let initialState = {
      entityNamePlural,
      directory,
      arrayName,
      fetching: true,
      [arrayName]: [],
      searchProperty: this.props.columns[0],
      searchText: '',
      newEntityModalOpen: false
    }

    this.state = initialState;
  }

  componentDidMount() {
    this.props.fetchEntities(this.state.directory, this.state.arrayName).then(() => {
      this.setState({
        fetching: false,
        [this.state.arrayName]: this.props[this.state.arrayName]
      });
    });
  }

  updateIndex(entities) {
    this.setState({
      newEntityModalOpen: false,
      [this.state.arrayName]: entities
    });
  }

  render() {
    const children = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          entityName: this.props.entityName,
          entityNamePlural: this.state.entityNamePlural,
          callback: this.updateIndex.bind(this)
        });
      }
    );

    let filteredEntities = Index.filterSearchText(this.state[this.state.arrayName], this.state.searchText, this.state.searchProperty);

    return(
      <div className="component">
        <h1>{ this.props.header || ChangeCase.titleCase(this.state.entityNamePlural) }</h1>
        { this.renderButton() }
        <input className={ `search-box${this.props.hideNewButton ? '' : ' margin'}` } onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ this.state.searchText } />
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="admin-table sortable">
            <thead>
              <tr>
                { this.props.columns.map((column, index) => {
                  return(
                    <th key={ index } style={ this.columnWidth(index) }>
                      <div className={ Index.sortClass.bind(this)(column) } onClick={ Common.changeState.bind(this, 'searchProperty', column) }>
                        { this.props.columnHeaders && this.props.columnHeaders[index] ? this.props.columnHeaders[index] : HandyTools.capitalize(column) }
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr>
                { this.props.columns.map((_, index) => {
                  return(
                    <td key={ index }></td>
                  );
                })}
              </tr>
              { _.sortBy(filteredEntities, [HandyTools.commonSort.bind(this)]).map((entity, index) => {
                return(
                  <tr key={ index }>
                    { this.props.columns.map((column, index) => {
                      return(
                        <td key={ index } className={ this.props.columnClasses ? this.props.columnClasses[index] : '' }>
                          <a href={ `${this.state.directory}/${entity.id}${this.props.columnLinks && this.props.columnLinks[index] ? this.props.columnLinks[index] : ''}` }>
                            { this.renderValue(entity[column], index) }
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                );
              }) }
            </tbody>
          </table>
        </div>
        { this.renderModal.call(this, children) }
      </div>
    );
  }

  renderButton() {
    if (!this.props.hideNewButton) {
      return(
        <a className={ "btn float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Index.clickNew.bind(this) }>Add { ChangeCase.titleCase(this.props.entityName) }</a>
      );
    }
  }

  renderModal(children) {
    if (!this.props.hideNewButton) {
      return(
        <Modal isOpen={ this.state.newEntityModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles(this.props.modalDimensions, this.props.modalRows) }>
          { children }
        </Modal>
      );
    }
  }

  columnWidth(index) {
    if (this.props.columnWidths && this.props.columnWidths[index]) {
      return {
        width: +this.props.columnWidths[index]
      };
    }
  }

  renderValue(value, index) {
    if (this.props.ellipses && this.props.ellipses[index]) {
      return HandyTools.ellipsis(value, this.props.ellipses[index]);
    } else {
      return value;
    }
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StandardIndex);
