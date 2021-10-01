import $ from 'jquery'
import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'
import ModalSelect from '../modal-select.jsx'
import Common from './common.jsx'

let Details = {

  changeField(changeFieldArgs, event) {
    let key = event.target.dataset.field;
    let entity = event.target.dataset.entity;
    let saveKey;
    let saveValue;

    let value;
    if ($(event.target).is('select')) {
      value = HandyTools.convertTFStringsToBoolean(event.target.value);
    } else if (event.target.type === 'checkbox') {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }

    if (entity) {
      let newEntity = this.state[entity];
      if (changeFieldArgs.beforeSave) {
        changeFieldArgs.beforeSave.call(this, newEntity, key, value); // <-- will mutate newEntity if needed
      }
      newEntity[key] = value;
      saveKey = entity;
      saveValue = newEntity;
    } else {
      saveKey = key;
      saveValue = value;
    }

    Details.removeFieldError(changeFieldArgs.allErrors, changeFieldArgs.errorsArray, key);

    this.setState({
      [saveKey]: saveValue,
      justSaved: false
    }, () => {
      if (changeFieldArgs.changesFunction) {
        var changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({
          changesToSave: changesToSave
        });
      }
    });
  },

  clickDelete(args) {
    this.setState({
      deleteModalOpen: false,
      fetching: true
    });
    let urlSections = window.location.pathname.split('/');
    this.props.deleteEntity({
      directory: urlSections[urlSections.length - 2],
      id: urlSections[urlSections.length - 1],
      callback: args.callback,
      csrfToken: args.csrfToken
    });
  },

  errorClass(stateErrors, fieldErrors) {
    var i;
    for (i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return 'error';
      }
    }
    return '';
  },

  hasError(stateErrors, fieldErrors) {
    for (let i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return true;
      }
    }
    return false;
  },

  getColumnHeader(args) {
    return args.columnHeader || ChangeCase.titleCase(args.property);
  },

  removeFieldError(errors, errorsArray, fieldName) {
    if (errors[fieldName]) {
      errors[fieldName].forEach((message) => {
        HandyTools.removeFromArray(errorsArray, message);
      });
    }
  },

  renderDropDown(args) {
    const ALL_ERRORS = Details.getAllErrors.call(this);

    function renderNoneOption(args) {
      if (args.optional) {
        return(
          <option key={ -1 } value="">(None)</option>
        );
      }
    }

    function renderOptions(args, options) {
      if (args.boolean) {
        return([
          <option key={ 0 } value="t">Yes</option>,
          <option key={ 1 } value="f">No</option>
        ]);
      } else {
        { return HandyTools.alphabetizeArrayOfObjects(options, args.optionDisplayProperty).map((option, index) => {
          return(
            <option key={ index } value={ args.optionValueProperty || option.id }>
              { option[args.optionDisplayProperty] }
            </option>
          );
        })}
      }
    }

    let columnHeader = Details.getColumnHeader(args);
    const hasError = Details.errorClass(this.state.errors, ALL_ERRORS[args.property] || []);
    const options = args.options || this.state[args.optionsArrayName];
    return(
      <>
        <div className={ `col-xs-${args.columnWidth} ${hasError ? 'has-error' : ''} ${(args.maxOptions ? `select-scroll-${args.maxOptions}` : 'select-scroll-6') }` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <select onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ args.boolean ? (HandyTools.convertBooleanToTFString(this.state[args.entity][args.property]) || "") : this.state[args.entity][args.property] } data-entity={ args.entity } data-field={ args.property }>
            { renderNoneOption(args) }
            { renderOptions(args, options) }
          </select>
          { Details.renderDropdownFieldError(this.state.errors, ALL_ERRORS[args.property] || []) }
        </div>
        <style jsx>{`
          .has-error .nice-select {
            border-color: red;
            transition: none;
          }
        `}</style>
      </>
    );
  },

  renderDropdownFieldError(stateErrors, fieldErrors) {
    for (var i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return(
          React.createElement("div", { className: "yes-dropdown-field-error" }, fieldErrors[i])
        );
      }
    }
    return(
      React.createElement("div", { className: "no-dropdown-field-error" })
    );
  },

  renderCheckbox(args) {
    const ALL_ERRORS = Details.getAllErrors.call(this);
    let columnHeader = Details.getColumnHeader(args);
    if (args.hidden) {
      return <div className={ `col-xs-${args.columnWidth}` }></div>;
    } else {
      return(
        <div className={ `col-xs-${args.columnWidth}` }>
          <input id={ `${args.entity}-${args.property}` } className="checkbox" type="checkbox" onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } checked={ this.state[args.entity][args.property] || false } data-entity={ args.entity } data-field={ args.property } /><label className="checkbox" htmlFor={ `${args.entity}-${args.property}` }>{ columnHeader }</label>
          { Details.renderFieldError(this.state.errors, ALL_ERRORS[args.property] || []) }
        </div>
      );
    }
  },

  renderSwitch(args) {
    let columnHeader = Details.getColumnHeader(args);
    if (args.hidden) {
      return <div className={ `col-xs-${args.columnWidth}` }></div>;
    } else {
      return(
        <div className={ `col-xs-${args.columnWidth}` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          { Common.renderSwitchComponent({
            onChange: Details.changeField.bind(this, this.changeFieldArgs()),
            checked: this.state[args.entity][args.property] || false,
            entity: args.entity,
            property: args.property
          }) }
        </div>
      );
    }
  },

  renderField(args) {
    const ALL_ERRORS = Details.getAllErrors.call(this);
    let columnHeader = Details.getColumnHeader(args);
    if (args.hidden) {
      return <div className={ `col-xs-${args.columnWidth}` }></div>;
    } else if (args.type === 'modal') {
      const idEntity = args.property.slice(0, -2);
      const optionsArrayName = args.optionsArrayName || `${idEntity}s`;
      let selectedId = this.state[args.entity][`${idEntity}Id`];
      let value = '';
      if (this.state[optionsArrayName] && selectedId) {
        value = HandyTools.pluckFromObjectsArray({
          array: this.state[optionsArrayName],
          property: 'id',
          value: +selectedId
        })[args.optionDisplayProperty];
      }
      return([
        <div key={ 1 } className={ `col-xs-${args.columnWidth - 1}` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <input className={ Details.errorClass(this.state.errors, ALL_ERRORS[(args.errorsProperty || args.property)] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ value } placeholder={ args.placeholder } data-field={ args.property } readOnly={ true } />
          { Details.renderFieldError(this.state.errors, ALL_ERRORS[(args.errorsProperty || args.property)] || []) }
        </div>,
        <div key={ 2 } className="col-xs-1 select-from-modal" onClick={ Common.changeState.bind(this, `${idEntity}sModalOpen`, true) }>
        </div>,
        <Modal key={ 3 } isOpen={ this.state[`${idEntity}sModalOpen`] } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
          <ModalSelect options={ HandyTools.alphabetizeArrayOfObjects(this.state[optionsArrayName], args.optionDisplayProperty) } property={ args.optionDisplayProperty } func={ (option) => { Details.selectModalOption.call(this, option, idEntity, args.entity) } } noneOption={ args.noneOption } />
        </Modal>
      ]);
    } else {
      return(
        <div className={ `col-xs-${args.columnWidth}` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <input className={ Details.errorClass(this.state.errors, ALL_ERRORS[(args.errorsProperty || args.property)] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[args.entity][args.property] || "" } data-entity={ args.entity } data-field={ args.property } placeholder={ args.placeholder } readOnly={ args.readOnly } />
          { Details.renderUploadLink(args.uploadLinkFunction) }
          { Details.renderFieldError(this.state.errors, ALL_ERRORS[(args.errorsProperty || args.property)] || []) }
        </div>
      );
    }
  },

  renderFieldError(stateErrors, fieldErrors) {
    for (var i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return(
          React.createElement("div", { className: "yes-field-error" }, fieldErrors[i])
        );
      }
    }
    return(
      React.createElement("div", { className: "no-field-error" })
    );
  },

  renderSubheader(args) {
    if (args.subheader) {
      return(
        <p className="subheader">{ args.subheader }</p>
      );
    }
  },

  renderTextBox(args) {
    const ALL_ERRORS = Details.getAllErrors.call(this);
    let columnHeader = Details.getColumnHeader(args);
    return(
      <div className={ `col-xs-${args.columnWidth}` }>
        <h2>{ columnHeader }</h2>
        { Details.renderSubheader(args) }
        <textarea rows={ args.rows } className={ Details.errorClass(this.state.errors, ALL_ERRORS[args.property] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[args.entity][args.property] || "" } data-entity={ args.entity } data-field={ args.property }></textarea>
        { Details.renderFieldError(this.state.errors, ALL_ERRORS[args.property] || []) }
      </div>
    );
  },

  renderUploadLink(func) {
    if (func) {
      return(
        <a className="upload" onClick={ func }>Upload Image</a>
      );
    }
  },

  saveButtonText() {
    return this.state.changesToSave ? 'Save' : (this.state.justSaved ? 'Saved' : 'No Changes');
  },

  selectModalOption(option, idEntity, entityName) {
    const changeFieldArgs = this.changeFieldArgs();
    let entity = this.state[entityName];
    entity[`${idEntity}Id`] = option.id;
    Details.removeFieldError(changeFieldArgs.allErrors, changeFieldArgs.errorsArray, `${idEntity}Id`);
    let obj = {
      [entityName]: entity,
      [`${idEntity}sModalOpen`]: false
    };
    if (this.changeFieldArgs().changesFunction) {
      obj.changesToSave = changeFieldArgs.changesFunction();
    }
    this.setState(obj);
  },

  updateEntity() {
    let entityName = this.props.entityName;
    this.props.updateEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: entityName,
      entity: this.state[entityName]
    }).then(() => {
      let savedEntity = this.props[entityName];
      this.setState({
        fetching: false,
        [entityName]: savedEntity,
        [`${entityName}Saved`]: HandyTools.deepCopy(savedEntity),
        changesToSave: false
      });
    }, () => {
      this.setState({
        fetching: false,
        errors: this.props.errors
      });
    });
  },

  getAllErrors() {
    return typeof Errors == 'undefined' ? this.changeFieldArgs().allErrors : Errors;
  },

  removeFinanceSymbolsFromEntity(args) {
    let result = HandyTools.deepCopy(args.entity);
    args.fields.forEach((field) => {
      result[field] = HandyTools.removeFinanceSymbols(args.entity[field]);
    });
    return result;
  }
}

export default Details;
