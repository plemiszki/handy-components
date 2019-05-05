import React from 'react'
import ChangeCase from 'change-case'

class ConfirmDelete extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return(
      <div className="confirm-delete">
        <h1>Are you sure you want to permanently delete this { ChangeCase.noCase(this.props.entityName) }&#63;</h1>
        <a className="btn red-button" onClick={ this.props.confirmDelete.bind(this) }>
          Yes
        </a>
        <a className="btn" onClick={ this.props.closeModal.bind(this) }>
          No
        </a>
      </div>
    );
  }
}

export default ConfirmDelete;
