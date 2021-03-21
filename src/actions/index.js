import HandyTools from 'handy-tools'
import $ from 'jquery'

export function sendRequest(args) {
  let { url, method, data } = args;
  let headers = getHeaders(args);
  if (data) {
    data = HandyTools.convertObjectKeysToUnderscore(data);
  }
  return (dispatch) => {
    return $.ajax({
      method: method.toUpperCase(),
      headers,
      url,
      data
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'SEND_REQUEST' });
        dispatch(obj);
      }
    );
  }
}

export function fetchEntities(args) {
  return (dispatch) => {
    return $.ajax({
      method: 'GET',
      url: `/api/${args.directory}`,
      data: {
        batch_size: args.batchSize,
        page: args.page,
        order_by: args.orderBy,
        order_direction: args.orderDir,
        search_criteria: args.searchCriteria
      }
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
  let headers = getHeaders(args);
  return (dispatch) => {
    return $.ajax({
      method: 'PATCH',
      url: `/api/${args.directory}/${args.id}`,
      headers,
      data: {
        [HandyTools.convertToUnderscore(args.entityName)]: HandyTools.convertObjectKeysToUnderscore(args.entity)
      }
    }).then(
      (response) => {
        let obj = Object.assign(response, { type: 'UPDATE_ENTITY' });
        dispatch(obj);
      },
      (response) => {
        dispatch({
          type: 'ERRORS',
          errors: response
        })
        throw 'error';  // <-- not sure why this is necessary but failure callback isn't called without it
      }
    );
  }
}

export function deleteEntity(args) {
  let { directory, id, callback } = args;
  let headers = getHeaders(args);
  return (dispatch) => {
    return $.ajax({
      method: 'DELETE',
      url: `/api/${directory}/${id}`,
      headers
    }).then(
      (response) => {
        if (callback) {
          callback.call({}, response);
        } else {
          let directories = window.location.pathname.split('/');
          directories.pop()
          window.location.pathname = directories.join('/');
        }
      },
      (response) => {
        dispatch({ deleteError: response.responseJSON, type: 'ERRORS' });
      }
    );
  }
}

let getHeaders = (args) => {
  let headers = {};
  if (args.csrfToken) {
    const csrfMetaTag = document.querySelector('meta[name="csrf-token"]');
    if (csrfMetaTag) {
      const csrfToken = csrfMetaTag.getAttribute('content');
      headers = { 'x-csrf-token': csrfToken };
    }
  }
  return headers;
}
