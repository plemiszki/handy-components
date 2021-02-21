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

class FullIndex extends React.Component {

  constructor(props) {
    super(props);

    const entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    const directory = ChangeCase.snakeCase(entityNamePlural);
    const arrayName = ChangeCase.camelCase(entityNamePlural);

    const columns = this.props.columns.map((column) => {
      if (typeof column === 'string') {
        return {
          name: column
        };
      } else {
        return column;
      }
    });

    const initialState = {
      entityNamePlural,
      directory,
      arrayName,
      fetching: true,
      [arrayName]: [],
      searchColumn: columns[0],
      searchText: '',
      newEntityModalOpen: false,
      columns
    }

    this.state = initialState;
  }

  componentDidMount() {
    this.props.fetchEntities({ directory: this.state.directory }).then(() => {
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

  standardIndexSort(entity) {
    const { searchColumn } = this.state;
    const searchProperty = searchColumn.sortColumn || searchColumn.name;
    return HandyTools.commonSort(searchProperty, entity);
  }

  render() {
    let fetching = this.state.fetching;
    let columns = this.state.columns;
    let directory = this.state.directory;
    let searchColumn = this.state.searchColumn;
    let arrayName = this.state.arrayName;
    let searchText = this.state.searchText;
    let entityNamePlural = this.state.entityNamePlural;

    const children = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          entityName: this.props.entityName,
          entityNamePlural,
          callback: this.updateIndex.bind(this)
        });
      }
    );

    let filteredEntities = Index.filterSearchText({ entities: this.state[arrayName], text: searchText, property: searchColumn.name });

    return(
      <div className="component">
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        { this.renderButton() }
        <input className={ `search-box${this.props.hideNewButton ? '' : ' margin'}` } onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ searchText } />
        <div className="white-box">
          { Common.renderSpinner(fetching) }
          { Common.renderGrayedOut(fetching, -36, -32, 5) }
          <div className="horizontal-scroll">
            <table className="admin-table sortable">
              <thead>
                <tr>
                  { columns.map((column, index) => {
                    return(
                      <th key={ index } style={ this.columnWidth(column) }>
                        <div className={ Index.sortClass.bind(this)(column.name) } onClick={ Common.changeState.bind(this, 'searchColumn', column) }>
                          { column.header || ChangeCase.titleCase(column.name) }
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  { columns.map((_, index) => {
                    return(
                      <td key={ index }></td>
                    );
                  })}
                </tr>
                { _.orderBy(filteredEntities, [this.standardIndexSort.bind(this)], searchColumn.sortDir || 'asc').map((entity, index) => {
                  return(
                    <tr key={ index }>
                      { columns.map((column, index) => {
                        return(
                          <td key={ index } className={ column.classes || '' }>
                            <a href={ `${directory}/${entity.id}${column.links || ''}` }>
                              { this.renderValue(entity[column.name], index) }
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

  columnWidth(column) {
    if (column.width) {
      return {
        minWidth: +column.width
      };
    }
  }

  renderValue(value, column) {
    if (column.ellipsis) {
      return HandyTools.ellipsis(value, column.ellipsis);
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

export default connect(mapStateToProps, mapDispatchToProps)(FullIndex);
