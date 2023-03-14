import React, { useState, useEffect } from 'react'

export default function Message() {

  const [message, setMessage] = useState('')
  const [color, setColor] = useState('')

  useEffect(() => {
    const storedMessage = localStorage.getItem('message');
    if (storedMessage) {
      setMessage(storedMessage)
      setColor(localStorage.getItem('message-color'))
      localStorage.removeItem('message')
      localStorage.removeItem('message-color')
    }
  }, [])

  if (message) {
    const lines = message.split("\n");
    return (
      <>
        <div className={ `message-box${ color ? ` ${color}` : ''}` }>
          <div className="message-close" onClick={ () => { setMessage('')} }></div>
          { lines.map((line, index) => {
            return(
              <p key={ index }>{ line }</p>
            );
          }) }
        </div>
        <style jsx>{`
          .message-box {
            position: relative;
            background: #FFFFFF;
            padding: 18px 16px;
            border-radius: 6px;
            box-shadow: 1px 2px 3px 0px #E6E9EC;
            margin-bottom: 30px
          }
          .green {
            background-color: #00C79F;
            box-shadow: 1px 2px 3px 0px #A9A9A9
          }
          .light-green {
            background-color: #A9F5A9;
            box-shadow: 1px 2px 3px 0px #A9A9A9
          }
          .yellow {
            background-color: #F2F5A9;
            box-shadow: 1px 2px 3px 0px #A9A9A9
          }
          .red {
            background-color: #FA5858;
            box-shadow: 1px 2px 3px 0px #A9A9A9
          }
          .message-box .message-close {
            position: absolute;
            right: 16px;
            width: 17px;
            height: 17px;
            cursor: pointer;
            background-size: 17px;
            background-position: 50%;
            background-repeat: no-repeat
          }
          .message-box p:first-of-type {
              font-family: 'TeachableSans-SemiBold'
          }
          .message-box p:not(:last-of-type) {
              margin-bottom: 5px
          }
        `}</style>
      </>
    );
  } else {
    return null;
  }
}
