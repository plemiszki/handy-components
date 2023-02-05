import React from 'react'
import Button from './button.jsx'
import Modal from 'react-modal'

export default function ConfirmModal(props) {

  const {
    headerText,
    confirm,
    cancel,
    isOpen,
  } = props

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={ cancel }
        contentLabel="Modal"
        style={{
          overlay: {
            background: 'rgba(0, 0, 0, 0.50)'
          },
          content: {
            background: '#F5F6F7',
            padding: '20px 20px 35px 20px',
            margin: 'auto',
            maxWidth: 600,
            height: 151,
          },
        }}
      >
        <div className="confirm-modal text-center">
          <h1>{ headerText }</h1>
          <Button
            text="Yes"
            onClick={ confirm }
            marginRight
          />
          <Button
            text="No"
            onClick={ cancel }
          />
        </div>
      </Modal>
      <style jsx>{`
        h1 {
          color: #2C2F33;
          font-family: 'TeachableSans-SemiBold';
          font-size: 20px;
          line-height: 27px;
          margin-bottom: 20px;
        }
      `}</style>
    </>
  );
}
