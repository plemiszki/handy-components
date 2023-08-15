import React from 'react'
import { noCase } from 'change-case'
import Button from './button.jsx'
import Modal from 'react-modal'

const deleteModalStyles = {
	overlay: {
		background: 'rgba(0, 0, 0, 0.50)'
	},
	content: {
		background: '#FFFFFF',
		margin: 'auto',
		maxWidth: 540,
		height: 207,
		border: 'solid 1px red',
		borderRadius: '6px',
		textAlign: 'center',
		color: '#5F5F5F',
		paddingTop: '36px'
	}
};

export default function ConfirmDelete(props) {

  const {
    closeModal,
    confirmDelete,
    entityName,
    isOpen,
  } = props

  return (
    <>
      <Modal isOpen={ isOpen } onRequestClose={ closeModal } contentLabel="Modal" style={ deleteModalStyles }>
        <div className="confirm-delete">
          <h1>Are you sure you want to permanently delete this { noCase(entityName) }&#63;</h1>
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
      </Modal>
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
