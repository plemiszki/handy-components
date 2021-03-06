import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'
import Common from './modules/common.jsx'
import Details from './modules/details.jsx'
import ConfirmDelete from './confirm-delete.jsx'
import { fetchEntity, updateEntity, deleteEntity } from '../actions/index'

let entityNamePlural;

class SimpleDetails extends React.Component {
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
    let pathDirectories = window.location.pathname.split('/');
    this.props.fetchEntity({
      id: pathDirectories[pathDirectories.length - 1],
      directory: pathDirectories[pathDirectories.length - 2],
      entityName: this.props.entityName
    }).then(() => {
      let obj = {
        fetching: false,
        [this.props.entityName]: this.props[this.props.entityName],
        [`${this.props.entityName}Saved`]: HandyTools.deepCopy(this.props[this.props.entityName]),
        changesToSave: false
      };
      if (this.props.fetchData) {
        this.props.fetchData.forEach((arrayName) => {
          obj[arrayName] = this.props[arrayName];
        })
      }
      this.setState(obj, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  }

  changeFieldArgs() {
    return {
      allErrors: Errors,
      errorsArray: this.state.errors,
      changesFunction: this.checkForChanges.bind(this)
    }
  }

  checkForChanges() {
    return !HandyTools.objectsAreEqual(this.state[this.props.entityName], this.state[`${this.props.entityName}Saved`]);
  }

  clickSave() {
    this.setState({
      fetching: true,
      justSaved: true
    }, () => {
      let pathDirectories = window.location.pathname.split('/');
      let entity = this.state[this.props.entityName];
      entity = this.removeFinanceSymbols(entity);
      this.props.updateEntity({
        id: pathDirectories[pathDirectories.length - 1],
        directory: pathDirectories[pathDirectories.length - 2],
        entityName: this.props.entityName,
        entity,
        csrfToken: this.props.csrfToken
      }).then(() => {
        this.setState({
          fetching: false,
          [this.props.entityName]: this.props[this.props.entityName],
          [`${this.props.entityName}Saved`]: HandyTools.deepCopy(this.props[this.props.entityName]),
          changesToSave: false
        });
      }, () => {
        this.setState({
          fetching: false,
          errors: this.props.errors
        });
      });
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
      case 'textbox':
        return Details.renderTextBox.bind(this)(field);
      case 'dropdown':
        return Details.renderDropDown.bind(this)(field);
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

const mapStateToProps = (reducers, props) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleDetails);
