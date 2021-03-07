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

  validateCriteria(criteria) {
    const keys = Object.keys(criteria);
    keys.forEach((key) => {
      if (criteria[key].value.trim() === '') {
        delete criteria[key];
      }
    });
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

  updateCheckbox(e) {
    const fieldName = e.target.dataset.field;
    const checked = e.target.checked;
    let { criteria } = this.state;
    if (checked) {
      criteria[fieldName] = this.initializeObject(fieldName);
    } else {
      delete criteria[fieldName];
    }
    this.setState({
      criteria
    }, () => {
      HandyTools.resetNiceSelect({ selector: 'select', func: this.updateField.bind(this) });
    });
  }

  initializeObject(fieldName) {
    const propsField = this.props.fields.filter((field) => field.name === fieldName)[0];
    let result = {};
    result.value = ''; // TODO: different default values for different field types
    if (propsField.dbName) {
      result.dbName = propsField.dbName;
    }
    return result;
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
            const keyExists = Object.keys(this.state.criteria).indexOf(field.name) > -1;
            const disabled = !keyExists;
            return(
              <div key={ field.name } className={ disabled ? 'disabled' : '' }>
                <div className="row">
                  <div className="col-xs-1">
                    <input type="checkbox" onChange={ this.updateCheckbox.bind(this) } data-field={ field.name } checked={ keyExists } />
                  </div>
                  { this.renderField.call(this, field, disabled) }
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

  renderField(field, disabled) {
    const columnHeader = field.columnHeader || ChangeCase.titleCase(field.name);
    const value = this.state.criteria[field.name] ? this.state.criteria[field.name].value : '';
    switch (field.type) {
      case 'static dropdown':
        return(
          <div className={ `col-xs-${field.columnWidth} `}>
            <h2>{ columnHeader }</h2>
            <select onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ disabled }>
              { this.renderOptions(field.options) }
            </select>
            <div className="no-dropdown-field-error" />
          </div>
        );
      default:
        return(
          <div className={ `col-xs-${field.columnWidth} `}>
            <h2>{ columnHeader }</h2>
            <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ value } disabled={ disabled } />
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
