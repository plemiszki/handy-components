import React from 'react'

class ModalMessage extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return(
      <div className="modal-message">
        <h1>{ this.props.message }</h1>
        { this.props.memo && (<p>{ this.props.memo }</p>) }
      </div>
    );
  }
}

export default ModalMessage;
