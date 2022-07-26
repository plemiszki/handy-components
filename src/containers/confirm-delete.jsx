import React from 'react'
import ChangeCase from 'change-case'

export default function ConfirmDelete(props) {

  const {
    closeModal,
    confirmDelete,
    entityName,
  } = props

  return(
    <div className="confirm-delete">
      <h1>Are you sure you want to permanently delete this { ChangeCase.noCase(entityName) }&#63;</h1>
      <a className="btn red-button" onClick={ confirmDelete }>
        Yes
      </a>
      <a className="btn" onClick={ closeModal }>
        No
      </a>
    </div>
  )
}
