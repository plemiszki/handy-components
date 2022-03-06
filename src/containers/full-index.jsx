import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import _ from 'lodash'
import { fetchEntities } from '../actions/index'
import Common from './modules/common.jsx'
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
      spinner: true,
      [arrayName]: [],
      searchColumn: columns[0],
      searchText: '',
      newEntityModalOpen: false,
      columns
    }

    this.state = initialState;
  }

  componentDidMount() {
    const { directory, namespace } = this.props;
    const { arrayName } = this.state;
    this.props.fetchEntities({ directory, namespace }).then(() => {
      this.setState({
        spinner: false,
        [arrayName]: this.props[arrayName]
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
    const { includeNewButton, includeLinks, includeHover } = this.props;
    const { spinner, columns, directory, searchColumn, arrayName, searchText, entityNamePlural } = this.state;

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

    let componentClasses = ["component"];
    if (includeLinks) {
      componentClasses.push("include-links");
    }
    if (includeHover) {
      componentClasses.push("include-hover");
    }

    return(
      <div className={ componentClasses.join(" ") }>
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        { this.renderButton() }
        <input className={ `search-box${includeNewButton ? ' margin' : ''}` } onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ searchText } />
        <div className="white-box">
          { Common.renderGrayedOut(spinner, -36, -32, 5) }
          { Common.renderSpinner(spinner) }
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
                        if (includeLinks) {
                          return(
                            <td key={ index } className={ column.classes || '' }>
                              <a href={ `${directory}/${entity.id}${column.links || ''}` }>
                                { this.renderValue(entity[column.name], index) }
                              </a>
                            </td>
                          );
                        } else {
                          return(
                            <td key={ index } className={ column.classes || '' }>
                              <div className="link-padding">
                                { this.renderValue(entity[column.name], index) }
                              </div>
                            </td>
                          );
                        }
                      })}
                    </tr>
                  );
                }) }
              </tbody>
            </table>
          </div>
        </div>
        { this.renderNewEntityModal.call(this, children) }
      </div>
    );
  }

  renderButton() {
    if (this.props.includeNewButton) {
      return(
        <a className={ "btn float-button" + Common.renderDisabledButtonClass(this.state.spinner) } onClick={ Index.clickNew.bind(this) }>Add { ChangeCase.titleCase(this.props.entityName) }</a>
      );
    }
  }

  renderNewEntityModal(children) {
    if (this.props.includeNewButton) {
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
