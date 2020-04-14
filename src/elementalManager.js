// Available to all elementals
import {default as elemental} from './elemental';
import {default as Collection} from './core/collection';
import * as ResponsiveController from './core/responsiveController';
import {default as Events} from './core/events';
import * as toolkit from './core/toolkit';
import jQuery from 'jquery';

var elementalDataTag = 'data-elemental',
    elementalStorage = Collection,
    elementalDestroyedEvent = "instance destroyed",
    elementalPausedEvent = "instance paused";

// Responsive wrapper to which elementals should oblige
var responsiveElemental = Object(elemental)("responsiveController", function (name, settings) {
    var elemental,
        subscription,
        paused = false;

    /**
     * Get the requested elemental
     */
    function getElemental()
    {
        if (elemental) return;

        // Initialize the elemental
        elemental = settings.elemental(name.$el, settings.elementalOptions);
        if (!elemental || elemental instanceof jQuery)
            elemental = name.$el.data(`elementals.${settings.elementalName}`);

        if (elemental)
            elemental.id = settings.id;
        else
            console.debug(`Expected instance of ${settings.elementalName} is not available.`);
    }

    /**
     * Check if active on the current viewport
     *
     * @returns {boolean}
     */
    function isViewportActive()
    {
        var viewport = Object(ResponsiveController.getViewport)();
        if (void 0 === settings.isActiveOn) return false;
        return -1 !== settings.isActiveOn.indexOf(viewport)
    }

    /**
     * Bootstrap the manager
     * @returns {*}
     */
    function bootstrapper() {
        if (!isViewportActive()) {
            // If we dont have a elemental or its paused, return
            if (!elemental || paused) return;

            // Try pausing the elemental
            if (elemental.pause) try {
                paused = true, elemental.pause();
            } catch (error) {
                console.debug(`An error occurred attempting to pause elemental: ${settings.elementalName}`);
                console.debug(error);
            } else {
                console.debug(`Unable to pause ${settings.elementalName}, it will remain active across breakpoints as it doesnt have a breakpoint.`);
            }
        } else {
            // If elemental is false, we get the elemental
            if (!paused) return void getElemental();

            // We have retrieved the elemental, now try resuming it
            if (elemental.resume) try {
                // Resume elemental and set paused to false
                paused = false;
                elemental.resume();
            } catch (error) {
                console.debug(`An error occurred attempting to resume elemental: ${settings.elementalName}`);
            } else {
                console.debug(`Unable to resume ${settings.elementalName}, elemental has not implemented a "resume" method.`);
            }
        }
    }

    // Callable that will be passed to the elementals data
    function cleanElemental(publishData) {
        elemental === publishData.instance && (Events.unsubscribe(subscription),
            elemental = void 0,
            paused = false
        )
    }

    // Subscribe to event
    subscription = Events.subscribe(Events, ResponsiveController.default, bootstrapper);

    // Subscribe once with the elemental name on event instance destroyed, we should clean the elemental then
    Events.subscribeOnce(name.el, "instance destroyed", cleanElemental);

    // Bootstrap
    bootstrapper();
});

/**
 * Parse the Json present in a elemental
 *
 * @param elementalConfig
 *
 * @returns {{isValid: boolean, error: *, results: *}|{isValid: boolean, results: any[]}}
 */
function parseElementalJson(elementalConfig) {
    try {
        var parsedContent = JSON.parse(elementalConfig);
        return {
            results: Array.isArray(parsedContent) ? parsedContent : [parsedContent],
            isValid: true
        }
    } catch (error) {
        return {
            results: elementalConfig,
            error: error,
            isValid: false
        }
    }
}

/**
 * Attempt to parse the elemental by tag
 *
 * @param elemental
 *
 * @returns {(*|any[])|{name: string}[]}
 */
function parseElemental(elemental) {
    var elementalConfig = elemental.getAttribute(elementalDataTag);

    // Check if its JSON, if so, we will parse it separately
    if (elementalConfig.includes("[")
        || elementalConfig.includes("]")
        || elementalConfig.includes("{")
        || elementalConfig.includes("}")
    ) {
        var config = parseElementalJson(elementalConfig),
            results = config.results,
            errors = config.error;

        if (config.isValid) return results;

        console.debug(errors);

        // elemental doesn't have any configuration, so we should just map it space separated
    } else {
        return elementalConfig.split(" ").map(function (elementalName) {
            return {
                name: elementalName.trim()
            }
        })
    }
}

/**
 * Set the elemental data
 *
 * @param elemental
 * @param key
 * @param value
 */
function setElementalData(elemental, key, value) {
    if (key in elemental) {
        Object.defineProperty(elemental, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        })
    } else {
        elemental[key] = value
    }

    return elemental;
}

/**
 * Update the Json from the elemental
 *
 * @param elemental
 *
 * @returns {*}
 */
function updateElementalJson(elemental) {
    for (var argumentCount = 1; argumentCount < arguments.length; argumentCount++) {
        var elementalConfig = null != arguments[argumentCount] ? arguments[argumentCount] : {},
            configEntries = Object.keys(elementalConfig);

        "function" == typeof Object.getOwnPropertySymbols && (configEntries = configEntries.concat(Object.getOwnPropertySymbols(elementalConfig).filter(function (configKey) {
            return Object.getOwnPropertyDescriptor(elementalConfig, configKey).enumerable
        }))), configEntries.forEach(function (key) {
            setElementalData(elemental, key, elementalConfig[key])
        })
    }
    return elemental
}

/**
 * Get options to configure the elemental with
 *
 * @param config
 * @param elemental
 * @param elementalId
 *
 * @returns {{elementalOptions: *, elemental: *, elementalName: *, id: *, isActiveOn: *}}
 */
function getOptionsForConfig(config, elemental, elementalId) {
    return {
        isActiveOn: config.isActiveOn,
        elementalName: config.name,
        elemental: elemental,
        elementalOptions:
        config.options,
        id: elementalId
    }
}

/**
 * Check if elemental is of function type
 *
 * @param name
 * @param config
 * @param initialised
 *
 * @returns {boolean}
 */
function elementalIsFunction(name, config, initialised) {
    return "function" == typeof initialised.elemental
}

/**
 * Check if variable is a function
 *
 * @param variable
 *
 * @returns {boolean}
 */
function isFunction(variable) {
    return "function" == typeof variable
}

/**
 * Get the elemental config property
 *
 * @param elemental
 *
 * @returns {{elemental: *, getOptionsForConfig: (function(*, *=, *=): {elementalOptions: *, elemental: *, elementalName: *, id: *, isActiveOn: *}), configProperty: string, resultFilter: *}}
 */
function getElementalConfigProperty(elemental) {
    return [{
        configProperty: "isActiveOn",
        getOptionsForConfig: getOptionsForConfig,
        elemental: responsiveElemental,
        resultFilter: elementalIsFunction
    }].filter(function (row) {
        return elemental[row.configProperty]
    }).shift()
}

/**
 * Get elementals by tag
 *
 * @param context
 *
 * @returns {*}
 */
function getElementalsInContext(context) {
    return Object(toolkit.selectAll)("[" . concat(elementalDataTag, "]"), context)
}

/**
 * Pause an elemental
 *
 * @param elemental
 * @param name
 * @param responsiveElemental
 */
function pauseElemental(elemental, name, responsiveElemental)
{
    try {
        responsiveElemental.pause(),
            Events.publish(elemental, elementalPausedEvent, {
                instance: responsiveElemental
            })
    } catch (e) {
        console.log(`A error occurred attempting to pause elemental: ${name}`)
    }
}

/**
 * Destroy a elemental
 *
 * @param elemental
 * @param name
 * @param responsiveElemental
 */
function destroyElemental(elemental, name, responsiveElemental)
{
    // Trigger destroy function
    responsiveElemental.destroy();

    // Publish deletion event
    Events.publish(elemental, elementalDestroyedEvent, {instance: responsiveElemental});

    // Remove from our storage
    elementalStorage.remove(elemental, name, responsiveElemental);
}

/**
 * Resume a elemental
 *
 * @param obj
 * @param elemental
 * @returns {*}
 */
function resumeElemental(obj, elemental)
{
    try {
        obj.resume();
        return updateElementalJson({}, elemental, {
                processed: true
            })
        // Resuming failed, to minimize damage, disable it
    } catch (error) {
        console.log(`A error occurred attempting to resume elemental: ${elemental.name}`);
        return updateElementalJson({}, elemental, {
            processed: false
        })
    }
}

/**
 * Creates an elemental
 *
 * @param config
 * @param tag
 * @param options
 * @param id
 */
function createElemental(config, tag, options, id)
{
    var namespace = config(Object(jQuery)(tag), options);
    namespace && (namespace.id = id);
}

/**
 * Destroy a responsive elemental
 *
 * @param elemental
 * @param settings
 * @returns {*}
 */
function destroyResponsiveElemental(elemental, settings)
{
    // Get the responsively wrapped elemental
    var responsiveElemental = elementalStorage.getById(elemental, settings.name, settings.id);

    // If it doesnt exits, just exit
    if (!responsiveElemental) return settings;

    // Try to destroy the elemental
    if (responsiveElemental.destroy)
    {
        destroyElemental(elemental, settings.name, responsiveElemental);
        return updateElementalJson({}, settings, {
            processed: void 0
        });
    }

    // Try to pause the elemental
    if (responsiveElemental.pause)
    {
        pauseElemental(elemental, settings.name, responsiveElemental);
        return updateElementalJson({}, settings, {
            processed: void 0
        });
    }

    // Unable to pause or destroy, so just return the settings
    return (settings);
}

/**
 * Clean up a elemental
 *
 * @param elemental
 */
function cleanElemental(elemental) {
    var config = parseElemental(elemental),
        newConfig = config.map(function (settings) {
            return destroyResponsiveElemental(elemental, settings);
        }),
        newJson = JSON.stringify(newConfig);

    JSON.stringify(config) !== newJson && elemental.setAttribute(elementalDataTag, newJson)
}

/**
 * Delete elemental
 *
 * @param elementals
 */
function deleteElemental(elementals) {
    try {
        var elementalConfig = JSON.parse(elementals.getAttribute(elementalDataTag));
        Array.isArray(elementalConfig) || (elementalConfig = [elementalConfig]), elementalConfig.forEach(function (elemental) {
            delete elemental.processed, delete elemental.id
        }), elementals.setAttribute(elementalDataTag, JSON.stringify(elementalConfig))
    } catch (error) {
    }
}

/**
 * Resume an elemental by ID
 *
 * @param tag
 * @param elemental
 *
 * @returns {*|undefined}
 */
function resumeElementalByID(tag, elemental)
{
    return resumeElemental(elementalStorage.getById(tag, elemental.name, elemental.id), elemental);
}

/**
 * Boot an elemental
 *
 * @param config
 * @param tag
 * @param options
 * @param id
 * @param elemental
 *
 * @returns {*}
 */
function bootElemental(config, tag, options, id, elemental)
{
    try {
        createElemental(config, tag, options, id);
        return updateElementalJson({}, elemental, {
            processed: true,
            id: id
        });
    } catch (error) {
        console.debug(error);
        console.log(`A error occurred initializing elemental: ${elemental.name}`);
        return updateElementalJson({}, elemental, {
            processed: false
        })
    }
}

/**
 * Initialize an Elemental
 *
 * @param tag
 * @param elementalsToInitialize
 * @param elemental
 * @param elementalId
 *
 * @returns {{processed}|*}
 */
function initElemental(tag, elementalsToInitialize, elemental, elementalId)
{
    // Check if its already been processed, if so, skip
    if (elemental.processed)
        return elemental;

    // If it has a ID, we should return that elemental
    if (elemental.id)
        return resumeElementalByID(tag, elemental);

    // Get the factory
    var elementalFactory = function (elemental) {
        var configProperty = getElementalConfigProperty(elemental);

        return (configProperty && configProperty.resultFilter)
            ? configProperty.resultFilter
            : isFunction;

    }(elemental);

    // Get the config if it exists
    var elementalConfig = function (elemental, elementalsToInitialize) {
        var configProperty = getElementalConfigProperty(elemental);

        return (configProperty)
            ? configProperty.elemental
            : elementalsToInitialize[elemental.name]

    }(elemental, elementalsToInitialize);

    // Get the defaults if it exists
    var elementalOptions = function (elemental, settings, id) {
        var configProperty = getElementalConfigProperty(elemental);

        return configProperty
            ? configProperty.getOptionsForConfig(elemental, settings[elemental.name], id)
            : elemental.options
    }(elemental, elementalsToInitialize, elementalId);

    // If it can be instantiated, we boot it, otherwise, we just return the elemental
    return (elementalFactory(elementalConfig, tag, elementalOptions))
        ? bootElemental(elementalConfig, tag, elementalOptions, elementalId, elemental)
        : elemental;
}

/**
 * Initialize the elementals
 *
 * @param elementalsTag
 * @param elementalsToInitialise
 */
function initElementals(elementalsTag, elementalsToInitialise)
{
    var config = parseElemental(elementalsTag),
        newConfig = config.map(function(elemental, index) {
            return initElemental(elementalsTag, elementalsToInitialise, elemental, elemental.id || String(index));
        }),
        newJson = JSON.stringify(newConfig);

    // Only update DOM when necessary
    if (JSON.stringify(config) !== newJson) {
        elementalsTag.setAttribute(elementalDataTag, newJson);
    }
}

export default {
    /**
     * Loop through elemental elements and instantiate the elemental for each
     *
     * @param {object|array} elementalsToInitialise - config or configs corresponding to elementals you want to instance
     * @param context
     */
    initElementals: function(elementalsToInitialise, context = document) {
        if (!context)
            console.debug("Unable to initialize elemental map. Invalid 'context' value 'null' was passed in");

        getElementalsInContext(context).map(function (elementalsTag) {
            return initElementals(elementalsTag, elementalsToInitialise);
        });
    },

    /**
     * Destroy elementals
     *
     * @param context
     */
    destroyElementals: function (context) {
        getElementalsInContext(context).map(cleanElemental)
    },

    /**
     * Reset elementals in context
     *
     * @param context
     */
    resetElementals: function (context) {
        var elementals = getElementalsInContext(context);
        elementals.hasAttribute(elementalDataTag) && elementalStorage.push(context),
            elementalStorage.forEach(deleteElemental)
    }
}