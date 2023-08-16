import { parseUrl } from './extract'
import { snakeCase } from 'change-case'
import { convertObjectKeysToUnderscore, stringifyJSONFields } from './convert'

const validateArgs = ({ args, requiredArgs, prefix }) => {
    requiredArgs.forEach(requiredArg => {
        if (!Object.keys(args).includes(requiredArg)) {
            throw prefix ? `${prefix} - ${requiredArg} missing` : `${requiredArg} missing`;
        }
    })
}

export const sendRequest = (url, args = {}) => {
    const { method = 'GET', data } = args;
    let fetchArgs = { method };
    if (method === 'GET' && data) {
        url = `${url}?${new URLSearchParams(convertObjectKeysToUnderscore(data))}`;
    }
    if (method !== 'GET') {
        const headers = {
            'x-csrf-token': getCsrfToken(),
            'Content-Type': 'application/json',
        }
        fetchArgs = { ...fetchArgs, headers }
        if (data) {
            fetchArgs = { ...fetchArgs, body: JSON.stringify(convertObjectKeysToUnderscore(data)) }
        }
    }
    return fetch(url, fetchArgs).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
            return Promise.reject(payload);
        }
        return Promise.resolve(payload);
    })
}

export const fetchEntity = (args = {}) => {
    const {
        directory = parseUrl()[1],
        id = parseUrl()[0],
    } = args;
    return fetch(`/api/${directory}/${id}`).then(data => data.json())
}

export const fetchEntities = (args = {}) => {
    const {
        directory = parseUrl()[0],
        data,
    } = args;
    let url = `/api/${directory}`;
    if (data) {
        url = `${url}?${new URLSearchParams(convertObjectKeysToUnderscore(data))}`
    }
    return fetch(url).then(data => data.json())
}

export const createEntity = (args = {}) => {
    const {
        directory = parseUrl()[0],
        entityName,
        entity,
        additionalData,
    } = args;
    validateArgs({ args, requiredArgs: ['entityName', 'entity', 'directory'], prefix: 'create entity' });
    const csrfToken = getCsrfToken();
    const body = {
        [snakeCase(entityName)]: convertObjectKeysToUnderscore(entity),
    }
    if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
            Object.assign(body, {
                [snakeCase(key)]: convertObjectKeysToUnderscore(additionalData[key]),
            });
        })
    }
    return fetch(`/api/${directory}`, {
        method: 'POST',
        headers: {
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
        additionalData,
        jsonFieldsToConvert = [],
    } = args;
    let { entity } = args;

    if (!directory) {
        throw 'update entity - missing directory'
    }

    if (jsonFieldsToConvert) {
        jsonFieldsToConvert.forEach((field) => {
            let obj = entity[field];
            obj = convertObjectKeysToUnderscore(obj);
            entity[field] = obj;
        });
        entity = stringifyJSONFields({ entity, jsonFields: jsonFieldsToConvert });
    }

    const csrfToken = getCsrfToken();
    const body = {
        [snakeCase(entityName)]: convertObjectKeysToUnderscore(entity),
    }
    if (additionalData) {
        Object.keys(additionalData).forEach((key) => {
            Object.assign(body, {
                [snakeCase(key)]: convertObjectKeysToUnderscore(additionalData[key]),
            });
        })
    }
    return fetch(`/api/${directory}/${id}`, {
        method: 'PUT',
        headers: {
            'x-csrf-token': csrfToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
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
    }).then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
            return Promise.reject(payload);
        }
        return Promise.resolve(payload);
    })
}

export const getCsrfToken = () => {
    const metaTag = document.querySelector('meta[name="csrf-token"]')
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    return null;
}
