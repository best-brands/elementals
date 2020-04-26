import * as Events from './core/events.js';
import * as Collection from './core/collection.js';
import * as Storage from './core/storage';
import * as DOMEvents from './core/DOMEvents';

/**
 * Check the arguments of the elemental we are going to initialize
 * @param name
 * @param factory
 * @param defaults
 */
function checkArguments(name, factory, defaults) {
    if ("string" != typeof name) throw new Error(`Create elemental: elemental name should be a non empty string`);
    if ("function" != typeof factory) throw new Error(`Create elemental: elemental factory should be a function`);
    if ("object" !== typeof(defaults) && defaults) throw new Error(`Create elemental: default options should be an object if defined`);
}

/**
 * Adds a garbage collector observer to the initialized elemental
 * @param elem
 */
function setGarbageCollector(elem) {
    let observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            let nodes = Array.from(mutation.removedNodes);
            if (nodes.indexOf(elem) > -1 || nodes.some(parent => parent.contains(elem))) {
                Storage.removeAll(elem)
                observer.disconnect();
            }
        })
    })

    observer.observe(document.body,{
        subtree: true,
        childList: true
    })
}

/**
 * Create elemental object
 * @param name
 * @param elem
 */
function createElementalObject(name, elem) {
    let eventSubscription = Events.getClient();
    if (window.MutationObserver) setGarbageCollector(elem);

    return {
        name: name,
        el: elem,
        destroy: function () {
            eventSubscription.unsubscribeAll();
            Storage.remove(elem, `elementals.${name}`);
            DOMEvents.clearEventListeners(elem);
        },
        getInstance: function (elemental) {
            return Storage.get(elem, `elementals.${elemental}`);
        },
        getInstances: function () {
            return Storage.getAll(elem);
        },
        getInstanceFromElement: function (el, elemental) {
            return Storage.get(el, `elementals.${elemental}`)
        },
        pubSubClient: eventSubscription
    }
}

/**
 * Internal, extendable class for instantiating components. Each component should contain
 * functionality for a single DOM element or selector.
 * @param name
 * @param factory
 * @param defaults
 */
export default function (name, factory, defaults) {
    checkArguments(name, factory, defaults);
    return function (elementalNameSpace, elementalFactory) {
        let mapped = ([elementalNameSpace]).map(function (elem) {
            let elemental = createElementalObject(name, elem),
                settings = {...defaults, ...elementalFactory};

            try {
                let instance = factory(elemental, settings) || {};
                Collection.add(elem, name, instance);
                return instance
            } catch (error) {
                throw error
            }
        });

        return 1 === mapped.length ? mapped.shift() : mapped
    }
}