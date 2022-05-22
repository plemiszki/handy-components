import $ from 'jquery'
import React from 'react'
import Modal from 'react-modal'
import HandyTools from 'handy-tools'
import ChangeCase from 'change-case'
import ModalSelect from '../modal-select.jsx'
import Common from './common.jsx'

let Details = {

  getErrors(args) {
    const { errorsKey } = args;
    const { errors: stateErrors } = this.state;
    const { defaultErrorsKey } = this.changeFieldArgs();
    if (errorsKey && Array.isArray(errorsKey)) {
      let obj = stateErrors;
      errorsKey.forEach((key) => {
        obj = obj[key] || {};
      });
      return obj;
    }
    if (errorsKey) {
      return stateErrors[errorsKey] || {};
    }
    if (defaultErrorsKey) {
      return stateErrors[defaultErrorsKey] || {};
    }
    return stateErrors;
  },

  changeDropdownField(event) {
    // due to limitations with Nice Select, arguments to changeField must be pulled from the DOM
    // TODO: what about other arguments (entities, entitiesIndex, errorsProperty)?
    const dataset = event.target.dataset;
    const { entity, field: property } = dataset;
    Details.changeField.call(this, { entity, property }, event);
  },

  changeField(args, event) {
    // set up
    const {
      entities,
      entitiesIndex,
      entity,
      errorsProperty,
      property,
    } = args;
    const changeFieldArgs = this.changeFieldArgs();
    const errors = Details.getErrors.call(this, args);
    const input = event.target;

    // remove field error
    Details.removeFieldError(errors, errorsProperty || property);

    // what is the new value of the property?
    let newValue;
    if ($(input).is('select')) {
      newValue = HandyTools.convertTFStringsToBoolean(input.value);
    } else if (input.type === 'checkbox') {
      newValue = input.checked;
    } else {
      newValue = input.value;
    }

    // what is the object to update?
    let obj;
    if (entity) {
      obj = this.state[entity];
    } else if (entities) {
      obj = this.state[entities][entitiesIndex];
    }

    // update the object
    obj[property] = newValue;

    // update any other relevant properties
    if (changeFieldArgs.beforeSave) {
      changeFieldArgs.beforeSave.call(this, obj, property, newValue); // <-- will mutate obj if needed
    }

    // create a new state object
    let newStateObj = {
      justSaved: false,
    };
    if (entity) {
      newStateObj[entity] = obj;
    } else if (entities) {
      let entitiesArray = this.state[entities];
      entitiesArray[entitiesIndex] = obj;
      newStateObj[entities] = entitiesArray;
    }

    // update component state
    this.setState(newStateObj, () => {
      if (changeFieldArgs.changesFunction) {
        const changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({
          changesToSave
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
      redirectToIndex: args.callback ? null : true,
      callback: args.callback,
      csrfToken: args.csrfToken,
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

  getValue(args) {
    const { value, entity, entities, entitiesIndex, property } = args;
    if (value) {
      return value || '';
    }
    if (entity) {
      return this.state[entity][property] || '';
    }
    if (entities) {
      return this.state[entities][entitiesIndex][property] || '';
    }
  },

  removeFieldError(errors, key) {
    delete errors[key];
  },

  removeFieldErrors(errors, keys) {
    keys.forEach((key) => {
      this.removeFieldError(errors, key);
    });
  },

  renderDropDown(args) {

    function renderNoneOption(args) {
      if (args.optional) {
        return(
          <option key={ -1 } value={ args.noneValue || "" }>(None)</option>
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
        { return HandyTools.alphabetizeArrayOfObjects(options, args.optionSortProperty || args.optionDisplayProperty || 'text').map((option, index) => {
          return(
            <option key={ index } value={ args.optionValueProperty || option.value || option.id }>
              { option[args.optionDisplayProperty || 'text'] }
            </option>
          );
        })}
      }
    }

    const columnHeader = Details.getColumnHeader(args);
    const { errors } = this.state;
    const { property, errorsProperty } = args;
    const hasError = Details.fieldHasError(errors, errorsProperty || property);
    const errorText = Details.errorText(errors, errorsProperty || property);
    let value = args.boolean ? (HandyTools.convertBooleanToTFString(this.state[args.entity][args.property]) || "") : this.state[args.entity][args.property] || '';

    if (!args.boolean) {
      if (!args.options && !args.optionsArrayName) {
        throw `render dropdown - missing 'options' or 'optionsArrayName' argument (rendering ${args.property} field)`;
      }
      if (!args.options && this.state[args.optionsArrayName] === undefined) {
        throw `render dropdown - this.state.${optionsArrayName} does not exist (rendering ${args.property} field)`;
      }
    }

    const options = args.options || this.state[args.optionsArrayName];

    if (args.readOnly) {
      if (value !== '') {
        const option = options.find(option => (args.optionValueProperty ? option[args.optionValueProperty] : (option['value'] || option['id']) ) == value);
        value = option[args.optionDisplayProperty];
      }
      return Details.renderField.call(this, Object.assign(args, { value }));
    }

    return(
      <>
        <div className={ `col-xs-${args.columnWidth} ${hasError ? 'has-error' : ''} ${(args.maxOptions ? `select-scroll-${args.maxOptions}` : 'select-scroll-6') }` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <select onChange={ Details.changeDropdownField.bind(this, args) } value={ value } data-entity={ args.entity } data-field={ args.property }>
            { renderNoneOption(args) }
            { renderOptions(args, options) }
          </select>
          { Details.renderDropdownFieldError(errorText) }
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

  renderDropdownFieldError(errorText) {
    if (errorText) {
      return React.createElement("div", { className: "yes-dropdown-field-error" }, errorText);
    } else {
      return React.createElement("div", { className: "no-dropdown-field-error" });
    }
  },

  renderCheckbox(args) {
    const columnHeader = Details.getColumnHeader(args);
    const { errors } = this.state;
    const { property, errorsProperty } = args;
    const hasError = Details.fieldHasError(errors, errorsProperty || property);
    const errorText = Details.errorText(errors, errorsProperty || property);

    if (args.hidden) {
      return <div className={ `col-xs-${args.columnWidth}` }></div>;
    } else {
      return(
        <div className={ `col-xs-${args.columnWidth}` }>
          <input
            id={ `${args.entity}-${args.property}` }
            className="checkbox"
            type="checkbox"
            onChange={ Details.changeField.bind(this, args) }
            checked={ this.state[args.entity][args.property] || false }
            data-entity={ args.entity }
            data-field={ args.property }
          />
          <label className="checkbox" htmlFor={ `${args.entity}-${args.property}` }>{ columnHeader }</label>
          { Details.renderFieldError(errorText) }
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
            onChange: Details.changeField.bind(this, args),
            checked: this.state[args.entity][args.property] || false,
            entity: args.entity,
            property: args.property
          }) }
        </div>
      );
    }
  },

  renderField(args) {
    const {
      columnOffset,
      columnWidth,
      entities,
      entitiesIndex,
      entity,
      errorsProperty,
      hidden,
      leftLabel,
      noneOption,
      optionDisplayProperty,
      optionsArrayName,
      placeholder,
      property,
      readOnly,
      rows,
      showErrorText,
      showFieldError,
      type,
      uploadLinkFunction,
    } = args;

    const containerClass = columnOffset ? `col-xs-${columnWidth} col-xs-offset-${columnOffset}` : `col-xs-${columnWidth}`;

    if (hidden) {
      return <div className={ containerClass }></div>;
    }

    const changeFieldArgs = this.changeFieldArgs();
    const errors = Details.getErrors.call(this, args);
    const hasError = Details.fieldHasError(errors, errorsProperty || property);
    const errorText = Details.errorText(errors, errorsProperty || property);
    let value;

    switch (type) {
      case 'modal':
        if (optionDisplayProperty == null) {
          throw `missing optionDisplayProperty (rendering ${property} field)`;
        }
        const idEntity = property.slice(0, -2);
        const calculatedOptionsArrayName = optionsArrayName || `${idEntity}s`;
        if (this.state[calculatedOptionsArrayName] === undefined) {
          throw `this.state.${calculatedOptionsArrayName} does not exist (rendering ${property} field)`;
        }
        let selectedId = this.state[entity][`${idEntity}Id`];
        value = '';
        if (this.state[calculatedOptionsArrayName] && selectedId) {
          value = HandyTools.pluckFromObjectsArray({
            array: this.state[calculatedOptionsArrayName],
            property: 'id',
            value: +selectedId
          })[optionDisplayProperty];
        }
        return([
          <div key={ 1 } className={ `col-xs-${columnWidth - 1}` }>
            { Details.renderHeader(args) }
            <input
              className={ Details.inputClassName(hasError) }
              onChange={ Details.changeField.bind(this, args) }
              value={ value }
              placeholder={ placeholder }
              data-field={ property }
              readOnly={ true }
            />
            { Details.renderLink(args) }
            { Details.renderWarning(args) }
            { showErrorText === false ? null : (showFieldError === false ? Details.renderFieldError('') : Details.renderFieldError(errorText)) }
          </div>,
          <div key={ 2 } className="col-xs-1 select-from-modal" onClick={ Common.changeState.bind(this, `${idEntity}sModalOpen`, true) }>
          </div>,
          <Modal
            key={ 3 }
            isOpen={ this.state[`${idEntity}sModalOpen`] }
            onRequestClose={ Common.closeModals.bind(this) }
            contentLabel="Modal"
            style={ Common.selectModalStyles() }
          >
            <ModalSelect
              options={ HandyTools.alphabetizeArrayOfObjects(this.state[calculatedOptionsArrayName], optionDisplayProperty) }
              property={ optionDisplayProperty }
              func={ (option) => { Details.selectModalOption.call(this, option, idEntity, entity) } }
              noneOption={ noneOption }
            />
          </Modal>
        ]);
      case 'json':
        value = Details.getValue.call(this, args);
        return(
          <div className={ containerClass }>
            { Details.renderHeader(args) }
            <>
              <textarea
                rows={ rows }
                className={ Details.inputClassName(hasError) }
                onChange={ Details.changeField.bind(this, args) }
                value={ value }
                data-entity={ entity }
                data-field={ property }
                data-json={ true }
              />
              <style jsx>{`
                textarea {
                  font-family: monospace;
                  font-size: 14px;
                }
              `}</style>
            </>
            { Details.renderLink(args) }
            { Details.renderWarning(args) }
            { showErrorText === false ? null : (showFieldError === false ? Details.renderFieldError('') : Details.renderFieldError(errorText)) }
          </div>
        );
      default:
        value = Details.getValue.call(this, args);
        return(
          <div className={ containerClass }>
            { Details.renderHeader(args) }
            { Details.renderLeftLabel(args) }
            <input
              className={ Details.inputClassName(hasError) }
              onChange={ Details.changeField.bind(this, args) }
              value={ value }
              data-entity={ entity }
              data-field={ property }
              placeholder={ placeholder }
              readOnly={ readOnly }
              data-test-index={ entitiesIndex }
            />
            { Details.renderUploadLink(uploadLinkFunction) }
            { Details.renderLink(args) }
            { Details.renderWarning(args) }
            { showErrorText === false ? null : (showFieldError === false ? Details.renderFieldError('') : Details.renderFieldError(errorText)) }
          </div>
        );
    }
  },

  renderFieldError(errorText) {
    if (errorText) {
      return React.createElement("div", { className: "yes-field-error" }, errorText);
    } else {
      return React.createElement("div", { className: "no-field-error" });
    }
  },

  renderHeader(args) {
    const { columnHeader, hideHeader, property, redHeader, subheader } = args;
    if (hideHeader) {
      return null;
    }
    return(
      <>
        <h2 style={ redHeader ? { color: 'red' } : null }>{ columnHeader || ChangeCase.titleCase(property) }</h2>
        { subheader ? (<p className="subheader">{ subheader }</p>) : null }
      </>
    );
  },

  renderLeftLabel(args) {
    const { leftLabel } = args;
    if (!leftLabel) {
      return null;
    }
    return(
      <>
        <label>{ leftLabel }</label>
        <style jsx>{`
          position: absolute;
          right: 100%;
          width: 300px;
          text-align: right;
          margin-top: 10px;
          font-family: 'TeachableSans-Medium';
          font-size: 12px;
          color: #2C2F33;
        `}</style>
      </>
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
    const columnHeader = Details.getColumnHeader(args);
    const { errors } = this.state;
    const { property, errorsProperty, showFieldError, showErrorText } = args;
    const hasError = Details.fieldHasError(errors, errorsProperty || property);
    const errorText = Details.errorText(errors, errorsProperty || property);
    return(
      <>
        <div className={ `textbox-field col-xs-${args.columnWidth}` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <textarea
            rows={ args.rows }
            className={ Details.inputClassName(hasError) }
            onChange={ Details.changeField.bind(this, args) }
            value={ this.state[args.entity][args.property] || "" }
            data-entity={ args.entity }
            data-field={ args.property }
          ></textarea>
          { showErrorText === false ? null : (showFieldError === false ? Details.renderFieldError('') : Details.renderFieldError(errorText)) }
          { Details.renderCharacterCount.call(this, args) }
        </div>
        <style jsx>{`
          textarea {
            vertical-align: top;
          }
          .textbox-field {
            position: relative;
          }
        `}</style>
      </>
    );
  },

  renderCharacterCount(args) {
    if (args.characterCount) {
      const count = this.state.film[args.property] ? this.state.film[args.property].length : 0;
      return(
        <>
          <div className="character-count">({ count } characters)</div>
          <style jsx>{`
              position: absolute;
              font-size: 11px;
              text-align: right;
              bottom: 10px;
              right: 15px;
          `}</style>
        </>
      );
    }
  },

  renderUploadLink(func) {
    if (func) {
      return(
        <a className="upload" onClick={ func }>Upload Image</a>
      );
    }
  },

  renderLink(args) {
    const { linkText, linkUrl } = args;
    if (linkText) {
      return(
        <a className="link" href={ linkUrl }>{ linkText }</a>
      );
    }
  },

  renderWarning(args) {
    const { warnIf, warning } = args;
    if (warnIf) {
      return(
        <>
          <p>{ warning }</p>
          <style jsx>{`
            margin-top: 10px;
            background-color: lightyellow;
            padding: 10px;
            border-radius: 5px;
            font-family: 'TeachableSans-Bold';
          `}</style>
        </>
      );
    }
  },

  fieldHasError(errors, property) {
    if (!errors) {
      throw `missing errors for ${property} field!`;
    }
    return Object.keys(errors).includes(property);
  },

  errorText(errors, property) {
    if (!errors) {
      throw `missing errors for ${property} field!`;
    }
    const errorsArray = errors[property];
    return errorsArray ? errorsArray[0] : '';
  },

  inputClassName(hasError) {
    return hasError ? 'error' : '';
  },

  inputClassNameFromErrors(errors, property) {
    const hasError = Details.fieldHasError(errors, property);
    return Details.inputClassName(hasError);
  },

  saveButtonText() {
    return this.state.changesToSave ? 'Save' : (this.state.justSaved ? 'Saved' : 'No Changes');
  },

  selectModalOption(option, idEntity, entityName) {
    const changeFieldArgs = this.changeFieldArgs();
    let entity = this.state[entityName];
    entity[`${idEntity}Id`] = option.id;
    // Details.removeFieldError(changeFieldArgs.allErrors, changeFieldArgs.errorsArray, `${idEntity}Id`); TODO
    let obj = {
      [entityName]: entity,
      [`${idEntity}sModalOpen`]: false
    };
    if (this.changeFieldArgs().changesFunction) {
      obj.changesToSave = changeFieldArgs.changesFunction();
    }
    this.setState(obj);
  },

  stringifyJSONFields(args) {
    const { entity, jsonFields } = args;
    jsonFields.forEach((field) => {
      entity[field] = JSON.stringify(entity[field], null, 2);
    });
    return entity;
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
