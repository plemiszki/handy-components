import React, { Component } from 'react'
import { snakeCase } from 'change-case'
import ModalSelect from './modal-select.jsx'
import Common from './modules/common.jsx'
import { titleCase } from './utils/convert.js'

import { stringIsDate, stringIsNumber } from './utils/compare.js'
import { stringifyDate } from './utils/convert.js'
import { removeFromArray } from './utils/mutate.js'
import { setUpNiceSelect } from './utils/nice-select.js'
import GrayedOut from './grayed-out.jsx'
import Spinner from './spinner.jsx'
import Button from './button.jsx'

export default class SearchCriteria extends Component {

  constructor(props) {
    super(props);

    this.state = {
      criteria: {},
      buttonText: (Object.keys(this.props.criteria).length > 0 ? 'Update Search' : 'Search')
    };
  }

  componentDidMount() {
    if (this.props.criteria) {
      this.setState({
        criteria: this.props.criteria
      }, () => {
        this.setupNiceSelectIfNeeded();
      });
    } else {
      this.setupNiceSelectIfNeeded();
    }

    const modalFields = this.props.fields.filter((field) => field.type === 'modal');
    if (modalFields.length > 0) {
      this.fetchDynamicData(modalFields);
    }
  }

  setupNiceSelectIfNeeded() {
    if (this.niceSelectRequired()) {
      setUpNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
    }
  }

  niceSelectRequired() {
    return this.props.fields.filter((field) => ['static dropdown', 'yes/no'].indexOf(field.type) > -1 ).length > 0;
  }

  fetchDynamicData(modalFields) {
    this.setState({
      spinner: true
    });
    fetch(`/api/${snakeCase(this.props.entityNamePlural)}/new`)
      .then(data => data.json())
      .then((response) => {
        let newState = { spinner: false };
        modalFields.forEach((field) => {
          newState[field.responseArrayName] = response[field.responseArrayName];
        })
        this.setState(newState, () => {
          this.setupNiceSelectIfNeeded();
        });
      })
  }

  validateCriteria(criteria) {
    for (const [key, obj] of Object.entries(criteria)) {
      if (obj.minValue) { // number range
        let { minValue, maxValue } = obj;
        if (stringIsNumber(minValue) == false || stringIsNumber(maxValue) == false) {
          delete criteria[key];
        } else if (+maxValue < +minValue) {
          delete criteria[key];
        }
      } else if (obj.startDate) { // date range
        let { startDate, endDate } = obj;
        if (stringIsDate(startDate) == false || stringIsDate(endDate) == false) {
          delete criteria[key];
        } else if (Date.parse(startDate) > Date.parse(endDate)) {
          delete criteria[key];
        }
      } else if (Array.isArray(obj.value)) { // checkboxes array
        if (obj.value.length === 0) {
          delete criteria[key];
        }
      } else if (obj.hasOwnProperty('value')) { // string (or id)
        const trimmedValue = obj.value.toString().trim();
        if (trimmedValue === '') {
          delete criteria[key];
        } else {
          criteria[key].value = trimmedValue;
        }
      }
    }
    return criteria;
  }

  clickSearch() {
    let validatedCriteria = this.validateCriteria(this.state.criteria);
    this.props.callback.call(this, validatedCriteria);
  }

  updateField(e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    let { criteria } = this.state;
    criteria[field].value = value;
    this.setState({
      criteria
    });
  }

  updateRangeField(m, e) {
    const field = e.target.dataset.field;
    const value = e.target.value;
    let { criteria } = this.state;
    criteria[field][m] = value;
    this.setState({
      criteria
    });
  }

  updateCheckbox(field, e) {
    const checked = e.target.checked;
    const fieldDropdownSelector = `div[data-test-field="${field.name}"] select`;
    let { criteria } = this.state;
    if (checked) {
      criteria[field.name] = this.initializeObject(field);
    } else {
      if (this.niceSelectRequired()) {
        let $dropDowns = $(fieldDropdownSelector);
        $dropDowns.niceSelect('destroy');
        $dropDowns.unbind('change');
      }
      delete criteria[field.name];
    }
    this.setState({
      criteria
    }, () => {
      if (checked) {
        if (this.niceSelectRequired()) {
          setUpNiceSelect({ selector: fieldDropdownSelector, func: this.updateField.bind(this) });
        }
      }
    });
  }

  updateOptionCheckbox(field, option, e) {
    const checked = e.target.checked;
    let { criteria } = this.state;
    let array = criteria[field.name].value;
    if (checked) {
      array.push(option.value);
    } else {
      removeFromArray(array, option.value);
    }
    this.setState({
      criteria
    });
  }

  initializeObject(field) {
    const { name, dbName } = field;
    let result = {};
    switch (field.type) {
      case 'number range':
        result.minValue = 0;
        result.maxValue = 1;
        break;
      case 'date range':
        const date = new Date();
        result.startDate = stringifyDate(date);
        result.endDate = stringifyDate(date);
        break;
      case 'static dropdown':
        result.value = field.options[0].value;
        break;
      case 'checkboxes':
        result.value = []
        break;
      case 'yes/no':
        result.value = 'true';
        break;
      case 'modal':
        const option = this.state[field.responseArrayName][0];
        result.value = option.id;
        result.text = option[field.optionDisplayProperty];
        break;
      default:
        result.value = '';
        if (field.fuzzy) {
          result.fuzzy = true;
        }
    }
    if (dbName) {
      result.dbName = dbName;
    }
    return result;
  }

  isFieldActive(field) {
    const { criteria } = this.state;
    const keyExists = Object.keys(criteria).indexOf(field.name) > -1;
    switch (field.type) {
      case 'number range':
        return keyExists && Object.keys(criteria[field.name]).indexOf('minValue') > -1;
      case 'date range':
        return keyExists && Object.keys(criteria[field.name]).indexOf('startDate') > -1;
      default:
        return keyExists && Object.keys(criteria[field.name]).indexOf('value') > -1;
    }
  }

  selectModalOption(field, option, modalOpenVar) {
    let { criteria } = this.state;
    criteria[field.name].value = option.id;
    criteria[field.name].text = option[field.optionDisplayProperty]
    let obj = {
      criteria,
      [modalOpenVar]: false
    }
    this.setState(obj);
  }

  render() {
    const { spinner, buttonText } = this.state;
    return (
      <>
        <div className="search-criteria handy-component admin-modal">
          <form className="white-box">
            { this.renderFields() }
            <hr />
            <Button
              onClick={ () => this.clickSearch() }
              text={ buttonText }
              disabled={ spinner }
              submit
            />
          </form>
          <GrayedOut visible={ spinner } />
          <Spinner visible={ spinner } />
        </div>
        <style jsx>{`
          hr {
            margin-left: -32px;
            width: calc(100% + 64px);
            margin-bottom: 30px;
          }
        `}</style>
      </>
    );
  }

  renderFields() {
    const rowHeight = 119;
    return (
      <>
        <div className="fields-container" style={ { height: this.props.rows * rowHeight } }>
          {
            this.props.fields.map((field) => {
              const fieldActive = this.isFieldActive(field);
              return (
                <div key={ `${field.name}${field.type === 'number range' ? '-range' : ''}` } className={ fieldActive ? '' : 'disabled' } data-test-field={ field.name }>
                  <div className="row">
                    <div className="col-xs-2">
                      <div className="switch-container">
                        { Common.renderSwitchComponent({
                          onChange: this.updateCheckbox.bind(this, field),
                          checked: fieldActive,
                          property: field.name,
                        }) }
                      </div>
                    </div>
                    { this.renderField.call(this, field, fieldActive) }
                  </div>
                </div>
              );
            })
          }
        </div>
        <style jsx>{`
          .fields-container {
            overflow: scroll;
          }
          .row {
            margin-left: 0;
            margin-right: 0;
          }
          .disabled h2 {
            color: lightgray;
          }
          .switch-container {
            margin-top: 33px;
          }
        `}</style>
      </>
    );
  }

  renderField(field, fieldActive) {
    const { criteria } = this.state;
    const columnHeader = field.columnHeader || titleCase(field.name);
    const value = (criteria[field.name] && criteria[field.name].hasOwnProperty('value')) ? criteria[field.name].value : '';
    const text = (criteria[field.name] && criteria[field.name].hasOwnProperty('text')) ? criteria[field.name].text : '';
    switch (field.type) {
      case 'yes/no':
        if (fieldActive) {
          return(
            <div className={ `col-xs-${field.columnWidth}`}>
              <h2>{ columnHeader }</h2>
              <select onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive }>
                <option value="t">
                  Yes
                </option>
                <option value="f">
                  No
                </option>
              </select>
              <div className="no-dropdown-field-error" />
            </div>
          );
        } else {
          return(
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
          );
        }
      case 'static dropdown':
        if (fieldActive) {
          return(
            <div className={ `col-xs-${field.columnWidth}` }>
              <h2>{ columnHeader }</h2>
              <select onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive }>
                { this.renderOptions(field.options) }
              </select>
              <div className="no-dropdown-field-error" />
            </div>
          );
        } else {
          return(
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
          );
        }
      case 'checkboxes':
        if (fieldActive) {
          return(
            <>
              <div className={ `col-xs-${field.columnWidth}` }>
                <h2>{ columnHeader }</h2>
                <div className="checkboxes-container">
                  { this.renderCheckboxes(field) }
                </div>
                <div className="no-field-error" />
              </div>
              <style jsx>{`
                  .checkboxes-container {
                    border: 1px solid #E4E9ED;
                    border-radius: 3px;
                    padding: 15px;
                    padding-bottom: 7px;
                  }
              `}</style>
            </>
          );
        } else {
          return (
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
          );
        }
      case 'modal':
        const modalOpenVar = `${field.name}sModalOpen`;
        return (
          <>
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ text } disabled={ !fieldActive } readOnly={ true } />
              <div className="no-field-error" />
            </div>
            { fieldActive ? (
              <div className="col-xs-1 select-from-modal" onClick={ Common.changeState.bind(this, modalOpenVar, true) }></div>
            ) : null }
            <ModalSelect isOpen={ this.state[modalOpenVar] } onClose={ Common.closeModals.bind(this) } options={ this.state[field.responseArrayName] || [] } property={ field.optionDisplayProperty } func={ (option) => { this.selectModalOption(field, option, modalOpenVar) } } noneOption={ false } />
          </>
        );
      case 'number range':
        const minValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('minValue')) ? criteria[field.name].minValue : '';
        const maxValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('maxValue')) ? criteria[field.name].maxValue : '';
        const minValueIsNumber = stringIsNumber(minValue);
        const maxValueIsNumber = stringIsNumber(maxValue);
        const invalidRange = minValueIsNumber && maxValueIsNumber && +minValue > +maxValue;
        const minValueRed = fieldActive && (!minValueIsNumber || invalidRange);
        const maxValueRed = fieldActive && (!maxValueIsNumber || invalidRange);
        return(
          <>
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              Min: <input className={ `number-range min ${minValueRed ? 'red' : ''}` } onChange={ this.updateRangeField.bind(this, 'minValue') } data-field={ field.name } value={ minValue } disabled={ !fieldActive } />
              Max: <input className={ `number-range max ${maxValueRed ? 'red' : ''}` } onChange={ this.updateRangeField.bind(this, 'maxValue') } data-field={ field.name } value={ maxValue } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
            <style jsx>{`
                .number-range {
                  width: 100px !important;
                }
                .min {
                  margin-right: 15px;
                }
                .red {
                  border: solid 1px red !important;
                }
            `}</style>
          </>
        );
      case 'date range':
        const startDate = (criteria[field.name] && criteria[field.name].hasOwnProperty('startDate')) ? criteria[field.name].startDate : '';
        const endDate = (criteria[field.name] && criteria[field.name].hasOwnProperty('endDate')) ? criteria[field.name].endDate : '';
        const startDateIsValid = stringIsDate(startDate);
        const endDateIsValid = stringIsDate(endDate);
        const invalidDateRange = startDateIsValid && endDateIsValid && (Date.parse(startDate) > Date.parse(endDate));
        const startDateRed = fieldActive && (!startDateIsValid || invalidDateRange);
        const endDateRed = fieldActive && (!endDateIsValid || invalidDateRange);
        return(
          <>
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              Start Date: <input className={ `number-range min ${startDateRed ? 'red' : ''}` } onChange={ this.updateRangeField.bind(this, 'startDate') } data-field={ field.name } value={ startDate } disabled={ !fieldActive } />
              End Date: <input className={ `number-range max ${endDateRed ? 'red' : ''}` } onChange={ this.updateRangeField.bind(this, 'endDate') } data-field={ field.name } value={ endDate } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
            <style jsx>{`
                .number-range {
                  width: 100px !important;
                }
                .min {
                  margin-right: 15px;
                }
                .red {
                  border: solid 1px red !important;
                }
            `}</style>
          </>
        );
      default:
        return(
          <div className={ `col-xs-${field.columnWidth} `}>
            <h2>{ columnHeader }</h2>
            <input className="test-input-field" onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
            <div className="no-field-error" />
          </div>
        );
    }
  }

  renderOptions(options) {
    return options.map((option, index) => {
      return(
        <option key={ index } value={ option.value }>
          { option.text }
        </option>
      );
    })
  }

  renderCheckboxes(field) {
    return field.options.map((option, index) => {
      const checkboxId = `box-${field.id}-${index}`
      return(
        <div key={ index }>
          <div className="checkbox-container">
            <input id={ checkboxId } type="checkbox" onChange={ this.updateOptionCheckbox.bind(this, field, option) } checked={ this.state.criteria[field.name].value.indexOf(option.value) > -1 } />
            <label htmlFor={ checkboxId }>{ option.text }</label>
          </div>
          <style jsx>{`
              .checkbox-container {
                margin-bottom: 8px;
              }
              input, label {
                display: inline-block;
                vertical-align: middle;
              }
              label {
                user-select: none;
              }
              input {
                margin: 0 !important;
                margin-right: 10px !important;
                display: inline-block;
              }
          `}</style>
        </div>
      );
    })
  }
}
