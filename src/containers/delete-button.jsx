import React, { useState } from 'react'
import Common from './modules/common.jsx'
import ConfirmDelete from './confirm-delete'

export default function DeleteButton(props) {
	const { styles, confirmDelete, disabled = false, entityName } = props;
	const [modalOpen, setModalOpen] = useState(false);

	return(
		<>
			<a style={ styles } className={ `${Common.renderDisabledButtonClass(disabled)}` } onClick={ () => setModalOpen(true) }>Delete</a>
			<ConfirmDelete
				isOpen={ modalOpen }
				entityName={ entityName }
				confirmDelete={ (e) => {
					setModalOpen(false)
					confirmDelete(e)
				} }
				closeModal={ () => { setModalOpen(false) } }
			/>
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
