import React from 'react'
import Button from './button.jsx'
import Modal from 'react-modal'

export default function ConfirmModal(props) {

  const {
    headerText,
    confirm,
    cancel,
    dismiss,
    isOpen,
  } = props

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={ dismiss || cancel }
        contentLabel="Modal"
        style={{
          overlay: {
            background: 'rgba(0, 0, 0, 0.50)'
          },
          content: {
            background: '#F5F6F7',
            padding: '20px 20px 30px 20px',
            margin: 'auto',
            maxWidth: 600,
            height: 146,
          },
        }}
      >
        <div className="confirm-modal text-center">
          <h1>{ headerText }</h1>
          { confirm && (
            <Button
              text="Yes"
              onClick={ confirm }
              marginRight
            />
          ) }
          { cancel && (
            <Button
              text="No"
              onClick={ cancel }
            />
          ) }
          { dismiss && (
            <Button
              text="OK"
              onClick={ dismiss }
            />
          ) }
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
