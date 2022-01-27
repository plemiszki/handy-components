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

  jobSuccessModalStyles() {
    return {
      overlay: {
        background: 'rgba(0, 0, 0, 0.50)'
      },
      content: {
        background: '#FFFFFF',
        margin: 'auto',
        maxWidth: 540,
        height: 140,
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
      height = constantHeight + (rows * 119.33);
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
      backgroundColor: 'gray',
      opacity: 0.1,
      width: '100%',
      height: '100%',
      borderRadius: borderRadius || 0,
      top: 0,
      left: 0
    };
    if (shouldIRender) {
      return(
        React.createElement("div", {className: "grayed-out", style:  grayedOutStyle })
      );
    }
  },

  renderJobModal: function(job) {
    if (job) {
      const showErrorsModal = job.status === 'failed' || (job.status === 'success' && job.metadata.useErrorsModalOnSuccess);
      const showSuccessMessageModal = job.status === 'success' && job.metadata.showSuccessMessageModal;
      if (showErrorsModal) {
        return(
          <Modal isOpen={ this.state.jobModalOpen } onRequestClose={ Common.closeModals.bind(this) } contentLabel="Modal" style={ Common.jobErrorsModalStyles() }>
            <div className="errors-modal">
              <h1>{ this.state.job.firstLine }</h1>
              { this.state.job.errorsText.split("\n").map((error, index) => {
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
      } else if (showSuccessMessageModal) {
        return(
          <Modal isOpen={ this.state.jobModalOpen } contentLabel="Modal" style={ Common.jobSuccessModalStyles() }>
            <div>
              <h1>{ this.state.job.firstLine }</h1>
              <a className="orange-button" onClick={ Common.closeModals.bind(this) }>OK</a>
            </div>
            <style jsx>{`
              h1 {
                color: #2C2F33;
                font-family: 'TeachableSans-SemiBold';
                font-size: 20px;
                line-height: 27px;
                max-width: none;
                margin: auto;
                margin-bottom: 0;
              }
              .orange-button {
                width: 124px;
                padding-left: 0;
                padding-right: 0;
                margin-top: 20px;
                margin-right: 20px;
                margin-left: 20px;
                user-select: none;
              }
            `}</style>
          </Modal>
        );
      } else {
        return(
          <Modal isOpen={ this.state.jobModalOpen } contentLabel="Modal" style={ Common.jobModalStyles() }>
            <div className="jobs-modal">
              { Common.renderSpinner(true) }
              <div className="first-line">{ job.firstLine }</div>
              <div className={ "second-line" + (job.secondLine ? "" : " hidden") }>({ job.currentValue || 0 } of { job.totalValue || 0 })</div>
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

  renderSwitchComponent(args = {}) {
    return(
      <>
        <label>
          <input type="checkbox" onChange={ args.onChange } checked={ args.checked } data-entity={ args.entity } data-field={ args.property } />
          <div className="oval"></div>
        </label>
        <style jsx>{`
          label {
            position: relative;
            display: inline-block;
            vertical-align: middle;
            width: 60px;
            height: 34px;
          }
          input {
            display: none !important;
          }
          input:checked + div.oval {
            background-color: var(--button-color);
          }
          input:checked + div.oval:before {
            -webkit-transform: translateX(26px);
            -ms-transform: translateX(26px);
            transform: translateX(26px);
          }
          div.oval {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: gray;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 34px;
          }
          div.oval:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            -webkit-transition: .4s;
            transition: .4s;
            border-radius: 50%;
          }
        `}</style>
      </>
    );
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

  updateJobModal: function(args) {
    args = args || {};
    const { job, processedFinishedJob } = this.state;
    if (job) {
      if (job.status === 'running' && !this.state.updateJobInterval) {
        const updateJobInterval = window.setInterval(() => {
          $.ajax({
            url: `/api/jobs/${job.id}`,
            method: 'GET',
            success: (response) => {
              const { job } = response;
              const jobFinished = job.status != 'running';
              if (jobFinished) {
                clearInterval(this.state.updateJobInterval);
                Common.finishJob.call(this, Object.assign(args, { job }));
              } else {
                this.setState({
                  processedFinishedJob: false,
                  job,
                });
              }
            }
          });
        }, 1500);
        this.setState({
          updateJobInterval,
        });
      } else if ((job.status === 'success' || job.status === 'failed') && !processedFinishedJob) {
        Common.finishJob.call(this, Object.assign(args, { job }));
      }
    }
  },

  finishJob: function(args) {
    const { job, successCallback, failureCallback, ensureCallback } = args;
    let newState = {
      processedFinishedJob: true,
      updateJobInterval: null,
      job,
    };
    if (job.status === 'success') {
      if (job.metadata) {
        if (!job.metadata.useErrorsModalOnSuccess && !job.metadata.showSuccessMessageModal) {
          newState.jobModalOpen = false;
        }
      } else {
        newState.jobModalOpen = false;
      }
    }
    if (job.metadata && job.metadata.updateEntity) {
      if (job.metadata.entityName) {
        let newEntity = Object.assign(this.state[job.metadata.entityName], job.metadata.updateEntity);
        let newEntitySaved = Object.assign(this.state[`${job.metadata.entityName}Saved`], job.metadata.updateEntity);
        newState[job.metadata.entityName] = newEntity;
        newState[`${job.metadata.entityName}Saved`] = newEntitySaved;
      } else {
        throw 'entityName key missing in job metadata';
      }
    }
    this.setState(newState);
    if (job.status === 'success') {
      if (job.metadata.url) {
        window.location.href = job.metadata.url;
      } else if (successCallback) {
        successCallback.call(this, job);
      }
    }
    if (job.status === 'failed' && failureCallback) {
      failureCallback.call(this, job);
    }
    if (ensureCallback) {
      ensureCallback.call(this, job);
    }
  }
}

export default Common;
