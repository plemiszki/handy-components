import React from 'react'

export default function ModalMessage(props) {

  const {
    memo,
    message,
  } = props

  return (
    <>
      <div className="modal-message">
        <h1>{ message }</h1>
        { memo && (<p>{ memo }</p>) }
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
  );
}
