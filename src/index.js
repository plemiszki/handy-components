import React from 'react'

import Common from './containers/modules/common.js'
import Details from './containers/modules/details.jsx'
import Index from './containers/modules/index.js'

import ConfirmDelete from './containers/confirm-delete.jsx'
import ModalMessage from './containers/modal-message.jsx'
import Message from './containers/message.jsx'
import ModalSelect from './containers/modal-select.jsx'
import SimpleDetails from './containers/simple-details.jsx'
import FullIndex from './containers/full-index.jsx'
import SearchIndex from './containers/search-index.jsx'
import TabbedIndex from './containers/tabbed-index.jsx'
import SearchCriteria from './containers/search-criteria.jsx'

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
  ConfirmDelete,
  Details,
  FullIndex,
  Index,
  Message,
  ModalMessage,
  ModalSelect,
  ModalSelectStyles,
  SearchCriteria,
  SearchIndex,
  SimpleDetails,
  TabbedIndex
}
