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
    const storage = localStorage.getItem(`${this.state.entityNamePlural}SearchCriteria`);
    if (this.props.preserveSearchCriteria && storage) {
      const searchCriteria = JSON.parse(storage);
      this.setState({
        searchCriteria
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
    const { directory, page, orderByColumn, searchCriteria, arrayName } = this.state;
    const serverSearchCriteria = Object.assign({}, searchCriteria, this.props.staticSearchCriteria || {});
    this.props.fetchEntities({
      directory,
      batchSize: this.props.batchSize,
      page,
      orderBy: orderByColumn.dbName || ChangeCase.snakeCase(orderByColumn.name),
      orderDir: orderByColumn.sortDir || 'asc',
      searchCriteria: HandyTools.convertObjectKeysToUnderscore(serverSearchCriteria)
    }).then(() => {
      this.setState({
        fetching: false,
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

  changePage(pageNumber) {
    this.setState({
      fetching: true,
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
      this.setState({
        fetching: true,
        page: 1,
        [this.state.arrayName]: [],
        orderByColumn: column
      }, () => {
        this.fetchEntities();
      });
    }
  }

  clickExport() {
    const { orderByColumn, searchCriteria, directory } = this.state;
    this.setState({
      fetching: true
    });
    this.props.sendRequest({
      url: `/api/${directory}/export`,
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

  newEntityCallback() {
    this.updateSearchCriteria(this.state.searchCriteria);
  }

  updateSearchCriteria(searchCriteria) {
    this.setState({
      searchCriteria,
      searchModalOpen: false,
      newEntityModalOpen: false,
      fetching: true,
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
    let { fetching, columns, directory, orderByColumn, arrayName, entityNamePlural, searchCriteria } = this.state;
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
        <a className={ 'btn search-button' + Common.renderDisabledButtonClass(this.state.fetching) + (searchActive ? ' active' : '') } onClick={ Common.changeState.bind(this, 'searchModalOpen', !this.state.searchModalOpen) }></a>
        <div className="white-box">
          <div className="top-section">
            { Common.renderGrayedOut(fetching, -36, -32, 5) }
            { Common.renderSpinner(fetching) }
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
                      <tr key={ index }>
                        { columns.map((column, index) => {
                          return(
                            <td key={ index } className={ column.classes || '' }>
                              <a href={ `/${directory}/${entity.id}${column.links || ''}` }>
                                { entity[column.name] }
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
        <>
          <a className={ "new-button btn" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Index.clickNew.bind(this) }>{ this.props.newButtonText || `Add ${ChangeCase.titleCase(this.props.entityName)}` }</a>
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

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntities, sendRequest }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchIndex);
