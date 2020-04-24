import * as Collection from './core/collection';
import * as Events from './core/events';
import * as toolkit from './core/toolkit';
import {default as ResponsiveControllerElemental} from './core/responsiveController';
import * as elementalEvents from "./core/elementalEvents";

let elementalDataTag = 'data-elemental';

/**
 * Parse the Json present in an elemental
 * @param elementalConfig
 */
function parseElementalJson(elementalConfig) {
    try {
        let parsedContent = JSON.parse(elementalConfig);
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
 * @param elemental
 * @returns {(*|any[])|{name: string}[]}
 */
function parseElemental(elemental) {
    let elementalConfig = elemental.getAttribute(elementalDataTag);

    // Check if its JSON, if so, we will parse it separately
    if (elementalConfig.includes("[")
        || elementalConfig.includes("]")
        || elementalConfig.includes("{")
        || elementalConfig.includes("}")
    ) {
        let config = parseElementalJson(elementalConfig),
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
 * @param elemental
 * @returns {*}
 */
function setElementalJson(elemental) {
    for (let argumentCount = 1; argumentCount < arguments.length; argumentCount++) {
        let elementalConfig = null != arguments[argumentCount] ? arguments[argumentCount] : {},
            configEntries = Object.keys(elementalConfig);

        if (typeof Object.getOwnPropertySymbols == "function") {
            configEntries = configEntries.concat(Object.getOwnPropertySymbols(elementalConfig).filter(function (configKey) {
                return Object.getOwnPropertyDescriptor(elementalConfig, configKey).enumerable
            }))
        }

        configEntries.forEach(function (key) {
            setElementalData(elemental, key, elementalConfig[key])
        })
    }

    return elemental
}

/**
 * Get options to configure the elemental with
 * @param config
 * @param elemental
 * @param elementalId
 * @returns {{elementalOptions: *, elemental: *, elementalName: *, id: *, isActiveOn: *}}
 */
function getElementalDefaults(config, elemental, elementalId) {
    return {
        isActiveOn: config.isActiveOn,
        elementalName: config.name,
        elemental: elemental,
        elementalOptions: config.options,
        id: elementalId
    }
}

/**
 * Check if the initial elemental is initialized or not
 * @param name
 * @param config
 * @param initialised
 * @returns {boolean}
 */
function elementalConfigResultFilter(name, config, initialised) {
    return "function" == typeof initialised.elemental
}

/**
 * Check if the given elemental is initialized or not
 * @param elemental
 * @returns {boolean}
 */
function elementalResultFilter(elemental) {
    return "function" == typeof elemental
}

/**
 * Get the elemental config property
 * @param elemental
 */
function getElementalConfigProperty(elemental) {
    return [{
        configProperty: "isActiveOn",
        getOptionsForConfig: getElementalDefaults,
        elemental: ResponsiveControllerElemental,
        resultFilter: elementalConfigResultFilter
    }].filter(function (row) {
        return elemental[row.configProperty]
    }).shift()
}

/**
 * Get elementals by tag
 * @param context
 * @returns {*}
 */
function getElementalsInContext(context) {
    return toolkit.selectAll(`[${elementalDataTag}]`, context)
}

/**
 * Pause an elemental
 * @param elemental
 * @param name
 * @param responsiveElemental
 */
function pauseElemental(elemental, name, responsiveElemental) {
    try {
        responsiveElemental.pause();
        Events.publish(elemental, elementalEvents.ELEMENTAL_PAUSED_EVENT, {
            instance: responsiveElemental
        });
    } catch (e) {
        console.log(`A error occurred attempting to pause elemental: ${name}`)
    }
}

/**
 * Destroy an elemental
 * @param elemental
 * @param name
 * @param responsiveElemental
 */
function destroyElemental(elemental, name, responsiveElemental) {
    // Trigger destroy function
    responsiveElemental.destroy();
    Events.publish(elemental, elementalEvents.ELEMENTAL_DESTROYED_EVENT, {
        instance: responsiveElemental
    });
    Collection.remove(elemental, name, responsiveElemental);
}

/**
 * Resume an elemental
 * @param obj
 * @param elemental
 * @returns {*}
 */
function resumeElemental(obj, elemental) {
    try {
        obj.resume();
        return setElementalJson({}, elemental, {
            processed: true
        });
    } catch (error) {
        console.log(`An error occurred attempting to resume elemental: ${elemental.name}`);
        return setElementalJson({}, elemental, {
            processed: false
        })
    }
}

/**
 * Executes an elemental
 * @param factory
 * @param abi
 * @param settings
 * @param id
 */
function executeElemental(factory, abi, settings, id) {
    let result = factory(abi, settings);
    result && (result.id = id);
}

/**
 * Destroy a responsive elemental
 * @param elemental
 * @param settings
 * @returns {*}
 */
function destroyResponsiveElemental(elemental, settings) {
    // Get the responsively wrapped elemental
    let responsiveElemental = Collection.getById(elemental, settings.name, settings.id);

    if (!responsiveElemental)
        return settings;

    // Try to destroy the elemental
    if (responsiveElemental.destroy) {
        destroyElemental(elemental, settings.name, responsiveElemental);
        return setElementalJson({}, settings, {
            processed: void 0
        });
    }

    // Try to pause the elemental
    if (responsiveElemental.pause) {
        pauseElemental(elemental, settings.name, responsiveElemental);
        return setElementalJson({}, settings, {
            processed: void 0
        });
    }

    // Unable to pause or destroy, so just return the settings
    return (settings);
}

/**
 * Resume an elemental by ID
 * @param tag
 * @param elemental
 * @returns {*|undefined}
 */
function resumeElementalByID(tag, elemental) {
    return resumeElemental(Collection.getById(tag, elemental.name, elemental.id), elemental);
}

/**
 * Boot an elemental
 * @param instance
 * @param tag
 * @param options
 * @param id
 * @param elemental
 * @returns {*}
 */
function bootElemental(instance, tag, options, id, elemental) {
    try {
        executeElemental(instance, tag, options, id);
        return setElementalJson({}, elemental, {
            processed: true,
            id: id
        });
    } catch (error) {
        console.debug(error);
        console.debug(`An error occurred initializing elemental: ${elemental.name}`);
        return setElementalJson({}, elemental, {
            processed: false
        })
    }
}

/**
 * Initialize an Elemental
 * @param tag
 * @param elementals
 * @param elemental
 * @param id
 * @returns {{processed}|*}
 */
function initElemental(tag, elementals, elemental, id) {
    // Check if its already been processed, if so, skip.
    if (elemental.processed) return elemental;

    // If it has a ID, we should return that elemental as it has already been launched once.
    if (elemental.id) return resumeElementalByID(tag, elemental);

    let config = getElementalConfigProperty(elemental),
        filter = (config && config.resultFilter) ? config.resultFilter : elementalResultFilter,
        instance = config ? config.elemental : elementals[elemental.name],
        options = config ? config.getOptionsForConfig(elemental, elementals[elemental.name], id) : elemental.options

    // If it can be instantiated, we boot it, otherwise, we just return the elemental
    return (filter(instance, tag, options))
        ? bootElemental(instance, tag, options, id, elemental)
        : elemental;
}

/**
 * Initialize the elementals
 * @param elementalsTag
 * @param elementalsToInitialise
 */
function initElementals(elementalsTag, elementalsToInitialise) {
    let config = parseElemental(elementalsTag),
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
     * @param context
     */
    destroyElementals: function (context) {
        getElementalsInContext(context).map(function (elemental) {
            let config = parseElemental(elemental),
                newConfig = config.map(function (settings) {
                    return destroyResponsiveElemental(elemental, settings);
                }),
                newJson = JSON.stringify(newConfig);

            JSON.stringify(config) !== newJson && elemental.setAttribute(elementalDataTag, newJson)
        })
    }
}