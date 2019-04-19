import React, { Component } from 'react';
import HandyTools from 'handy-tools';
import MatchHeight from 'jquery-match-height';
import ChangeCase from 'change-case';

let Details = {

  changeField: function(changeFieldArgs, event) {
    var key = event.target.dataset.field;
    var entity = event.target.dataset.entity;
    var saveKey;
    var saveValue;

    var value = $(event.target).is('select') ? HandyTools.convertTFStringsToBoolean(event.target.value) : event.target.value;

    if (entity) {
      var newEntity = this.state[entity];
      newEntity[key] = value;
      saveKey = entity;
      saveValue = newEntity;
    } else {
      saveKey = key;
      saveValue = value;
    }

    Details.removeFieldError(changeFieldArgs.allErrors, changeFieldArgs.errorsArray, key);

    if (changeFieldArgs.beforeSave) {
      var beforeSaveResult = changeFieldArgs.beforeSave.call(this, saveKey, saveValue);
      saveKey = beforeSaveResult.key;
      saveValue = beforeSaveResult.value;
    }

    this.setState({
      [saveKey]: saveValue,
      justSaved: false
    }, function() {
      if (changeFieldArgs.changesFunction) {
        var changesToSave = changeFieldArgs.changesFunction.call();
        this.setState({
          changesToSave: changesToSave
        });
      }
    });
  },

  clickDelete() {
    this.setState({
      fetching: true
    });
    let urlSections = window.location.pathname.split('/');
    this.props.deleteEntity(urlSections[urlSections.length - 2], urlSections[urlSections.length - 1]);
  },

  errorClass: function(stateErrors, fieldErrors) {
    var i;
    for (i = 0; i < fieldErrors.length; i++) {
      if (stateErrors.indexOf(fieldErrors[i]) > -1) {
        return 'error';
      }
    }
    return '';
  },

  fetchEntity() {
    this.props.fetchEntity({
      id: window.location.pathname.split('/')[2],
      directory: window.location.pathname.split('/')[1],
      entityName: this.props.entityName
    }, this.props.entityName).then(() => {
      let newState = {
        fetching: false,
        [this.props.entityName]: this.props[this.props.entityName],
        [`${this.props.entityName}Saved`]: HandyTools.deepCopy(this.props[this.props.entityName]),
        changesToSave: false
      };
      if (this.props.array1Name) {
        Object.assign(newState, { [this.props.array1Name]: this.props[this.props.array1Name] });
      }
      if (this.props.array2Name) {
        Object.assign(newState, { [this.props.array2Name]: this.props[this.props.array2Name] });
      }
      if (this.props.array3Name) {
        Object.assign(newState, { [this.props.array3Name]: this.props[this.props.array3Name] });
      }
      this.setState(newState, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: Details.changeField.bind(this, this.changeFieldArgs()) });
      });
    });
  },

  getColumnHeader(args) {
    return args.columnHeader || ChangeCase.titleCase(args.property);
  },

  removeFieldError(errors, errorsArray, fieldName) {
    if (errors[fieldName]) {
      if (!errorsArray) {
        console.log("no errors array!!!");
      }
      errors[fieldName].forEach(function(message) {
        HandyTools.removeFromArray(errorsArray, message);
      });
    }
  },

  renderDropDown(args) {

    function renderNoneOption(args) {
      if (args.optional) {
        return(
          <option key={ -1 } value={ '' }>(None)</option>
        );
      }
    }

    function renderOptions(args) {
      if (args.boolean) {
        return([
          <option key={ 0 } value={ "t" }>Yes</option>,
          <option key={ 1 } value={ "f" }>No</option>
        ]);
      } else {
        { return HandyTools.alphabetizeArrayOfObjects(args.options, args.optionDisplayProperty).map((option, index) => {
          return(
            <option key={ index } value={ args.optionValueProperty || option.id }>
              { option[args.optionDisplayProperty] }
            </option>
          );
        })}
      }
    }

    let columnHeader = Details.getColumnHeader(args);
    return(
      <div className={ `col-xs-${args.columnWidth} ` + (args.maxOptions ? `select-scroll-${args.maxOptions}` : 'select-scroll-6') }>
        <h2>{ columnHeader }</h2>
        <select className={ Details.errorClass(this.state.errors, Errors[args.property] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ HandyTools.convertBooleanToTFString(this.state[args.entity][args.property]) || "" } data-entity={ args.entity } data-field={ args.property }>
          { renderNoneOption(args) }
          { renderOptions(args) }
        </select>
        { Details.renderDropdownFieldError(this.state.errors, Errors[args.property] || []) }
      </div>
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

  renderField(args) {
    let columnHeader = Details.getColumnHeader(args);
    if (args.hidden) {
      return <div className={ `col-xs-${args.columnWidth}` }></div>;
    } else {
      return(
        <div className={ `col-xs-${args.columnWidth}` }>
          <h2>{ columnHeader }</h2>
          <input className={ Details.errorClass(this.state.errors, Errors[args.property] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[args.entity][args.property] || "" } data-entity={ args.entity } data-field={ args.property } placeholder={ args.placeholder } />
          { Details.renderUploadLink(args.uploadLinkFunction) }
          { Details.renderFieldError(this.state.errors, Errors[args.property] || []) }
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

  renderTextBox(args) {
    let columnHeader = Details.getColumnHeader(args);
    return(
      <div className={ `col-xs-${args.columnWidth}` }>
        <h2>{ columnHeader }</h2>
        <textarea rows={ args.rows } className={ Details.errorClass(this.state.errors, Errors[args.property] || []) } onChange={ Details.changeField.bind(this, this.changeFieldArgs()) } value={ this.state[args.entity][args.property] || "" } data-entity={ args.entity } data-field={ args.property }></textarea>
        { Details.renderFieldError(this.state.errors, Errors[args.property] || []) }
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
  }
}

export default Details;
