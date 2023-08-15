import $ from 'jquery'
import React from 'react'
import ModalSelect from '../modal-select.jsx'
import Common from './common.jsx'
import { titleCase } from 'title-case'

import { convertBooleanToTFString, convertTFStringsToBoolean, removeFinanceSymbols } from '../utils/convert'
import { deepCopy } from '../utils/copy'
import { pluckFromObjectsArray, parseUrl } from '../utils/extract'
import { alphabetizeArrayOfObjects } from '../utils/sort'
import { deleteEntity } from '../utils/requests'
import { get, set } from 'lodash'

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
      nestedKeys = [],
    } = args;
    const changeFieldArgs = this.changeFieldArgs();
    const errors = Details.getErrors.call(this, args);
    const input = event.target;

    // remove field error
    Details.removeFieldError(errors, errorsProperty || property);

    // what is the new value of the property?
    let newValue;
    if ($(input).is('select')) {
      newValue = convertTFStringsToBoolean(input.value);
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
    set(obj, [property].concat(nestedKeys), newValue)

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
          changesToSave,
        });
        if (changeFieldArgs.callback) {
          changeFieldArgs.callback.call(this, newStateObj);
        }
      } else if (changeFieldArgs.callback) {
        changeFieldArgs.callback.call(this, newStateObj);
      }
    });
  },

  confirmDelete(args = {}) {
    const { callback } = args;
    this.setState({
      deleteModalOpen: false,
      spinner: true,
      spinner: true,
    });
    deleteEntity().then((response) => {
      if (callback) {
        callback.call({}, response);
      } else {
        const directory = parseUrl()[1];
        window.location.pathname = directory
      }
    })
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
    return args.columnHeader || titleCase(args.property);
  },

  getValue(args) {
    const { value, entity, entities, entitiesIndex, property, nestedKeys = [] } = args;
    if (value) {
      return value || '';
    }
    if (entity) {
      const path = [entity, property].concat(nestedKeys);
      return get(this.state, path, '');
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
        { return alphabetizeArrayOfObjects(options, args.optionSortProperty || args.optionDisplayProperty || 'text').map((option, index) => {
          return(
            <option key={ index } value={ option[args.optionValueProperty] || option.value || option.id }>
              { option[args.optionDisplayProperty || 'text'] }
            </option>
          );
        })}
      }
    }

    const columnHeader = Details.getColumnHeader(args);
    const { errors } = this.state;
    const { entity, property, errorsProperty, hideFieldError } = args;
    const hasError = Details.fieldHasError(errors, errorsProperty || property);
    const errorText = Details.errorText(errors, errorsProperty || property);

    let value;
    if (args.boolean && args.readOnly) {
      value = this.state[entity][property] ? 'Yes' : 'No';
    } else if (args.boolean) {
      value = convertBooleanToTFString(this.state[entity][property]) || "";
    } else {
      value = this.state[entity][property] || '';
    }

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
      if (!args.boolean && value !== '') {
        const option = options.find(option => (args.optionValueProperty ? option[args.optionValueProperty] : (option['value'] || option['id']) ) == value);
        value = option[args.optionDisplayProperty];
      }
      return Details.renderField.call(this, Object.assign(args, { value }));
    }

    return (
      <>
        <div className={ `col-xs-${args.columnWidth} ${hasError ? 'has-error' : ''} ${(args.maxOptions ? `select-scroll-${args.maxOptions}` : 'select-scroll-6') }` }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          <select onChange={ Details.changeDropdownField.bind(this, args) } value={ value } data-entity={ args.entity } data-field={ args.property }>
            { renderNoneOption(args) }
            { renderOptions(args, options) }
          </select>
          { hideFieldError ? null : Details.renderDropdownFieldError(errorText) }
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
          { Details.renderFieldError(errorText, args) }
        </div>
      );
    }
  },

  renderSwitch(args) {
    const { entity, property, readOnly, columnWidth, center, style, hidden, color } = args;
    let columnHeader = Details.getColumnHeader(args);
    const checked = Details.getValue.call(this, args) || false;
    if (hidden) {
      return <div className={ `col-xs-${columnWidth}` }></div>;
    } else {
      return (
        <div className={ `col-xs-${columnWidth} ${center ? 'text-center' : ''}` } style={ style }>
          <h2>{ columnHeader }</h2>
          { Details.renderSubheader(args) }
          { Common.renderSwitchComponent({
            onChange: Details.changeField.bind(this, args),
            checked,
            entity,
            property,
            readOnly,
            color,
          }) }
        </div>
      );
    }
  },

  renderField(args) {
    const {
      columnOffset,
      columnWidth,
      containerClassSuffix,
      entitiesIndex,
      entity,
      errorsProperty,
      hidden,
      inputStyles,
      noneOption,
      optionDisplayProperty,
      optionsArrayName,
      placeholder,
      property,
      readOnly,
      rows,
      styles,
      type,
    } = args;

    let containerClass = columnOffset ? `col-xs-${columnWidth} col-xs-offset-${columnOffset}` : `col-xs-${columnWidth}`;
    if (containerClassSuffix) {
      containerClass = containerClass + ` ${containerClassSuffix}`;
    }

    if (hidden) {
      return <div className={ containerClass }></div>;
    }

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
          value = pluckFromObjectsArray({
            array: this.state[calculatedOptionsArrayName],
            property: 'id',
            value: +selectedId,
          })[optionDisplayProperty];
        }
        return ([
          <div key={ 1 } className={ `col-xs-${columnWidth - 1}` } style={ styles }>
            { Details.renderHeader(args) }
            <input
              className={ Details.inputClassName(hasError) }
              onChange={ Details.changeField.bind(this, args) }
              value={ value }
              placeholder={ placeholder }
              data-field={ property }
              readOnly={ true }
              style={ inputStyles }
            />
            { Details.renderTagsBelowField(args, errorText) }
          </div>,
          <div key={ 2 } className="col-xs-1 select-from-modal" onClick={ Common.changeState.bind(this, `${idEntity}sModalOpen`, true) }>
          </div>,
          <ModalSelect
            key={ 3 }
            isOpen={ this.state[`${idEntity}sModalOpen`] }
            onClose={ Common.closeModals.bind(this) }
            options={ alphabetizeArrayOfObjects(this.state[calculatedOptionsArrayName], optionDisplayProperty) }
            property={ optionDisplayProperty }
            func={ (option) => { Details.selectModalOption.call(this, option, idEntity, entity) } }
            noneOption={ noneOption }
          />,
        ]);
      case 'textbox':
        value = Details.getValue.call(this, args);
        return (
          <>
            <div className={ `textbox-field ${containerClass}` } style={ styles }>
              { Details.renderHeader(args) }
              <textarea
                rows={ rows }
                className={ Details.inputClassName(hasError) }
                onChange={ Details.changeField.bind(this, args) }
                value={ value }
                data-entity={ entity }
                data-field={ property }
                style={ inputStyles }
              ></textarea>
              { Details.renderTagsBelowField(args, errorText) }
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
      case 'json':
        value = Details.getValue.call(this, args);
        return (
          <div className={ containerClass } style={ styles }>
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
                style={ inputStyles }
              />
              <style jsx>{`
                textarea {
                  font-family: monospace;
                  font-size: 14px;
                }
              `}</style>
            </>
            { Details.renderTagsBelowField(args, errorText) }
          </div>
        );
      default:
        value = Details.getValue.call(this, args);
        return (
          <div className={ containerClass } style={ styles }>
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
              style={ inputStyles }
            />
            { Details.renderTagsBelowField(args, errorText) }
          </div>
        );
    }
  },

  renderTagsBelowField(args, errorText) {
    const { uploadLinkFunction, showErrorText, showFieldError } = args;
    return(
      <>
        { Details.renderUploadLink(uploadLinkFunction) }
        { Details.renderLink(args) }
        { Details.renderWarning(args) }
        { showErrorText === false ? null : (showFieldError === false ? Details.renderFieldError('', args) : Details.renderFieldError(errorText, args)) }
      </>
    );
  },

  renderFieldError(errorText, args) {
    const { hideFieldError } = args;
    if (hideFieldError) {
      return null;
    }
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
        <h2 style={ redHeader ? { color: 'red' } : null }>{ columnHeader || titleCase(property) }</h2>
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
          label {
            position: absolute;
            right: 100%;
            width: 300px;
            text-align: right;
            margin-top: 10px;
            font-family: 'TeachableSans-Medium';
            font-size: 12px;
            color: #2C2F33;
          }
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
      return (
        <>
          <a className="upload" onClick={ func }>Upload Image</a>
          <style jsx>{`
            a.upload {
              margin-top: 10px;
              display: inline-block;
              font-size: 10px;
              cursor: pointer;
              color: #95949B;
            }
          `}</style>
        </>
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
            p {
              margin-top: 10px;
              background-color: lightyellow;
              padding: 10px;
              border-radius: 5px;
              font-family: 'TeachableSans-Bold';
            }
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
      if (changeFieldArgs.callback) {
        changeFieldArgs.callback.call(this, obj[entityName]);
      }
    } else if (changeFieldArgs.callback) {
      changeFieldArgs.callback.call(this, obj[entityName]);
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
    const [id, directory] = parseUrl();
    this.props.updateEntity({
      id,
      directory,
      entityName: entityName,
      entity: this.state[entityName]
    }).then(() => {
      let savedEntity = this.props[entityName];
      this.setState({
        spinner: false,
        [entityName]: savedEntity,
        [`${entityName}Saved`]: deepCopy(savedEntity),
        changesToSave: false
      });
    }, () => {
      this.setState({
        spinner: false,
        errors: this.props.errors
      });
    });
  },

  getAllErrors() {
    return typeof Errors == 'undefined' ? this.changeFieldArgs().allErrors : Errors;
  },

  removeFinanceSymbolsFromEntity(args) {
    let result = deepCopy(args.entity);
    args.fields.forEach((field) => {
      result[field] = removeFinanceSymbols(args.entity[field]);
    });
    return result;
  }
}

export default Details;
