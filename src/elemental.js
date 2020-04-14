import {default as Events} from './core/events.js';
import {default as Collection} from './core/collection.js';
import jQuery from "jquery";

/**
 * Check the arguments of a component we are going to initialize
 *
 * @param name
 * @param factory
 * @param defaults
 */

function checkArguments (name, factory, defaults) {
    if ("string" != typeof name) throw new Error("Create elemental: elemental name should be a non empty string");
    if ("function" != typeof factory) throw new Error("Create elemental: elemental factory should be a function");
    if ("object" !== typeof(defaults) && defaults) throw new Error("Create elemental: default options should be an object if defined")
}

/**
 * Create elemental object
 *
 * @param elementalName
 * @param jElem
 * @param jqElem
 */
function createElementalObject(elementalName, jElem, jqElem) {
    var eventSubscription = Events.getClient();

    return {
        name: elementalName,
        el: jElem,
        $el: jqElem,
        destroy: function () {
            eventSubscription.unsubscribeAll();
            jqElem.removeData("elementals.".concat(elementalName));
            jqElem.off(".".concat(elementalName));
        },
        pubSubClient: eventSubscription
    }
}

/**
 * Internal, extendable class for instantiating components.
 * Each component should contain functionality for a single DOM element or selector.
 *
 * @param name
 * @param factory
 * @param defaults
 */
export default function (name, factory, defaults) {
    return checkArguments, function (elementalNameSpace, elementalFactory) {
        var mapped = Object(jQuery)(elementalNameSpace).toArray().map(function (javascriptContext) {
            var jQueryContext = Object(jQuery)(javascriptContext),
                elementalContext = createElementalObject(name, javascriptContext, jQueryContext),
                extendjQueryFunction = function (elementalProperties, elementalJQueryContext) {
                    return jQuery.extend({}, elementalProperties, elementalJQueryContext)
                }(defaults, elementalFactory);
            try {
                var initializedElemental = factory(elementalContext, extendjQueryFunction) || {};
                return Object(Collection)().add(javascriptContext, name, initializedElemental), initializedElemental
            } catch (error) {
                throw error
            }
        });

        return 1 === mapped.length ? mapped.shift() : mapped
    }
}