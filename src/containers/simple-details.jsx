import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import HandyTools from 'handy-tools'
import Common from './modules/common.js'
import Details from './modules/details.jsx'
import { fetchEntity, updateEntity, deleteEntity } from '../actions/index'

class SimpleDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      fetching: true,
      [this.props.entityName]: this.props.initialEntity,
      [`${this.props.entityName}Saved`]: this.props.initialEntity,
      errors: []
    };
  }

  componentDidMount() {
    let pathDirectories = window.location.pathname.split('/');
    this.props.fetchEntity({
      id: pathDirectories[pathDirectories.length - 1],
      directory: pathDirectories[pathDirectories.length - 2],
      entityName: this.props.entityName
    }).then(() => {
      this.setState({
        fetching: false,
        [this.props.entityName]: this.props[this.props.entityName],
        [`${this.props.entityName}Saved`]: HandyTools.deepCopy(this.props[this.props.entityName]),
        changesToSave: false
      }, () => {
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
      this.props.updateEntity({
        id: pathDirectories[pathDirectories.length - 1],
        directory: pathDirectories[pathDirectories.length - 2],
        entityName: this.props.entityName,
        entity: this.state[this.props.entityName]
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

  render() {
    return (
      <div id="simple-details" className="component details-component">
        <h1>{ HandyTools.capitalize(this.props.entityName) } Details</h1>
        <div className="white-box">
          { Common.renderSpinner(this.state.fetching) }
          { Common.renderGrayedOut(this.state.fetching, -36, -32, 5) }
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
            <a className={ "btn blue-button standard-width" + Common.renderDisabledButtonClass(this.state.fetching || !this.state.changesToSave) } onClick={ this.clickSave.bind(this) }>
              { Details.saveButtonText.call(this) }
            </a>
            <a className={ "btn delete-button" + Common.renderDisabledButtonClass(this.state.fetching) } onClick={ Details.clickDelete.bind(this) }>
              Delete
            </a>
          </div>
        </div>
      </div>
    );
  }

  renderField(field) {
    if (field.type == 'textbox') {
      return Details.renderTextBox.bind(this)(field);
    } else {
      return Details.renderField.bind(this)(field);
    }
  }
}

const mapStateToProps = (reducers, props) => {
  return {
    [props.entityName]: reducers.standardReducer.entity,
    errors: reducers.standardReducer.errors
  };
};

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ fetchEntity, updateEntity, deleteEntity }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SimpleDetails);
