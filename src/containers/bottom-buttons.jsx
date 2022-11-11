import React from 'react';
import DeleteButton from './delete-button';
import SaveButton from './save-button';

export default function BottomButtons(props) {
  const { entityName, confirmDelete, clickSave, disabled, changesToSave, justSaved } = props;

  return (
    <div>
      <SaveButton
        justSaved={ justSaved }
        changesToSave={ changesToSave }
        disabled={ disabled }
        onClick={ () => { clickSave() } }
      />
      <DeleteButton entityName={ entityName } confirmDelete={ confirmDelete } />
    </div>
  );
}
