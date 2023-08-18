import Common from './containers/modules/common.jsx'
import Details from './containers/modules/details.jsx'
import Index from './containers/modules/index.js'

import BottomButtons from './containers/bottom-buttons.jsx'
import Button from './containers/button.jsx'
import ConfirmDelete from './containers/confirm-delete.jsx'
import ConfirmModal from './containers/confirm-modal.jsx'
import DeleteButton from './containers/delete-button.jsx'
import FullIndex from './containers/full-index.jsx'
import GrayedOut from './containers/grayed-out.jsx'
import ListBox from './containers/list-box.jsx'
import ListBoxReorderable from './containers/list-box-reorderable.jsx'
import ListEntry from './containers/list-entry.jsx'
import Message from './containers/message.jsx'
import ModalMessage from './containers/modal-message.jsx'
import ModalSelect from './containers/modal-select.jsx'
import OutlineButton from './containers/outline-button.jsx'
import SaveButton from './containers/save-button.jsx'
import SimpleDetails from './containers/simple-details.jsx'
import SearchBar from './containers/search-bar.jsx'
import SearchCriteria from './containers/search-criteria.jsx'
import SearchIndex from './containers/search-index.jsx'
import Spinner from './containers/spinner.jsx'
import Table from './containers/table.jsx'

import { objectsAreEqual, stringIsNumber, stringIsDate } from './containers/utils/compare'
import {
  convertObjectKeysToUnderscore,
  ellipsis,
  hyphenCase,
  MONTHS,
  ordinatize,
  pluralize,
  removeFinanceSymbols,
  stringifyFullDate,
  stringifyDate,
  stringifyJSONFields,
  titleCase,
} from './containers/utils/convert'
import { deepCopy } from './containers/utils/copy'
import { pluckFromObjectsArray, parseUrl } from './containers/utils/extract'
import { todayDMY, rearrangeFields } from './containers/utils/misc'
import { removeFromArray } from './containers/utils/mutate'
import { resetNiceSelect, setUpNiceSelect } from './containers/utils/nice-select'
import { fetchEntity, fetchEntities, createEntity, updateEntity, deleteEntity, getCsrfToken, sendRequest } from './containers/utils/requests.js'
import { alphabetizeArrayOfObjects, commonSort, sortArrayOfObjects } from './containers/utils/sort'

const ModalSelectStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.50)',
  },
  content: {
    background: '#FFFFFF',
    margin: 'auto',
    maxWidth: 540,
    height: '90%',
    border: 'solid 1px #5F5F5F',
    borderRadius: '6px',
    textAlign: 'center',
    color: '#5F5F5F',
  }
}

export {
  alphabetizeArrayOfObjects,
  BottomButtons,
  Button,
  Common,
  commonSort,
  convertObjectKeysToUnderscore,
  ConfirmDelete,
  ConfirmModal,
  createEntity,
  deepCopy,
  DeleteButton,
  deleteEntity,
  Details,
  ellipsis,
  fetchEntity,
  fetchEntities,
  FullIndex,
  getCsrfToken,
  GrayedOut,
  hyphenCase,
  Index,
  ListBox,
  ListBoxReorderable,
  ListEntry,
  Message,
  ModalMessage,
  ModalSelect,
  ModalSelectStyles,
  MONTHS,
  objectsAreEqual,
  ordinatize,
  OutlineButton,
  parseUrl,
  pluckFromObjectsArray,
  pluralize,
  rearrangeFields,
  removeFinanceSymbols,
  removeFromArray,
  resetNiceSelect,
  SaveButton,
  SearchBar,
  SearchCriteria,
  SearchIndex,
  sendRequest,
  setUpNiceSelect,
  SimpleDetails,
  sortArrayOfObjects,
  Spinner,
  stringIsDate,
  stringIsNumber,
  stringifyDate,
  stringifyFullDate,
  stringifyJSONFields,
  Table,
  titleCase,
  todayDMY,
  updateEntity,
}
