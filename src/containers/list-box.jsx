import React from 'react'

export default function ListBox(props) {
	const { list, clickDelete, styles, textFunc } = props

	return (
    <>
      <ul style={ styles }>
        { list.map((entity) => {
          return (
            <li key={ entity.id }>{ textFunc(entity) }<div className="x-gray-circle" onClick={ () => { clickDelete(entity) } }></div></li>
          );
        }) }
      </ul>
      <style jsx>{`
        ul {
          border: 1px solid #E4E9ED;
          border-radius: 5px;
          padding: 15px;
        }
        li {
          position: relative;
        }
        li:not(:last-of-type) {
          margin-bottom: 15px;
        }
        .x-gray-circle {
          display: inline-block;
          position: absolute;
          right: 0;
          background-size: contain;
          width: 17px;
          height: 17px;
          cursor: pointer;
        }
      `}</style>
    </>
	);
}
