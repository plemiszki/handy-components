import React, { useState } from 'react'
import Index from './modules/index.js'
import { alphabetizeArrayOfObjects } from './utils/sort.js'
import SearchBar from './search-bar.jsx'
import Modal from 'react-modal'

const modalStyles = {
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

export default function ModalSelect(props) {

  const {
    func,
    noneOption,
    options,
    property,
    isOpen,
    onClose,
  } = props

  const [searchText, setSearchText] = useState('')
  const filteredOptions = Index.filterSearchText({ entities: options, text: searchText, property })

  return (
    <>
      <Modal isOpen={ isOpen } onRequestClose={ onClose.bind(this) } style={ modalStyles }>
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
          <ul>
            { noneOption && (
              <li
                onClick={ () => {
                  setSearchText('');
                  func(option);
                } }
                data-id={ null }
                data-type={ null }
              >
                (None)
              </li>
            ) }
            { alphabetizeArrayOfObjects(filteredOptions, property).map((option, index) => {
              return (
                <li
                  key={ index }
                  onClick={ () => {
                    setSearchText('');
                    func(option);
                  } }
                  data-id={ option.id }
                  data-type={ option.itemType }
                >
                  { option[property] }
                </li>
              )
            }) }
          </ul>
        </div>
      </Modal>
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
