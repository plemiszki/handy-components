import React from 'react'

import Common from './containers/modules/common.js'
import Details from './containers/modules/details.jsx'
import Index from './containers/modules/index.js'

import Message from './containers/message.jsx'
import ModalSelect from './containers/modal-select.jsx'
import StandardIndex from './containers/standard-index.jsx'
import TabbedIndex from './containers/tabbed-index.jsx'

const ModalSelectStyles = {
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
}

export {
  Common,
  Details,
  Index,
  Message,
  ModalSelect,
  ModalSelectStyles,
  StandardIndex,
  TabbedIndex
}
