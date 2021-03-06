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
    let elemStore = storage.get(element);
    return (elemStore) ? elemStore.get(key) : null;
}

/**
 * Get everything of an element
 * @returns {Map|undefined}
 */
export function getAll(elem) {
    return storage.get(elem);
}

/**
 * Check if something exists in our data store
 * @param element
 * @param key
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
    let ret = storage.get(element).delete(key);
    if (storage.get(element).size === 0) {
        storage.delete(element);
    }
    return ret;
}

/**
 * Remove an entire WeakMap key
 * todo: refactor to have remove with a default undefined `key`
 * @param element
 */
export function removeAll(element) {
    let map = storage.get(element)
    if (map) {
        map.clear();
        storage.delete(element);
    }
}