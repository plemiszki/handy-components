import React from 'react';
import DeleteButton from './delete-button';
import SaveButton from './save-button';

export default function BottomButtons(props) {
  const {
    entityName,
    confirmDelete,
    clickSave,
    disabled,
    changesToSave,
    justSaved,
    marginBottom = false,
    children,
  } = props;

  return (
    <div>
      <SaveButton
        justSaved={ justSaved }
        changesToSave={ changesToSave }
        disabled={ disabled }
        onClick={ () => { clickSave() } }
        marginBottom={ marginBottom }
      />
      <DeleteButton entityName={ entityName } confirmDelete={ confirmDelete } />
      { children }
    </div>
  );
}
