import React, { Component } from 'react'
import Common from './modules/common.jsx'

class Message extends React.Component {

  constructor(props) {
    super(props);

    let initialState = {
      message: '',
      color: ''
    }

    this.state = initialState;
  }

  componentDidMount() {
    let message = localStorage.getItem('message');
    if (message) {
      this.setState({
        message,
        color: localStorage.getItem('message-color')
      }, () => {
        localStorage.removeItem('message');
        localStorage.removeItem('message-color');
      });
    }
  }

  render() {
    if (this.state.message) {
      let lines = this.state.message.split("\n");
      return(
        <div className={ `message-box${ this.state.color ? ` ${this.state.color}` : ''}` }>
          <div className="message-close" onClick={ Common.changeState.bind(this, 'message', '') }></div>
          { lines.map((line, index) => {
            return(
              <p key={ index }>{ line }</p>
            );
          }) }
        </div>
      );
    } else {
      return null;
    }
  }
}

export default Message;
