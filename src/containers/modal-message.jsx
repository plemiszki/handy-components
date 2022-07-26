import React from 'react'

export default function ModalMessage(props) {

  const {
    memo,
    message,
  } = props

  return(
    <div className="modal-message">
      <h1>{ message }</h1>
      { memo && (<p>{ memo }</p>) }
    </div>
  )
}
