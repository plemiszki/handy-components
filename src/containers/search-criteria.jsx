import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import ChangeCase from 'change-case'
import HandyTools from 'handy-tools'
import Common from './modules/common.js'

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
  }

  stringIsNumber(string) {
    return !isNaN(string) && !isNaN(parseFloat(string));
  }

  validateCriteria(criteria) {
    for (const [key, obj] of Object.entries(criteria)) {
      if (obj.minValue) { // number range
        let { minValue, maxValue } = obj;
        if (this.stringIsNumber(minValue) == false || this.stringIsNumber(maxValue) == false) {
          delete criteria[key];
        } else if (+maxValue < +minValue) {
          delete criteria[key];
        }
      } else if (obj.value) { // string
        if (criteria[key].value.trim() === '') {
          delete criteria[key];
        } else {
          criteria[key].value = criteria[key].value.trim();
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

  updateNumberRangeField(m, e) {
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
    let { criteria } = this.state;
    if (checked) {
      criteria[field.name] = this.initializeObject(field);
    } else {
      delete criteria[field.name];
    }
    this.setState({
      criteria
    }, () => {
      HandyTools.resetNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
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
      default:
        result.value = '';
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
      default:
        return keyExists && Object.keys(criteria[field.name]).indexOf('value') > -1;
    }
  }

  render() {
    return(
      <div className="component admin-modal">
        <form className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { this.renderFields() }
          <input type="submit" className={ "btn" + Common.renderDisabledButtonClass(this.state.fetching) } value={ this.state.buttonText } onClick={ this.clickSearch.bind(this) } />
        </form>
      </div>
    );
  }

  renderFields() {
    return(
      <div>
        {
          this.props.fields.map((field) => {
            const fieldActive = this.isFieldActive(field);
            return(
              <div key={ `${field.name}${field.type === 'number range' ? '-range' : ''}` } className={ fieldActive ? '' : 'disabled' }>
                <div className="row">
                  <div className="col-xs-1">
                    <input type="checkbox" onChange={ this.updateCheckbox.bind(this, field) } data-field={ field.name } checked={ fieldActive } />
                  </div>
                  { this.renderField.call(this, field, fieldActive) }
                </div>
                <style jsx>{`
                    .disabled h2 {
                      color: lightgray;
                    }
                    input[type="checkbox"] {
                      display: block;
                      margin: 0;
                      margin-top: 45px;
                    }
                `}</style>
              </div>
            );
          })
        }
      </div>
    );
  }

  renderField(field, fieldActive) {
    const { criteria } = this.state;
    const columnHeader = field.columnHeader || ChangeCase.titleCase(field.name);
    const value = (criteria[field.name] && criteria[field.name].hasOwnProperty('value')) ? criteria[field.name].value : '';
    switch (field.type) {
      case 'static dropdown':
        return(
          <div className={ `col-xs-${field.columnWidth} `}>
            <h2>{ columnHeader }</h2>
            <select onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive }>
              { this.renderOptions(field.options) }
            </select>
            <div className="no-dropdown-field-error" />
          </div>
        );
      case 'number range':
        const minValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('minValue')) ? criteria[field.name].minValue : '';
        const maxValue = (criteria[field.name] && criteria[field.name].hasOwnProperty('maxValue')) ? criteria[field.name].maxValue : '';
        const minValueIsNumber = this.stringIsNumber(minValue);
        const maxValueIsNumber = this.stringIsNumber(maxValue);
        const invalidRange = minValueIsNumber && maxValueIsNumber && +minValue > +maxValue;
        const minValueRed = fieldActive && (!minValueIsNumber || invalidRange);
        const maxValueRed = fieldActive && (!maxValueIsNumber || invalidRange);
        return(
          <>
            <div className={ `col-xs-${field.columnWidth} `}>
              <h2>{ columnHeader }</h2>
              Min: <input className={ `number-range min ${minValueRed ? 'red' : ''}` } onChange={ this.updateNumberRangeField.bind(this, 'minValue') } data-field={ field.name } value={ minValue } disabled={ !fieldActive } />
              Max: <input className={ `number-range ${maxValueRed ? 'red' : ''}` } onChange={ this.updateNumberRangeField.bind(this, 'maxValue') } data-field={ field.name } value={ maxValue } disabled={ !fieldActive } />
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
            <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ !fieldActive } />
            <div className="no-field-error" />
          </div>
        );
    }
  }

  renderOptions(options) {
    return HandyTools.alphabetizeArrayOfObjects(options, 'text').map((option, index) => {
      return(
        <option key={ index } value={ option.value }>
          { option.text }
        </option>
      );
    })
  }
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCriteria);
