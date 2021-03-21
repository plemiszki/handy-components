import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import _ from 'lodash'
import { fetchEntities, sendRequest } from '../actions/index'
import Common from './modules/common.jsx'
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
      newModalOpen: false,
      searchModalOpen: false,
      columns,
      page: 1,
      pages: [],
      searchCriteria: {}
    }

    this.state = initialState;
  }

  componentDidMount() {
    this.fetchEntities();
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }

  fetchEntities() {
    const { directory, page, orderByColumn, searchCriteria, arrayName } = this.state;
    this.props.fetchEntities({
      directory,
      batchSize: this.props.batchSize,
      page,
      orderBy: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
      orderDir: orderByColumn.sortDir || 'asc',
      searchCriteria: HandyTools.convertObjectKeysToUnderscore(searchCriteria)
    }).then(() => {
      this.setState({
        fetching: false,
        [arrayName]: this.props[arrayName]
      });
    });
  }

  updateIndex(entities) {
    this.setState({
      newModalOpen: false,
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
      page: 1,
      [this.state.arrayName]: [],
      orderByColumn: column
    }, () => {
      this.fetchEntities();
    });
  }

  clickExport() {
    const { orderByColumn, searchCriteria } = this.state;
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: '/api/invoices/export',
      method: 'post',
      csrfToken: true,
      data: {
        orderBy: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
        orderDir: orderByColumn.sortDir || 'asc',
        searchCriteria: HandyTools.convertObjectKeysToUnderscore(searchCriteria)
      }
    }).then(() => {
      this.setState({
        job: this.props.job,
        fetching: false,
        jobModalOpen: true
      });
    });
  }

  updateSearchCriteria(searchCriteria) {
    this.setState({
      searchCriteria,
      searchModalOpen: false,
      fetching: true,
      page: 1,
      [this.state.arrayName]: []
    }, () => {
      this.fetchEntities();
    });
  }

  render() {
    let { fetching, columns, directory, orderByColumn, arrayName, entityNamePlural, searchCriteria } = this.state;
    const searchActive = Object.keys(searchCriteria).length > 0;
    const children = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          callback: this.updateSearchCriteria.bind(this),
          criteria: this.state.searchCriteria,
          rows: this.props.searchModalRows
        });
      }
    );

    return(
      <div className="component">
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        { this.renderNewButton() }
        { this.renderExportButton() }
        <a className={ 'btn search-button' + Common.renderDisabledButtonClass(this.state.fetching) + (searchActive ? ' active' : '') } onClick={ Common.changeState.bind(this, 'searchModalOpen', !this.state.searchModalOpen) }></a>
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
        { this.renderNewModal.call(this, children) }
        { this.renderSearchModal.call(this, children) }
        { Common.renderJobModal.call(this, this.state.job) }
        <style jsx>{`
            .search-button {
              float: right;
              width: 47px;
              height: 47px;
              padding: 0;
              background-color: white;
              background-image: url('/assets/handy-components/images/magnifying-glass.svg');
              background-repeat: no-repeat;
              background-position: center;
              border: 1px solid #E4E9ED;
              border-radius: 100px;
              cursor: pointer;
            }
            .search-button:hover {
              border: 1px solid #CBD0D4;
            }
            .search-button:active {
              box-shadow: none;
            }
            .search-button.active {
              background-color: #01647C;
            }
            .search-button.active:hover {
              background-color: #013b49;
            }
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

  renderNewButton() {
    if (this.props.showNewButton) {
      return(
        <a className={ "btn float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Index.clickNew.bind(this) }>Add { ChangeCase.titleCase(this.props.entityName) }</a>
      );
    }
  }

  renderExportButton() {
    if (this.props.showExportButton) {
      return(
        <>
          <a className={ "export-button btn" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickExport.bind(this) }>Export</a>
          <style jsx>{`
            .export-button {
              float: right;
              margin-left: 30px;
            }
          `}</style>
        </>
      );
    }
  }

  renderSearchModal(children) {
    return(
      <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.searchModalStyles(this.props.searchModalDimensions, this.props.searchModalRows) }>
        { children }
      </Modal>
    );
  }

  renderNewModal(children) {
    if (this.props.showNewButton) {
      return(
        <Modal isOpen={ this.state.newModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles(this.props.newModalDimensions, this.props.newModalRows) }>
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
  return bindActionCreators({ fetchEntities, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchIndex);
