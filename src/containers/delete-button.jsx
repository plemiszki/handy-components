import React from 'react'
import Common from './modules/common.jsx'

export default function DeleteButton(props) {
	const { styles, onClick, disabled = false } = props;

	return(
		<>
			<a style={ styles } className={ `${Common.renderDisabledButtonClass(disabled)}` } onClick={ () => onClick() }>Delete</a>
			<style jsx>{`
				a {
						float: right;
						color: #E9563D;
						background-color: white;
						border: solid 0.5px #E9563D;
						font-family: 'TeachableSans-Medium';
						border-radius: 100px;
						padding: 15px 40px;
						font-size: 12px;
						cursor: pointer;
				}
				a:hover {
						color: #E9563D;
						background-color: #FBDDD8;
						user-select: none;
				}
				a.disabled {
						pointer-events: none;
						opacity: 0.65;
				}
			`}</style>
		</>
	);
}
