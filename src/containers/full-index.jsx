import React, { useState, useEffect } from 'react'
import Modal from 'react-modal'
import ChangeCase from 'change-case'
import { orderBy } from 'lodash'
import Common from './modules/common.jsx'
import Index from './modules/index.js'
import { ellipsis } from './utils/convert.js'
import { commonSort } from './utils/sort.js'

export default function FullIndex(props) {

  const {
    children,
    entityName,
    header,
    includeHover,
    includeLinks,
    includeNewButton,
    modalDimensions,
    modalRows,
  } = props;

  const entityNamePlural = props.entityNamePlural || `${entityName}s`
  const directory = props.directory || ChangeCase.snakeCase(entityNamePlural)
  const arrayName = ChangeCase.camelCase(entityNamePlural)

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
  const [searchColumn, setSearchColumn] = useState(columns[0])
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

  const columnWidth = (column) => {
    if (column.width) {
      return {
        minWidth: +column.width
      }
    }
  }

  const standardIndexSort = (entity) => {
    const searchProperty = searchColumn.sortColumn || searchColumn.name
    return commonSort(searchProperty, entity)
  }

  const renderValue = (value, column) => {
    if (column.ellipsis) {
      return ellipsis(value, column.ellipsis)
    } else {
      return value
    }
  }

  let componentClasses = ["component"]
  if (includeLinks) {
    componentClasses.push("include-links")
  }
  if (includeHover) {
    componentClasses.push("include-hover")
  }

  let filteredEntities = Index.filterSearchText({
    entities,
    text: searchText,
    property: searchColumn.name
  })

  return(
    <div className={ componentClasses.join(" ") }>
      <h1>{ header || ChangeCase.titleCase(entityNamePlural) }</h1>
      { includeNewButton && (
        <a
          className={ "btn float-button" + Common.renderDisabledButtonClass(spinner) }
          onClick={ () => { setNewEntityModalOpen(true) } }
        >Add { ChangeCase.titleCase(entityName) }</a>
      )}
      <input
        className={ `search-box${includeNewButton ? ' margin' : ''}` }
        onChange={ (e) => { setSearchText(e.target.value) } }
        value={ searchText }
      />
      <div className="white-box">
        { Common.renderGrayedOut(spinner, -36, -32, 5) }
        { Common.renderSpinner(spinner) }
        <div className="horizontal-scroll">
          <table className="admin-table sortable">
            <thead>
              <tr>
                { columns.map((column, index) => {
                  return(
                    <th key={ index } style={ columnWidth(column) }>
                      <div
                        className={ Index.sortClass(column.name, searchColumn) }
                        onClick={ () => { setSearchColumn(column) } }
                      >
                        { column.header || ChangeCase.titleCase(column.name) }
                      </div>
                    </th>
                  )
                }) }
              </tr>
            </thead>
            <tbody>
              <tr>
                { columns.map((_, index) => {
                  return(
                    <td key={ index }></td>
                  )
                }) }
              </tr>
              { orderBy(
                filteredEntities,
                [standardIndexSort.bind(this)],
                (searchColumn.sortDir || 'asc'),
              ).map((entity, index) => {
                  return(
                    <tr key={ index }>
                      { columns.map((column, index) => {
                        if (includeLinks) {
                          return(
                            <td key={ index } className={ column.classes || '' }>
                              <a href={ `${directory}/${entity.id}${column.links || ''}` }>
                                { renderValue(entity[column.name], index) }
                              </a>
                            </td>
                          );
                        } else {
                          return(
                            <td key={ index } className={ column.classes || '' }>
                              <div className="link-padding">
                                { renderValue(entity[column.name], index) }
                              </div>
                            </td>
                          );
                        }
                      }) }
                    </tr>
                  )
                }) }
            </tbody>
          </table>
        </div>
      </div>
      { includeNewButton && (
        <Modal isOpen={ newEntityModalOpen } onRequestClose={ () => { setNewEntityModalOpen(false) } } contentLabel="Modal" style={ Common.newEntityModalStyles(modalDimensions, modalRows) }>
          { mappedChildren }
        </Modal>
      ) }
    </div>
  )
}
