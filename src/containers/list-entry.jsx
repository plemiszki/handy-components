import React from 'react'

export default function ListEntry(props) {
	const { id, text, clickDelete } = props

	return (
    <>
      <li>
        { text }
        <div className="x-gray-circle" onClick={ () => { clickDelete(id) } }></div>
      </li>
      <style jsx>{`
        li {
          position: relative;
          border: 1px solid #E4E9ED;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .x-gray-circle {
          display: inline-block;
          position: absolute;
          right: 15px;
          background-size: contain;
          width: 17px;
          height: 17px;
          cursor: pointer;
        }
      `}</style>
    </>
	);
}
