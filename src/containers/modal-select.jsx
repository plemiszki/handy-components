import React, { useState } from 'react'
import Index from './modules/index.js'
import { alphabetizeArrayOfObjects } from './utils/sort.js'
import SearchBar from './search-bar.jsx'

export default function ModalSelect(props) {

  const {
    func,
    noneOption,
    options,
    property,
  } = props

  const [searchText, setSearchText] = useState('')

  const filteredOptions = Index.filterSearchText({ entities: options, text: searchText, property })

  return (
    <>
      <div className="modal-select handy-component">
        <SearchBar
          onChange={ (e) => { setSearchText(e.target.value) } }
          value={ searchText }
          style={
            {
              float: 'none',
              width: '100%',
              marginBottom: 10,
            }
          }
        />
        <ul className="licensor-modal-list">
          { noneOption && (
            <li onClick={ func } data-id={ null } data-type={ null }>(None)</li>
          ) }
          { alphabetizeArrayOfObjects(filteredOptions, property).map((option, index) => {
            return (
              <li key={ index } onClick={ () => { func(option) } } data-id={ option.id } data-type={ option.itemType }>{ option[property] }</li>
            )
          }) }
        </ul>
      </div>
      <style jsx>{`
        li {
          line-height: 17px;
          cursor: pointer;
          padding: 10px;
          border: solid 1px #5F5F5F;
          border-radius: 6px;
          user-select: none;
          margin-bottom: 10px;
        }
        li:last-of-type {
          margin-bottom: 0;
        }
        li:hover {
          background-color: #F5F6F7;
        }
      `}</style>
    </>
  );
}
