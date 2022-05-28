export function storageSet(key, value) {
    if (!key || !value)
        return new Error('Missing parameters.')
    return localStorage.setItem(key, value)
}

export function storageGet(key) {
    if (!key)
        return new Error('Missing parameters.')
    return localStorage.getItem(key)
}