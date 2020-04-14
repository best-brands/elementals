import jQuery from 'jquery'

/**
 * Gets an array from the storage namespace
 *
 * @param namespace
 * @param name
 *
 * @returns {*}
 */
function getElementalStorage(namespace, name) {
    var list = Object(jQuery)(namespace).data("elementals." . concat(name));
    return list ? Array.isArray(list) ? list : [list] : []
}

/**
 * Get all elementals from a given namespace
 * @param storage
 * @param name
 * @returns {*}
 */
export function getAllForElement(storage, name) {
    return getElementalStorage(storage, name)
}

/**
 * Get elemental by processed ID from a given namespace
 * @param storage
 * @param name
 * @param id
 * @returns {*|null}
 */
export function getById(storage, name, id) {
    return getElementalStorage(storage, name).filter(function (listItem) {
        return listItem.id === id
    }).shift() || null
}

/**
 * Get elemental by name from a given namespace
 * @param storage
 * @param name
 * @returns {*|null}
 */
export function getByName(storage, name) {
    return getElementalStorage(storage, name).shift() || null
}

/**
 * Add an elemental to a given namespace
 * @param storage
 * @param name
 * @param toAdd
 */
export function add(storage, name, toAdd) {
    var ElementalStorage = Object(jQuery)(storage),
        arrayMap = getElementalStorage(storage, name);

    if (arrayMap.length) {
        arrayMap.includes(toAdd) || ElementalStorage.data("elementals." . concat(name), [] . concat(arrayMap, toAdd))
    } else {
        ElementalStorage.data("elementals." . concat(name), toAdd)
    }
}

/**
 * Remove an elemental from a given namespace
 * @param storage
 * @param name
 * @param toRemove
 */
export function remove(storage, name, toRemove) {
    var ElementalStorage = Object(jQuery)(storage),
        arrayMap = getElementalStorage(storage, name);

    if (!toRemove || 1 === arrayMap.length && arrayMap[0] === toRemove) {
        ElementalStorage.removeData("elementals." . concat(name))
    } else {
        ElementalStorage.data("elementals." . concat(name));
        arrayMap.filter(function (item) {
            return item !== toRemove
        });
    }
}
