import React from 'react'
import Modal from 'react-modal'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import ModalSelect from './modal-select.jsx'
import Common from './modules/common.jsx'
import { fetchDataForNew } from '../actions/index'

class SearchCriteria extends React.Component {

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
        HandyTools.setUpNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
      });
    } else {
      HandyTools.setUpNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
    }

    const modalFields = this.props.fields.filter((field) => field.type === 'modal');
    if (modalFields.length > 0) {
      this.fetchDynamicData(modalFields);
    }
  }

  fetchDynamicData(modalFields) {
    this.setState({
      fetching: true
    });
    this.props.fetchDataForNew({ directory: ChangeCase.snakeCase(this.props.entityNamePlural) }).then(() => {
      let obj = { fetching: false };
      modalFields.forEach((field) => {
        obj[field.responseArrayName] = this.props[field.responseArrayName];
      })
      this.setState(obj, () => {
        HandyTools.setUpNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
      });
    });
  }

  validateCriteria(criteria) {
    for (const [key, obj] of Object.entries(criteria)) {
      if (obj.minValue) { // number range
        let { minValue, maxValue } = obj;
        if (HandyTools.stringIsNumber(minValue) == false || HandyTools.stringIsNumber(maxValue) == false) {
          delete criteria[key];
        } else if (+maxValue < +minValue) {
          delete criteria[key];
        }
      } else if (obj.startDate) { // date range
        let { startDate, endDate } = obj;
        if (HandyTools.stringIsDate(startDate) == false || HandyTools.stringIsDate(endDate) == false) {
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

  clickSearch(e) {
    e.preventDefault();
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
      let $dropDowns = $(fieldDropdownSelector);
      $dropDowns.niceSelect('destroy');
      $dropDowns.unbind('change');
      delete criteria[field.name];
    }
    this.setState({
      criteria
    }, () => {
      if (checked) {
        HandyTools.setUpNiceSelect({ selector: fieldDropdownSelector, func: this.updateField.bind(this) });
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
      HandyTools.removeFromArray(array, option.value);
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
        result.startDate = HandyTools.stringifyDate(date);
        result.endDate = HandyTools.stringifyDate(date);
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
    return(
      <div className="search-criteria component admin-modal">
        <form className="white-box">
          { this.renderFields() }
          <hr />
          <input type="submit" className={ "submit-button btn" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.state.buttonText } onClick={ this.clickSearch.bind(this) } />
        </form>
        { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
        { Common.renderSpinner(this.state.fetching) }
      </div>
    );
  }

  renderFields() {
    const rowHeight = 119;
    return(
      <>
        <div className="fields-container" style={ { height: this.props.rows * rowHeight } }>
          {
            this.props.fields.map((field) => {
              const fieldActive = this.isFieldActive(field);
              return(
                <div key={ `${field.name}${field.type === 'number range' ? '-range' : ''}` } className={ fieldActive ? '' : 'disabled' } data-test-field={ field.name }>
                  <div className="row">
                    <div className="col-xs-2">
                      <div className="switch-container">
                        { Common.renderSwitchComponent({
                          onChange: this.updateCheckbox.bind(this, field),
                          checked: fieldActive,
                          property: field.name
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
    const columnHeader = field.columnHeader || ChangeCase.titleCase(field.name);
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
          return(
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
              <div className="no-field-error" />
            </div>
          );
        }
      case 'modal':
        const modalOpenVar = `${field.name}sModalOpen`;
        return(
          <>
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ text } disabled={ !fieldActive } readOnly={ true } />
              <div className="no-field-error" />
            </div>
            { fieldActive ? (
              <div className="col-xs-1 select-from-modal" onClick={ Common.changeState.bind(this, modalOpenVar, true) }></div>
            ) : null }
            <Modal isOpen={ this.state[modalOpenVar] } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.selectModalStyles() }>
              <ModalSelect options={ this.state[field.responseArrayName] } property={ field.optionDisplayProperty } func={ (option) => { this.selectModalOption(field, option, modalOpenVar) } } noneOption={ false } />
            </Modal>
          </>
        );
      case 'number range':
        const minValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('minValue')) ? criteria[field.name].minValue : '';
        const maxValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('maxValue')) ? criteria[field.name].maxValue : '';
        const minValueIsNumber = HandyTools.stringIsNumber(minValue);
        const maxValueIsNumber = HandyTools.stringIsNumber(maxValue);
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
        const startDateIsValid = HandyTools.stringIsDate(startDate);
        const endDateIsValid = HandyTools.stringIsDate(endDate);
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
              }
          `}</style>
        </div>
      );
    })
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchDataForNew }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCriteria);
