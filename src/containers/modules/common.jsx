import $ from 'jquery'
import React from 'react'
import Modal from 'react-modal'

const Common = {

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

  jobModalStyles() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: 'white',
        margin: 'auto',
        maxWidth: 540,
        height: 217,
        border: 'solid 1px black',
        borderRadius: '6px',
        textAlign: 'center',
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
        paddingTop: 130,
        lineHeight: '30px'
      }
    }
  },

  jobErrorsModalStyles() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: '#FFFFFF',
        margin: 'auto',
        maxWidth: 800,
        height: 550,
        border: 'solid 1px #5F5F5F',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#5F5F5F',
        padding: 20
      }
    }
  },

  messageModalStyles() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: '#FFFFFF',
        margin: 'auto',
        maxWidth: 540,
        height: 207,
        border: 'solid 1px black',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#5F5F5F',
        paddingTop: '36px'
      }
    }
  },

  newEntityModalStyles(modalDimensions, rows) {

    const buttonHeight = 47;
    const paddingHeight = 36;
    const borderHeight = 1;
    const constantHeight = buttonHeight + (paddingHeight * 2) + (borderHeight * 2);

    let height;
    if (rows) {
      height = constantHeight + (rows * 119);
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

  renderJobModal: function(job) {
    if (job) {
      if (job.status === 'failed') {
        return(
          <Modal isOpen={ this.state.jobModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.jobErrorsModalStyles() }>
            <div className="errors-modal">
              <h1>{ this.state.job.first_line }</h1>
              { this.state.job.errors_text.split("\n").map((error, index) => {
                var greenClass = "";
                if (error.substr(error.length - 3) === " :)") {
                  greenClass = " green";
                  error = error.substr(0, error.length - 3);
                }
                return(
                  <div key={ index } className={ `import-error${greenClass}` }>{ error }</div>
                );
              }) }
            </div>
          </Modal>
        )
      } else {
        return(
          <Modal isOpen={ this.state.jobModalOpen } contentLabel="Modal" style={ Common.jobModalStyles() }>
            <div className="jobs-modal">
              { Common.renderSpinner(true) }
              <div className="first-line">{ job.first_line || job.firstLine }</div>
              <div className={ "second-line" + ((job.second_line || job.secondLine) ? "" : " hidden") }>({ job.current_value || job.currentValue || 0 } of { job.total_value || job.totalValue })</div>
            </div>
          </Modal>
        );
      }
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

  searchModalStyles(modalDimensions, rows) {

    const rowHeight = 119;
    const buttonHeight = 47;
    const paddingHeight = 36;
    const borderHeight = 1;
    const hrHeight = 31;
    const constantHeight = hrHeight + buttonHeight + (paddingHeight * 2) + (borderHeight * 2);

    let height;
    if (rows) {
      height = constantHeight + (rows * rowHeight);
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
  },

  updateJobModal: function() {
    if (this.state.jobModalOpen && this.state.job.status === 'running') {
      window.setTimeout(() => {
        $.ajax({
          url: '/api/jobs/status',
          method: 'GET',
          data: {
            id: this.state.job.id,
            time: this.state.job.job_id
          },
          success: (response) => {
            let newState = {
              job: response
            };
            if (response.status === 'success') {
              newState.jobModalOpen = false;
            }
            this.setState(newState);
            if (response.status === 'success') {
              window.location.href = response.metadata.url;
            }
          }
        });
      }, 1500)
    }
  }
}

export default Common;
