import React, { Component } from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'
import Common from './modules/common.jsx'
import Details from './modules/details.jsx'
import ConfirmDelete from './confirm-delete.jsx'

let entityNamePlural;

export default class SimpleDetails extends Component {
  constructor(props) {
    super(props);
    entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    let obj = {
      fetching: true,
      [this.props.entityName]: this.props.initialEntity,
      [`${this.props.entityName}Saved`]: this.props.initialEntity,
      errors: [],
      copyModalOpen: false
    }
    if (this.props.fetchData) {
      this.props.fetchData.forEach((arrayName) => {
        obj[arrayName] = [];
      })
    }
    this.state = obj;
  }

  componentDidMount() {
    const pathDirectories = window.location.pathname.split('/');
    const id = pathDirectories[pathDirectories.length - 1]
    const directory = pathDirectories[pathDirectories.length - 2]
    const { entityName, fetchData } = this.props;
    fetch(`/api/${directory}/${id}`)
      .then(data => data.json())
      .then((response) => {
        let newState = {
          fetching: false,
          [entityName]: response[entityName],
          [`${entityName}Saved`]: HandyTools.deepCopy(response[entityName]),
          changesToSave: false
        };
        if (fetchData) {
          fetchData.forEach((arrayName) => {
            newState[arrayName] = response[arrayName];
          })
        }
        this.setState(newState, () => {
          HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
        });
      })
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state[this.props.entityName], this.state[`${this.props.entityName}Saved`]);
  }

  clickSave() {
    const { entityName, csrfToken: useCsrfToken } = this.props;
    let csrfToken = null;
    if (useCsrfToken) {
      const selector = document.querySelector('meta[name="csrf-token"]')
      if (selector) { // doesn't exist in test environments
        csrfToken = selector.getAttribute('content')
      }
    }
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      const pathDirectories = window.location.pathname.split('/');
      const id = pathDirectories[pathDirectories.length - 1]
      const directory = pathDirectories[pathDirectories.length - 2]
      const entity = this.removeFinanceSymbols(this.state[entityName]);

      fetch(`/api/${directory}/${id}`, {
        method: 'PATCH',
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [HandyTools.convertToUnderscore(entityName)]: HandyTools.convertObjectKeysToUnderscore(entity),
        })
      })
        .then(async (unprocessedResponse) => {
          const response = await unprocessedResponse.json();
          if (!unprocessedResponse.ok) {
            return Promise.reject(response);
          }
          const entity = response[entityName];
          this.setState({
            fetching: false,
            [entityName]: entity,
            [`${entityName}Saved`]: HandyTools.deepCopy(entity),
            changesToSave: false,
          })
        }).catch((response) => {
          const { errors } = response;
          this.setState({
            fetching: false,
            errors,
          })
        })
    });
  }

  removeFinanceSymbols(entity) {
    this.props.fields.flat().forEach((field) => {
      if (field.removeFinanceSymbols) {
        entity[field.property] = HandyTools.removeFinanceSymbols(entity[field.property]);
      }
    });
    return entity;
  }

  clickCopy() {
    this.setState({
      copyModalOpen: true
    });
  }

  render() {
    const children = React.Children.map(
      this.props.children,
      (child) => {
        return React.cloneElement(child, {
          entityName: this.props.entityName,
          entityNamePlural,
          initialEntity: this.state[`${this.props.entityName}Saved`]
        });
      }
    );

    return(
      <div id="simple-details" className="component details-component">
        <h1>{ this.props.header || `${ChangeCase.titleCase(this.props.entityName)} Details` }</h1>
        <div className="white-box">
          {
            this.props.fields.map((row, index) => {
              return(
                <div key={ index } className="row">
                  { row.map((field, index2) => {
                    return(
                      <div key={ index2 }>
                        { this.renderField(field) }
                      </div>
                    );
                  })}
                </div>
              );
            })
          }
          <div>
            <a className={ "btn standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
              { Details.saveButtonText.call(this) }
            </a>
            { this.renderDeleteButton.call(this) }
            { this.renderCopyButton.call(this) }
          </div>
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { Common.renderSpinner(this.state.fetching) }
        </div>
        { this.renderCopyModal.call(this, children) }
        <Modal isOpen={ this.state.deleteModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.deleteModalStyles() }>
          <ConfirmDelete
            entityName={ this.props.entityName }
            confirmDelete={
              Details.clickDelete.bind(this,
                {
                  callback: ((this.props.customDeletePath || this.props.deleteCallback) ? this.deleteCallback.bind(this) : null),
                  csrfToken: this.props.csrfToken
                }
              )
            }
            closeModal={ Common.closeModals.bind(this) }
          />
        </Modal>
      </div>
    );
  }

  renderField(field) {
    field.entity = this.props.entityName;
    switch (field.type) {
      case 'dropdown':
        return Details.renderDropDown.bind(this)(field);
      case 'switch':
        return Details.renderSwitch.bind(this)(field);
      default:
        return Details.renderField.bind(this)(field);
    }
  }

  renderCopyButton() {
    if (this.props.copy) {
      return(
        <a className={ "btn float-button margin-right" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ this.clickCopy.bind(this) }>
          Copy
        </a>
      );
    }
  }

  deleteCallback() {
    const { deleteCallback, customDeletePath } = this.props;
    if (deleteCallback) {
      deleteCallback.call(this);
    } else {
      window.location.pathname = customDeletePath;
    }
  }

  renderDeleteButton() {
    if (!this.props.hideDeleteButton) {
      return(
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
          Delete
        </a>
      );
    }
  }

  renderCopyModal(children) {
    if (this.props.children) {
      return(
        <Modal isOpen={ this.state.copyModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.modalStyles(this.props.modalDimensions, this.props.modalRows) }>
          { children }
        </Modal>
      );
    }
  }
}
