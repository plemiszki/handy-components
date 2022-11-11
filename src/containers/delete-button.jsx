import React, { useState } from 'react'
import Common from './modules/common.jsx'
import Modal from 'react-modal'
import ConfirmDelete from './confirm-delete'

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

export default function DeleteButton(props) {
	const { styles, confirmDelete, disabled = false, entityName } = props;
	const [modalOpen, setModalOpen] = useState(false);

	return(
		<>
			<a style={ styles } className={ `${Common.renderDisabledButtonClass(disabled)}` } onClick={ () => setModalOpen(true) }>Delete</a>
			<Modal isOpen={ modalOpen } onRequestClose={ () => { setModalOpen(false) } } contentLabel="Modal" style={ deleteModalStyles }>
				<ConfirmDelete
					entityName={ entityName }
					confirmDelete={ (e) => {
						setModalOpen(false)
						confirmDelete(e)
					} }
					closeModal={ () => { setModalOpen(false) } }
				/>
			</Modal>
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
