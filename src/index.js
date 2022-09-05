import Common from './containers/modules/common.jsx'
import Details from './containers/modules/details.jsx'
import Index from './containers/modules/index.js'

import ConfirmDelete from './containers/confirm-delete.jsx'
import ModalMessage from './containers/modal-message.jsx'
import Message from './containers/message.jsx'
import ModalSelect from './containers/modal-select.jsx'
import SimpleDetails from './containers/simple-details.jsx'
import FullIndex from './containers/full-index.jsx'
import SearchIndex from './containers/search-index.jsx'
import SearchCriteria from './containers/search-criteria.jsx'

import { stringIsNumber, stringIsDate } from './containers/utils/compare'
import {
  convertObjectKeysToUnderscore,
  ellipsis,
  ordinatize,
  stringifyFullDate,
} from './containers/utils/convert'
import { deepCopy } from './containers/utils/copy'
import { alphabetizeArrayOfObjects, commonSort } from './containers/utils/sort'

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
  alphabetizeArrayOfObjects,
  Common,
  commonSort,
  convertObjectKeysToUnderscore,
  ConfirmDelete,
  deepCopy,
  Details,
  ellipsis,
  FullIndex,
  Index,
  Message,
  ModalMessage,
  ModalSelect,
  ModalSelectStyles,
  ordinatize,
  SearchCriteria,
  SearchIndex,
  SimpleDetails,
  stringIsDate,
  stringIsNumber,
  stringifyFullDate,
}
