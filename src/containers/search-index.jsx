import React, { Component } from 'react'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import Common from './modules/common.jsx'
import Index from './modules/index.js'

export default class SearchIndex extends Component {

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
      orderBy: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
      orderDir: orderByDir,
      searchCriteria: serverSearchCriteria,
    }
    fetch(`/api/${directory}?${$.param(HandyTools.convertObjectKeysToUnderscore(queryParams))}`)
      .then(data => data.json())
      .then((response) => {
        this.setState({
          spinner: false,
          [arrayName]: response[arrayName],
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
      order_by: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
      order_dir: orderByColumn.sortDir || 'asc',
      search_criteria: HandyTools.convertObjectKeysToUnderscore(searchCriteria),
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
    let { spinner, columns, directory, orderByColumn, arrayName, entityNamePlural, searchCriteria } = this.state;
    const searchActive = Object.keys(searchCriteria).length > 0;
    const searchCriteriaComponent = React.Children.map(
      this.props.children,
      (child) => {
        if (child.props.fields) {
          return React.cloneElement(child, {
            callback: this.updateSearchCriteria.bind(this),
            criteria: this.state.searchCriteria,
            rows: this.props.searchModalRows,
            entityNamePlural
          });
        }
      }
    );
    const newEntityComponent = React.Children.map(
      this.props.children,
      (child) => {
        if (child.props.initialEntity) {
          return React.cloneElement(child, {
            entityName: this.props.entityName,
            entityNamePlural,
            callback: this.newEntityCallback.bind(this)
          });
        }
      }
    );

    return(
      <div className="search-index component">
        <h1>{ this.props.header || ChangeCase.titleCase(entityNamePlural) }</h1>
        { this.renderNewButton() }
        { this.renderExportButton() }
        <a className={ 'btn search-button' + Common.renderDisabledButtonClass(this.state.spinner) + (searchActive ? ' active' : '') } onClick={ Common.changeState.bind(this, 'searchModalOpen', !this.state.searchModalOpen) }></a>
        <div className="white-box">
          <div className="top-section">
            { Common.renderGrayedOut(spinner, -36, -32, 5) }
            { Common.renderSpinner(spinner) }
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
                  { this.state[arrayName].map((entity, index) => {
                    return(
                      <tr key={ index } className={ !this.props.useLinks ? 'no-links' : '' }>
                        { columns.map((column, index) => {
                          const value = entity[column.name];
                          const displayedValue = column.convertToLocalTime ? HandyTools.stringifyFullDate(new Date(value * 1000)) : value;
                          if (this.props.useLinks === false) {
                            return(
                              <td key={ index } className={ column.classes || '' }>
                                <a>
                                  { displayedValue }
                                </a>
                              </td>
                            );
                          } else {
                            return(
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
            table {
              table-layout: fixed;
            }
            td {
              overflow: hidden;
              white-space: nowrap;
            }
            td a {
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
              padding-right: 20px;
            }
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

  renderNewButton() {
    if (this.props.showNewButton) {
      return(
        <>
          <a className={ "new-button btn" + Common.renderDisabledButtonClass(this.state.spinner) } onClick={ Index.clickNew.bind(this) }>{ this.props.newButtonText || `Add ${ChangeCase.titleCase(this.props.entityName)}` }</a>
          <style jsx>{`
            .new-button {
              float: right;
              margin-left: 30px;
            }
          `}</style>
        </>
      );
    }
  }

  renderExportButton() {
    if (this.props.showExportButton) {
      return(
        <>
          <a className={ "export-button btn" + Common.renderDisabledButtonClass(this.state.spinner) } onClick={ this.clickExport.bind(this) }>Export</a>
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
        width: +column.width
      };
    }
  }
}
