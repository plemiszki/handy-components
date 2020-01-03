import HandyTools from 'handy-tools'
if (!$) {
  $ = require('jquery');
}

export function fetchEntities(directory, arrayName) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: `/api/${directory}`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITIES' });
        dispatch(obj);
      }
    );
  }
}

export function fetchEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: `/api/${args.directory}/${args.id}`
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'FETCH_ENTITY' });
        dispatch(obj);
      }
    );
  }
}

export function updateEntity(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'PATCH',
      url: `/api/${args.directory}/${args.id}`,
      data: {
        [HandyTools.convertToUnderscore(args.entityName)]: HandyTools.convertObjectKeysToUnderscore(args.entity)
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'UPDATE_ENTITY' });
        dispatch(obj);
      },
      (response) => dispatch({
        type: 'ERRORS',
        errors: response
      })
    );
  }
}

export function deleteEntity(args) {
  let { directory, id, callback } = args;
  return (dispatch) => {
    return $.ajax({
      method: 'DELETE',
      url: `/api/${directory}/${id}`
    }).then(
      (response) => {
        if (callback) {
          callback.call({}, response);
        } else {
          let directories = window.location.pathname.split('/');
          directories.pop()
          window.location.pathname = directories.join('/');
        }
      }
    );
  }
}
