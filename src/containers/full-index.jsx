import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import { snakeCase, camelCase } from 'change-case'
import Common from './modules/common.jsx'
import SearchBar from './search-bar.jsx'
import Button from './button.jsx'
import Spinner from './spinner.jsx'
import GrayedOut from './grayed-out.jsx'
import Table from './table.jsx'
import { titleCase } from './utils/convert.js'

export default function FullIndex(props) {

  const {
    children,
    entityName,
    header,
    includeNewButton,
    includeSearchBar = true,
    modalDimensions,
    modalRows,
    addButtonText,
  } = props;

  const entityNamePlural = props.entityNamePlural || `${entityName}s`
  const directory = props.directory || snakeCase(entityNamePlural)
  const arrayName = camelCase(entityNamePlural)

  const columns = props.columns.map((column) => {
    if (typeof column === 'string') {
      return {
        name: column,
      }
    } else {
      return column
    }
  })

  const [spinner, setSpinner] = useState(true)
  const [entities, setEntities] = useState([])
  const [searchText, setSearchText] = useState('')
  const [newEntityModalOpen, setNewEntityModalOpen] = useState(false)

  const mappedChildren = React.Children.map(
    children,
    (child) => {
      return React.cloneElement(child, {
        entityName,
        entityNamePlural,
        callback: (entities) => { updateIndex(entities) }
      });
    }
  )

  useEffect(() => {
    fetch(`/api/${directory}`)
      .then(data => data.json())
      .then((response) => {
        setEntities(response[arrayName])
        setSpinner(false)
      })
  }, [])

  const updateIndex = (entities) => {
    setNewEntityModalOpen(false)
    setEntities(entities)
  }

  return (
    <div className="handy-component full-index">
      <h1>{ header || titleCase(entityNamePlural) }</h1>
      { includeNewButton && (
        <Button
          onClick={ () => { setNewEntityModalOpen(true) } }
          text={ addButtonText || `Add ${titleCase(entityName)}` }
          disabled={ spinner }
          float
          className="add-button"
        />
      )}
      { includeSearchBar && (
        <SearchBar
          margin={ includeNewButton }
          onChange={ (e) => { setSearchText(e.target.value) } }
          value={ searchText }
        />
      )}
      <div className="white-box">
        <GrayedOut visible={ spinner } />
        <Spinner visible={ spinner } />
        <Table
          columns={ columns }
          rows={ entities }
          searchText={ searchText }
          urlPrefix={ snakeCase(entityNamePlural) }
          alphabetize={ true }
        />
      </div>
      { includeNewButton && (
        <Modal isOpen={ newEntityModalOpen } onRequestClose={ () => { setNewEntityModalOpen(false) } } contentLabel="Modal" style={ Common.newEntityModalStyles(modalDimensions, modalRows) }>
          { mappedChildren }
        </Modal>
      ) }
    </div>
  )
}
