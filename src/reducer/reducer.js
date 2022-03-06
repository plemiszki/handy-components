const standardReducer = function(state = {}, action) {
  switch (action.type) {
  case 'SEND_REQUEST':
  case 'FETCH_ENTITIES':
  case 'NEW_ENTITY_DATA':
  case 'CREATE_ENTITY':
  case 'FETCH_ENTITY':
  case 'UPDATE_ENTITY':
  case 'DELETE_ENTITY':
  case 'ERRORS':
    if (action.errors && action.errors.responseJSON) {
      return Object.assign({}, state, {
        errors: action.errors.responseJSON
      });
    } else {
      delete action["type"]
      return Object.assign({}, state, action);
    }
  default:
    return state;
  }
}

export default standardReducer;
