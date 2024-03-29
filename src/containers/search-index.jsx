import React, { Component } from 'react'
import Modal from 'react-modal'
import { snakeCase, camelCase } from 'change-case'
import Common from './modules/common.jsx'
import Index from './modules/index.js'
import Spinner from './spinner'
import GrayedOut from './grayed-out'
import Button from './button'
import { titleCase } from './utils/convert'

import { convertObjectKeysToUnderscore, stringifyFullDate } from './utils/convert'

export default class SearchIndex extends Component {

  constructor(props) {
    super(props);

    const entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    const directory = snakeCase(entityNamePlural);
    const arrayName = camelCase(entityNamePlural);

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
      orderByColumn: columns[0],
      orderByDir: columns[0].sortDir || 'asc',
      newEntityModalOpen: false,
      searchModalOpen: false,
      columns,
      page: 1,
      pages: [],
      searchCriteria: {}
    }

    this.state = initialState;
  }

  componentDidMount() {
    const { preserveSearchCriteria, defaultSearchCriteria } = this.props;
    const storage = localStorage.getItem(`${this.state.entityNamePlural}SearchCriteria`);
    if (preserveSearchCriteria && storage) {
      const searchCriteria = JSON.parse(storage);
      this.setState({
        searchCriteria
      }, () => {
        this.fetchEntities();
      });
    } else if (defaultSearchCriteria) {
      this.setState({
        searchCriteria: defaultSearchCriteria,
      }, () => {
        this.fetchEntities();
      });
    } else {
      this.fetchEntities();
    }
  }

  componentDidUpdate() {
    Common.updateJobModal.call(this);
  }

  fetchEntities() {
    const { batchSize, staticSearchCriteria } = this.props;
    const { directory, page, orderByColumn, orderByDir, searchCriteria, arrayName } = this.state;
    const serverSearchCriteria = Object.assign({}, searchCriteria, staticSearchCriteria || {});
    const queryParams = {
      batchSize,
      page,
      orderBy: orderByColumn.dbName || snakeCase(orderByColumn.name),
      orderDir: orderByDir,
      searchCriteria: serverSearchCriteria,
    }
    fetch(`/api/${directory}?${$.param(convertObjectKeysToUnderscore(queryParams))}`)
      .then(data => data.json())
      .then((response) => {
        const { morePages, pageNumbers } = response;
        this.setState({
          spinner: false,
          [arrayName]: response[arrayName],
          morePages,
          pageNumbers,
        });
      })
  }

  updateIndex(entities) {
    this.setState({
      newEntityModalOpen: false,
      [this.state.arrayName]: entities
    });
  }

  changePage(pageNumber) {
    this.setState({
      spinner: true,
      page: pageNumber
    }, () => {
      this.fetchEntities();
    });
  }

  columnHeaderClass(column) {
    if (column.orderByDisabled) {
      return '';
    } else if (this.state.orderByColumn === column) {
      return 'sort-header-active';
    } else {
      return 'sort-header-inactive';
    }
  }

  clickHeader(column) {
    if (!column.orderByDisabled) {
      let orderByDir;
      if (this.state.orderByColumn.name === column.name) {
        orderByDir = (this.state.orderByDir === 'asc' ? 'desc' : 'asc');
      } else {
        orderByDir = column.sortDir || 'asc';
      }
      this.setState({
        spinner: true,
        page: 1,
        [this.state.arrayName]: [],
        orderByColumn: column,
        orderByDir
      }, () => {
        this.fetchEntities();
      });
    }
  }

  clickExport() {
    const { orderByColumn, searchCriteria, directory } = this.state;
    this.setState({
      spinner: true
    });
    const queryParams = {
      order_by: orderByColumn.dbName || snakeCase(orderByColumn.name),
      order_dir: orderByColumn.sortDir || 'asc',
      search_criteria: convertObjectKeysToUnderscore(searchCriteria),
    }
    fetch(`/api/${directory}/export?${$.param(queryParams)}`)
      .then(data => data.json())
      .then((response) => {
        this.setState({
          job: response['job'],
          spinner: false,
          jobModalOpen: true,
        });
      })
  }

  newEntityCallback() {
    this.updateSearchCriteria(this.state.searchCriteria);
  }

  updateSearchCriteria(searchCriteria) {
    this.setState({
      searchCriteria,
      searchModalOpen: false,
      newEntityModalOpen: false,
      spinner: true,
      page: 1,
      [this.state.arrayName]: []
    }, () => {
      this.fetchEntities();
    });
    if (this.props.preserveSearchCriteria) {
      localStorage.setItem(`${this.state.entityNamePlural}SearchCriteria`, JSON.stringify(searchCriteria));
    }
  }

  render() {
    const { showNewButton, showExportButton, newButtonText, entityName, header, searchModalRows } = this.props;
    let { spinner, columns, directory, arrayName, entityNamePlural, searchCriteria } = this.state;
    const searchActive = Object.keys(searchCriteria).length > 0;
    const searchCriteriaComponent = React.Children.map(
      this.props.children,
      (child) => {
        if (child && child.props.fields) {
          return React.cloneElement(child, {
            callback: this.updateSearchCriteria.bind(this),
            criteria: searchCriteria,
            rows: searchModalRows,
            entityNamePlural
          });
        }
      }
    );
    const newEntityComponent = React.Children.map(
      this.props.children,
      (child) => {
        if (child && child.props.initialEntity) {
          return React.cloneElement(child, {
            entityName,
            entityNamePlural,
            callback: this.newEntityCallback.bind(this)
          });
        }
      }
    );

    return (
      <div className="search-index handy-component">
        <h1>{ header || titleCase(entityNamePlural) }</h1>
        { showNewButton && (
          <Button
            float
            marginLeft
            disabled={ spinner }
            text={ newButtonText || `Add ${titleCase(entityName)}` }
            onClick={ Index.clickNew.bind(this) }
          />
        ) }
        { showExportButton && (
          <Button
            float
            marginLeft
            disabled={ spinner }
            onClick={ this.clickExport.bind(this) }
            text="Export"
          />
        ) }
        <a className={ 'btn search-button' + Common.renderDisabledButtonClass(this.state.spinner) + (searchActive ? ' active' : '') } onClick={ Common.changeState.bind(this, 'searchModalOpen', !this.state.searchModalOpen) }></a>
        <div className="white-box">
          <div className="top-section">
            <GrayedOut visible={ spinner } />
            <Spinner visible={ spinner } />
            <div className="horizontal-scroll">
              <table className="admin-table sortable">
                <thead>
                  <tr>
                    { columns.map((column, index) => {
                      return (
                        <th key={ index } style={ this.columnWidth(column) }>
                          <div className={ this.columnHeaderClass.call(this, column) } onClick={ () => { this.clickHeader(column) } }>
                            { column.header || titleCase(column.name) }
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    { columns.map((_, index) => {
                      return (
                        <td key={ index }></td>
                      );
                    })}
                  </tr>
                  { this.state[arrayName].map((entity, index) => {
                    return (
                      <tr key={ index } className={ !this.props.useLinks ? 'no-links' : '' }>
                        { columns.map((column, index) => {
                          const value = entity[column.name];
                          const displayedValue = column.convertToLocalTime ? stringifyFullDate(new Date(value * 1000)) : value;
                          if (this.props.useLinks === false) {
                            return (
                              <td key={ index } className={ column.classes || '' }>
                                <a>
                                  { displayedValue }
                                </a>
                              </td>
                            );
                          } else {
                            return (
                              <td key={ index } className={ column.classes || '' }>
                                <a href={ `/${directory}/${entity.id}${column.links || ''}` } target={ this.props.openNewTabs ? '_blank' : '_self' }>
                                  { displayedValue }
                                </a>
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
          <hr />
          { this.renderPageLinks() }
        </div>
        { this.renderNewModal.call(this, newEntityComponent) }
        { this.renderSearchModal.call(this, searchCriteriaComponent) }
        { Common.renderJobModal.call(this, this.state.job) }
        <style jsx>{`
            .horizontal-scroll {
              overflow-x: scroll;
            }
            table {
              table-layout: fixed;
              width: 100%;
              user-select: none;
              font-size: 12px;
              line-height: 17px;
            }
            table:not(.no-hover) tr:not(:first-child):not(.no-hover):hover {
              background-color: #F5F5F5;
            }
            thead {
              border-bottom: solid 1px #dadee2;
            }
            th {
              font-family: 'TeachableSans-SemiBold';
              color: black;
              padding-bottom: 20px;
            }
            th:first-of-type {
              padding-left: 10px;
            }
            th div {
              display: inline;
            }
            th div.sort-header-active {
              cursor: pointer;
              color: var(--highlight-color, #000);
              font-family: 'TeachableSans-ExtraBold';
            }
            th div.sort-header-inactive {
              cursor: pointer;
            }
            tr:first-child td {
              padding-top: 10px;
            }
            tr.bold td {
              font-family: 'TeachableSans-Medium';
              color: black;
            }
            td {
              overflow: hidden;
              white-space: nowrap;
              position: relative;
              color: #96939B;
            }
            td:first-of-type {
              padding-left: 10px;
            }
            td.bold {
              font-family: 'TeachableSans-Medium';
              color: black;
            }
            td a {
              display: block;
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              padding: 10px 20px 10px 0;
            }
            .search-button {
              float: right;
              width: 47px;
              height: 47px;
              padding: 0;
              background-color: white;
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
              background-color: var(--button-color);
            }
            .search-button.active:hover {
              background-color: var(--highlight-color);
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

  renderSearchModal(searchCriteriaComponent) {
    return(
      <Modal isOpen={ this.state.searchModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.searchModalStyles(this.props.searchModalDimensions, this.props.searchModalRows) }>
        { searchCriteriaComponent }
      </Modal>
    );
  }

  renderNewModal(newEntityComponent) {
    if (this.props.showNewButton) {
      return(
        <Modal isOpen={ this.state.newEntityModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.newEntityModalStyles(this.props.newModalDimensions, this.props.newModalRows) }>
          { newEntityComponent }
        </Modal>
      );
    }
  }

  renderPageLinks() {
    const { pageNumbers, morePages } = this.state;
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
        width: +column.width
      };
    }
  }
}
