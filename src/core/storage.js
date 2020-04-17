var storage = new WeakMap();

/**
 * Put something into our data store
 * @param element
 * @param key
 * @param obj
 */
export function put(element, key, obj) {
    if (!storage.has(element)) {
        storage.set(element, new Map());
    }
    storage.get(element).set(key, obj);
}

/**
 * Get something from our data store
 * @param element
 * @param key
 * @returns {*}
 */
export function get(element, key) {
    var elemStore = storage.get(element);
    return (elemStore) ? elemStore.get(key) : null;
}

/**
 * Check if something exists in our data store
 *
 * @param element
 * @param key
 *
 * @returns {boolean|*}
 */
export function has(element, key) {
    return storage.has(element) && storage.get(element).has(key);
}

/**
 * Remove something from our data store
 * @param element
 * @param key
 * @returns {boolean | void | Promise<boolean> | IDBRequest<undefined>}
 */
export function remove(element, key) {
    var ret = storage.get(element).delete(key);
    if (!storage.get(element).size === 0) {
        storage.delete(element);
    }
    return ret;
}