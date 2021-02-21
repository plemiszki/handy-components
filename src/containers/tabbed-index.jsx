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

let arrayName;
let directory;
let entityNamePlural;

class TabbedIndex extends React.Component {

  constructor(props) {
    super(props);

    entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    directory = ChangeCase.snakeCase(entityNamePlural);
    arrayName = ChangeCase.camelCase(entityNamePlural);

    let initialState = {
      fetching: true,
      searchProperty: this.props.columns[0],
      searchText: '',
      newEntityModalOpen: false,
      tab: this.props.tabs[0]
    };

    this.props.tabs.forEach((tab) => {
      initialState[`entities${HandyTools.capitalize(tab)}`] = [];
    })

    this.state = initialState;
  }

  componentDidMount() {
    this.props.fetchEntities({ directory }).then(() => {
      let entityArray = `entities${HandyTools.capitalize(this.state.tab)}`;
      this.setState({
        fetching: false,
        [entityArray]: this.props[arrayName]
      });
    });
  }

  updateIndex(entities) {
    this.setState({
      newEntityModalOpen: false,
      [`entities${HandyTools.capitalize(this.props.newEntityTab)}`]: entities
    });
  }

  clickTab(label) {
    if (this.state.tab !== label) {
      this.props.tabActions[`${HandyTools.capitalize(entityNamePlural)}${HandyTools.capitalize(label)}`].call(this)
    }
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

    let filteredEntities = Index.filterSearchText({ entities: this.state[`entities${HandyTools.capitalize(this.state.tab)}`], text: this.state.searchText, property: this.state.searchProperty });

    return(
      <div className="component">
        <h1>{ HandyTools.capitalize(entityNamePlural) }</h1>
        <a className={ "btn float-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Index.clickNew.bind(this) }>Add { HandyTools.capitalize(this.props.entityName) }</a>
        <input className="search-box margin" onChange={ Common.changeStateToTarget.bind(this, 'searchText') } value={ this.state.searchText } />
        { this.renderTopTabs() }
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          <table className="admin-table sortable">
            <thead>
              <tr>
                { this.props.columns.map((column, index) => {
                  return(
                    <th key={ index }>
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
              { _.orderBy(filteredEntities, [Index.sortIndex.bind(this)], [Index.sortDirection.call(this, filteredEntities[0])]).map((entity, index) => {
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

  renderTopTabs() {
    if (this.props.tabs && !this.state.fetching) {
      return(
        <div className="tabs-row">
          { this.props.tabs.map((label, index) => {
            return(
              <div key={ index } className={ "tab" + (this.state.tab === label ? " selected" : "") } onClick={ this.clickTab.bind(this, label) }>{ HandyTools.capitalize(label) }</div>
            );
          })}
        </div>
      );
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

export default connect(mapStateToProps, mapDispatchToProps)(TabbedIndex);
