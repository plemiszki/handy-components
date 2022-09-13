import React, { Component } from 'react'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import Common from './modules/common.jsx'
import Details from './modules/details.jsx'
import ConfirmDelete from './confirm-delete.jsx'

import { objectsAreEqual } from './utils/compare.js'
import { removeFinanceSymbols, removeFinanceSymbolsFromEntity } from './utils/convert.js'
import { deepCopy } from './utils/copy.js'
import { parseUrl } from './utils/extract'
import { setUpNiceSelect } from './utils/nice-select'
import { convertObjectKeysToUnderscore } from './utils/convert.js'

let entityNamePlural;

export default class SimpleDetails extends Component {
  constructor(props) {
    super(props);
    entityNamePlural = this.props.entityNamePlural || `${this.props.entityName}s`;
    let obj = {
      spinner: true,
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
    const { entityName, fetchData } = this.props;
    const [id, directory] = parseUrl();
    fetch(`/api/${directory}/${id}`)
      .then(data => data.json())
      .then((response) => {
        let newState = {
          spinner: false,
          [entityName]: response[entityName],
          [`${entityName}Saved`]: deepCopy(response[entityName]),
          changesToSave: false
        };
        if (fetchData) {
          fetchData.forEach((arrayName) => {
            newState[arrayName] = response[arrayName];
          })
        }
        this.setState(newState, () => {
          setUpNiceSelect({ selector: 'select', func: Details.changeDropdownField.bind(this) });
        });
      })
  }

  changeFieldArgs() {
    return {
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    return !objectsAreEqual(this.state[this.props.entityName], this.state[`${this.props.entityName}Saved`]);
  }

  clickSave() {
    const { entityName, csrfToken: useCsrfToken, fields } = this.props;
    let csrfToken = null;
    if (useCsrfToken) {
      const selector = document.querySelector('meta[name="csrf-token"]')
      if (selector) { // doesn't exist in test environments
        csrfToken = selector.getAttribute('content')
      }
    }
    this.setState({
      spinner: true,
      justSaved: true
    }, () => {
      const [id, directory] = parseUrl();
      const entity = removeFinanceSymbolsFromEntity(this.state[entityName], fields);
      fetch(`/api/${directory}/${id}`, {
        method: 'PATCH',
        headers: {
          'x-csrf-token': csrfToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [ChangeCase.snakeCase(entityName)]: convertObjectKeysToUnderscore(entity),
        })
      })
        .then(async (unprocessedResponse) => {
          const response = await unprocessedResponse.json();
          if (!unprocessedResponse.ok) {
            return Promise.reject(response);
          }
          const entity = response[entityName];
          this.setState({
            spinner: false,
            [entityName]: entity,
            [`${entityName}Saved`]: deepCopy(entity),
            changesToSave: false,
          })
        }).catch((response) => {
          const { errors } = response;
          this.setState({
            spinner: false,
            errors,
          })
        })
    });
  }

  removeFinanceSymbols(entity) {
    this.props.fields.flat().forEach((field) => {
      if (field.removeFinanceSymbols) {
        entity[field.property] = removeFinanceSymbols(entity[field.property]);
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
            <a className={ "btn standard-width" + Common.renderDisabledButtonClass(this.state.spinner || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
              { Details.saveButtonText.call(this) }
            </a>
            { this.renderDeleteButton.call(this) }
            { this.renderCopyButton.call(this) }
          </div>
          { Common.renderGrayedOut(this.state.spinner, -36, -32, 5) }
          { Common.renderSpinner(this.state.spinner) }
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
        <a className={ "btn float-button margin-right" + Common.renderDisabledButtonClass(this.state.spinner) } onClick={ this.clickCopy.bind(this) }>
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
        <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.spinner) } onClick={ Common.changeState.bind(this, 'deleteModalOpen', true) }>
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
