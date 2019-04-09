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

let directory;
let entityNamePlural;

class StandardIndex extends React.Component {

  constructor(props) {
    super(props);

    let initialState = {
      fetching: true,
      entities: [],
      searchProperty: this.props.columns[0],
      searchText: '',
      newEntityModalOpen: false
    }

    entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    directory = ChangeCase.snakeCase(entityNamePlural);

    this.state = initialState;
  }

  componentDidMount() {
    this.props.fetchEntities(directory).then(() => {
      let entityArray = 'entities';
      this.setState({
        fetching: false,
        [entityArray]: this.props.entities
      });
    });
  }

  updateIndex(entities) {
    this.setState({
      newEntityModalOpen: false,
      entities: entities
    });
  }

  render() {
    const children = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          entityName: this.props.entityName,
          entityNamePlural: entityNamePlural,
          callback: this.updateIndex.bind(this)
        });
      }
    );

    let filteredEntities = Index.filterSearchText(this.state.entities, this.state.searchText, this.state.searchProperty);

    return(
      <div className="component">
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        <a className={ "btn float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Index.clickNew.bind(this) }>Add { ChangeCase.titleCase(this.props.entityName) }</a>
        <input className="search-box margin" onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ this.state.searchText } />
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
                          <a href={ `${directory}/${entity.id}${this.props.columnLinks && this.props.columnLinks[index] ? this.props.columnLinks[index] : ''}` }>
                            { this.renderValue(entity[column], index) }
                          </a>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Modal isOpen={ this.state.newEntityModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles(this.props.modalDimensions, this.props.modalRows) }>
          { children }
        </Modal>
      </div>
    );
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

  componentDidUpdate() {
    Common.matchColumnHeight();
  }
}

const mapStateToProps = (reducers) => {
  return {
    entities: reducers.standardReducer.entities
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(StandardIndex);
