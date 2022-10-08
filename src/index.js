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
import Button from './containers/button.jsx'

import { objectsAreEqual, stringIsNumber, stringIsDate } from './containers/utils/compare'
import {
  convertObjectKeysToUnderscore,
  ellipsis,
  MONTHS,
  ordinatize,
  pluralize,
  removeFinanceSymbols,
  stringifyFullDate,
  stringifyDate,
} from './containers/utils/convert'
import { deepCopy } from './containers/utils/copy'
import { pluckFromObjectsArray, parseUrl } from './containers/utils/extract'
import { todayDMY } from './containers/utils/misc'
import { removeFromArray } from './containers/utils/mutate'
import { resetNiceSelect, setUpNiceSelect } from './containers/utils/nice-select'
import { fetchEntity, fetchEntities, createEntity, updateEntity, deleteEntity, getCsrfToken, sendRequest } from './containers/utils/requests.js'
import { alphabetizeArrayOfObjects, commonSort, sortArrayOfObjects } from './containers/utils/sort'

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
  Button,
  Common,
  commonSort,
  convertObjectKeysToUnderscore,
  ConfirmDelete,
  createEntity,
  deepCopy,
  deleteEntity,
  Details,
  ellipsis,
  fetchEntity,
  fetchEntities,
  getCsrfToken,
  FullIndex,
  Index,
  Message,
  ModalMessage,
  ModalSelect,
  ModalSelectStyles,
  MONTHS,
  objectsAreEqual,
  ordinatize,
  parseUrl,
  pluckFromObjectsArray,
  pluralize,
  removeFinanceSymbols,
  removeFromArray,
  resetNiceSelect,
  SearchCriteria,
  SearchIndex,
  sendRequest,
  setUpNiceSelect,
  SimpleDetails,
  sortArrayOfObjects,
  stringIsDate,
  stringIsNumber,
  stringifyDate,
  stringifyFullDate,
  todayDMY,
  updateEntity,
}
