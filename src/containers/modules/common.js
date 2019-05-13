import React from 'react';

export default {

  changeState(property, value) {
    this.setState({
      [property]: value
    });
  },

  changeStateToTarget(property, e) {
    this.setState({
      [property]: e.target.value
    });
  },

  checkForMessage() {
    let message = localStorage.getItem('message');
    if (message) {
      this.setState({
        message,
        messageColor: localStorage.getItem('message-color')
      }, () => {
        localStorage.removeItem('message');
        localStorage.removeItem('message-color');
      });
    }
  },

  closeModals() {
    let keys = Object.keys(this.state).filter((key) => {
      return key.slice(-9) === 'ModalOpen';
    });
    let result = {};
    keys.forEach((key) => {
      result[key] = false
    });
    this.setState(result);
  },

  deleteModalStyles() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: '#FFFFFF',
        margin: 'auto',
        maxWidth: 540,
        height: 207,
        border: 'solid 1px red',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#5F5F5F',
        paddingTop: '36px'
      }
    }
  },

  firstElementPropertyOrBlank(array, property) {
    if (array && array.length > 0) {
      return array[0][property];
    } else {
      return "";
    }
  },

  matchColumnHeight() {
    $('.match-height-layout').matchHeight();
  },

  newEntityModalStyles(modalDimensions, rows) {
    let height;
    if (rows) {
      height = 121 + (rows * 119);
    } else {
      height = modalDimensions.height || 240;
    }
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: 'white',
        padding: 0,
        margin: 'auto',
        maxWidth: modalDimensions.width || 1000,
        height: height
      }
    }
  },

  renderDisabledButtonClass: function(condition) {
    return condition ? " disabled" : "";
  },

  renderInactiveButtonClass: function(condition) {
    return condition ? " inactive" : "";
  },

  renderGrayedOut: function(shouldIRender, marginTop, marginLeft, borderRadius) {
    var grayedOutStyle = {
      position: 'absolute',
      zIndex: 100,
      backgroundColor: 'gray',
      opacity: 0.1,
      width: '100%',
      height: '100%',
      borderRadius: borderRadius || 0,
      marginTop: marginTop || 0,
      marginLeft: marginLeft || 0
    };
    if (shouldIRender) {
      return(
        React.createElement("div", {className: "grayed-out", style:  grayedOutStyle })
      );
    }
  },

  renderSpinner: function(shouldIRender, spinnerSize) {
    spinnerSize = spinnerSize || 90;
    var spinnerStyle = {
      width: spinnerSize,
      height: spinnerSize,
      left: 'calc(50% - ' + (spinnerSize / 2) + 'px)',
      top: 'calc(50% - ' + (spinnerSize / 2) + 'px)'
    };
    if (shouldIRender) {
      return(
        React.createElement("div", { className: "spinner", style:  spinnerStyle })
      );
    }
  },

  selectModalStyles: function() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: '#FFFFFF',
        margin: 'auto',
        maxWidth: 540,
        height: '90%',
        border: 'solid 1px #5F5F5F',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#5F5F5F'
      }
    };
  }
}
