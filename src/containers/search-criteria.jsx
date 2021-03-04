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
      criteria: {}
    };
  }

  componentDidMount() {
    if (this.props.criteria) {
      this.setState({
        criteria: this.props.criteria
      });
    }
  }

  validateCriteria(criteria) {
    const keys = Object.keys(criteria);
    keys.forEach((key) => {
      if (criteria[key].trim() === '') {
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
    criteria[field] = value;
    this.setState({
      criteria
    });
  }

  updateCheckbox(e) {
    const field = e.target.dataset.field;
    const checked = e.target.checked;
    let { criteria } = this.state;
    if (checked) {
      criteria[field] = ''; // TODO: different default values for different field types
    } else {
      delete criteria[field];
    }
    this.setState({
      criteria
    });
  }

  render() {
    return(
      <div className="component admin-modal">
        <form className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
          { this.renderFields() }
          <input type="submit" className={ "btn" + Common.renderDisabledButtonClass(this.state.fetching) } value="Search" onClick={ this.clickSearch.bind(this) } />
        </form>
      </div>
    );
  }

  renderFields() {
    return(
      <div>
        {
          this.props.fields.map((field) => {
            const columnHeader = field.columnHeader || ChangeCase.titleCase(field.name);
            const keyExists = Object.keys(this.state.criteria).indexOf(field.name) > -1;
            const disabled = !keyExists;
            return(
              <div key={ field.name } className={ disabled ? 'disabled' : '' }>
                <div className="row">
                  <div className="col-xs-1">
                    <input type="checkbox" onChange={ this.updateCheckbox.bind(this) } data-field={ field.name } checked={ keyExists } />
                  </div>
                  <div className={ `col-xs-${field.columnWidth} `}>
                    <h2>{ columnHeader }</h2>
                    <input onChange={ this.updateField.bind(this) } data-field={ field.name } value={ this.state.criteria[field.name] || '' } disabled={ disabled } />
                    <div className="no-field-error" />
                  </div>
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
}

const mapStateToProps = (reducers) => {
  return reducers.standardReducer;
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchCriteria);
