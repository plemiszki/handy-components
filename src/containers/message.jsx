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
    return(
      <div className={ `message-box${ color ? ` ${color}` : ''}` }>
        <div className="message-close" onClick={ () => { setMessage('')} }></div>
        { lines.map((line, index) => {
          return(
            <p key={ index }>{ line }</p>
          );
        }) }
      </div>
    );
  } else {
    return null;
  }
}
