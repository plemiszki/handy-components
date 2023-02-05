import React from 'react'
import Button from './button.jsx'

export default function SaveButton(props) {
	const { onClick, disabled, changesToSave, justSaved, marginBottom = false } = props

	return (
		<Button
			style={ { width: '165px' } }
			onClick={ onClick }
			disabled={ disabled || !changesToSave }
			text={ changesToSave ? 'Save' : (justSaved ? 'Saved' : 'No Changes') }
			marginBottom={ marginBottom }
		/>
	);
}
