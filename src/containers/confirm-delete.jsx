import React from 'react'
import ChangeCase from 'change-case'
import Button from './button.jsx'

export default function ConfirmDelete(props) {

  const {
    closeModal,
    confirmDelete,
    entityName,
  } = props

  return (
    <>
      <div className="confirm-delete">
        <h1>Are you sure you want to permanently delete this { ChangeCase.noCase(entityName) }&#63;</h1>
        <Button
          text="Yes"
          onClick={ confirmDelete }
          style={
            {
              backgroundColor: '#B40404',
              marginRight: 40,
            }
          }
          hoverColor="red"
        />
        <Button
          text="No"
          onClick={ closeModal }
        />
      </div>
      <style jsx>{`
        h1 {
          color: #2C2F33;
          font-family: 'TeachableSans-SemiBold';
          font-size: 20px;
          line-height: 27px;
          margin: auto;
          margin-bottom: 30px;
        }
      `}</style>
    </>
  )
}
