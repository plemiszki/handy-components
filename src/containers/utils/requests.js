import { parseUrl } from './extract'
import { snakeCase } from 'change-case'
import { convertObjectKeysToUnderscore } from './convert'

export const fetchEntity = (args = {}) => {
    const {
        directory = parseUrl()[1],
        id = parseUrl()[0],
    } = args;
    return fetch(`/api/${directory}/${id}`).then(data => data.json())
}

export const createEntity = (args = {}) => {
    const {
        directory,
        entityName,
        entity,
    } = args;
    const csrfToken = getCsrfToken();
    return fetch(`/api/${directory}`, {
        method: 'POST',
        headers: {
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [snakeCase(entityName)]: convertObjectKeysToUnderscore(entity) })
    }).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
            return Promise.reject(payload);
        }
        return Promise.resolve(payload);
    })
}

export const updateEntity = (args = {}) => {
    const {
        id = parseUrl()[0],
        directory = parseUrl()[1],
        entityName,
        entity,
    } = args;
    const csrfToken = getCsrfToken();
    return fetch(`/api/${directory}/${id}`, {
        method: 'PUT',
        headers: {
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [snakeCase(entityName)]: convertObjectKeysToUnderscore(entity) })
    }).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
            return Promise.reject(payload);
        }
        return Promise.resolve(payload);
    })
}

export const deleteEntity = (args = {}) => {
    const {
        id = parseUrl()[0],
        directory = parseUrl()[1],
    } = args;
    const csrfToken = getCsrfToken();
    return fetch(`/api/${directory}/${id}`, {
        method: 'DELETE',
        headers: {
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
        },
    }).then(data => data.json())
}

const getCsrfToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    return null;
}
