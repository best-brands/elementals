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
 * Functions that are used to mutate all stored elementals
 *
 * @returns {{add: add, getById: (function(*=, *=, *): T | null), getByName: (function(*=, *=): T | null), getAllForElement: (function(*=, *=): [*]|[]), remove: remove}}
 */
export default function() {
    return {
        getAllForElement: function(storage, name) {
            return getElementalStorage(storage, name)
        },

        getById: function(storage, name, id) {
            return getElementalStorage(storage, name).filter(function (listItem) {
                return listItem.id === id
            }).shift() || null
        },

        getByName: function(storage, name) {
            return getElementalStorage(storage, name).shift() || null
        },

        add: function(storage, name, toAdd) {
            var ElementalStorage = Object(jQuery)(storage),
                arrayMap = getElementalStorage(storage, name);

            if (arrayMap.length) {
                arrayMap.includes(toAdd) || ElementalStorage.data("elementals." . concat(name), [].concat(arrayMap, toAdd))
            } else {
                ElementalStorage.data("elementals." . concat(name), toAdd)
            }
        },

        remove: function(storage, name, toRemove) {
            var ElementalStorage = Object(jQuery)(storage),
                arrayMap = getElementalStorage(storage, name);

            if (!toRemove || 1 === arrayMap.length && arrayMap[0] === toRemove) {
                ElementalStorage.removeData("elementals." . concat(name))
            } else {
                ElementalStorage.data("elementals." . concat(name)), arrayMap.filter(function (item) {
                    return item !== toRemove
                });
            }
        }
    }
}