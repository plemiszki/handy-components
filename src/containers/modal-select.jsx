import React, { useState, useEffect } from 'react'
import Index from './modules/index.js'
import HandyTools from 'handy-tools'

export default function ModalSelect(props) {

  const {
    func,
    noneOption,
    options,
    property,
  } = props

  const [searchText, setSearchText] = useState('')

  const filteredOptions = Index.filterSearchText({ entities: options, text: searchText, property })

  return(
    <div className="modal-select handy-component">
      <input className="search-box" onChange={ (e) => { setSearchText(e.target.value) } } value={ searchText } data-field="searchText" />
      <ul className="licensor-modal-list">
        { noneOption && (
          <li onClick={ func } data-id={ null } data-type={ null }>(None)</li>
        ) }
        { HandyTools.alphabetizeArrayOfObjects(filteredOptions, property).map((option, index) => {
          return(
            <li key={ index } onClick={ () => { func(option) } } data-id={ option.id } data-type={ option.itemType }>{ option[property] }</li>
          )
        }) }
      </ul>
    </div>
  )
}
