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

class SearchIndex extends React.Component {

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
      orderByColumn: columns[0],
      newEntityModalOpen: false,
      columns,
      page: 1,
      pages: []
    }

    this.state = initialState;
  }

  componentDidMount() {
    this.fetchEntities();
  }

  fetchEntities() {
    const { orderByColumn } = this.state;
    this.props.fetchEntities({
      directory: this.state.directory,
      batchSize: this.props.batchSize,
      page: this.state.page,
      orderBy: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
      orderDir: orderByColumn.sortDir || 'asc'
    }).then(() => {
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
    const { orderByColumn } = this.state;
    const orderByProperty = orderByColumn.sortColumn || orderByColumn.name;
    return HandyTools.commonSort(orderByProperty, entity);
  }

  changePage(pageNumber) {
    this.setState({
      fetching: true,
      page: pageNumber
    }, () => {
      this.fetchEntities();
    });
  }

  columnHeaderClass(column) {
    return this.state.orderByColumn === column ? 'sort-header-active' : 'sort-header-inactive';
  }

  clickHeader(column) {
    this.setState({
      fetching: true,
      orderByColumn: column
    }, () => {
      this.fetchEntities();
    });
  }

  render() {
    let { fetching, columns, directory, orderByColumn, arrayName, entityNamePlural } = this.state;

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

    return(
      <div className="component">
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        { this.renderButton() }
        <div className="white-box">
          <div className="top-section">
            { Common.renderSpinner(fetching) }
            { Common.renderGrayedOut(fetching, -36, -32, 5) }
            <div className="horizontal-scroll">
              <table className="admin-table sortable">
                <thead>
                  <tr>
                    { columns.map((column, index) => {
                      return(
                        <th key={ index } style={ this.columnWidth(column) }>
                          <div className={ this.columnHeaderClass.call(this, column) } onClick={ () => { this.clickHeader(column) } }>
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
                  { _.orderBy(this.state[arrayName], [this.standardIndexSort.bind(this)], orderByColumn.sortDir || 'asc').map((entity, index) => {
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
          <hr />
          { this.renderPageLinks() }
        </div>
        { this.renderModal.call(this, children) }
        <style jsx>{`
            .white-box {
              padding: 0 !important;
            }
            hr {
              width: 100% !important;
              margin-left: 0 !important;
              margin-bottom: 0 !important;
            }
            .top-section, .page-links {
              padding: 36px 32px;
            }
        `}</style>
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

  renderPageLinks() {
    const { pageNumbers, morePages } = this.props;
    if (!pageNumbers) {
      return null;
    }
    const showLeftArrow = pageNumbers[0] !== 1;
    const showRightArrow = morePages;
    let numOfLinks = pageNumbers.length;
    if (showLeftArrow) {
      numOfLinks += 1;
    }
    if (showRightArrow) {
      numOfLinks += 1;
    }
    return(
      <div className="page-links-section">
        <div className="page-link-boxes-container">
          <div className="page-link-boxes-grid">
            { showLeftArrow ? (<div className="page-link-box clickable">&#8592;</div>) : null }
            {
              pageNumbers.map((pageNumber) => {
                if (pageNumber === this.state.page) {
                  return(
                    <div key={ pageNumber } className="page-link-box current-page" onClick={ () => { this.changePage(this.state.page - 1) }}>{ pageNumber }</div>
                  );
                } else {
                  return(
                    <div key={ pageNumber } className="page-link-box clickable" onClick={ () => { this.changePage(pageNumber) }}>{ pageNumber }</div>
                  );
                }
              })
            }
            { showRightArrow ? (<div className="page-link-box clickable" onClick={ () => { this.changePage(this.state.page + 1) }}>&#8594;</div>) : null }
          </div>
        </div>
        <style jsx>{`
            .page-links-section {
              padding: 36px 32px;
              text-align: center;
            }
            .page-link-boxes-container {
              display: inline-block;
            }
            .page-link-boxes-grid {
              display: grid;
              grid-template-columns: repeat(${numOfLinks}, 50px);
              grid-column-gap: 10px;
              justify-items: center;
            }
            .page-link-box {
              text-align: center;
            }
            .current-page {
              color: #01647C;
              font-family: 'TeachableSans-ExtraBold';
            }
            .page-link-box.clickable {
              cursor: pointer;
            }
        `}</style>
      </div>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(SearchIndex);
