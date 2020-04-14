/**
 * Create a custom event
 *
 * @param eventName
 * @param params
 *
 * @returns {CustomEvent}
 */
export default function eventCreator(eventName, params) {
    var _bubbles = params.bubbles,
        bubbles = void 0 !== _bubbles && _bubbles,
        _cancelable = params.cancelable,
        cancelable = void 0 !== _cancelable && _cancelable,
        _detail = params.detail,
        detail = void 0 === _detail ? {} : _detail;

    if ("function" == typeof CustomEvent) return new CustomEvent(eventName, {
        bubbles: bubbles,
        cancelable: cancelable,
        detail: detail
    });

    var createdEvent = document.createEvent("CustomEvent");

    return createdEvent.initCustomEvent(eventName, bubbles, cancelable, detail), createdEvent
}

/**
 * Get event properties (bubbles and cancelable)
 *
 * @param event
 * @returns {*|null}
 */
function getEventProperties(event) {
    var generateEventPresets = function (bubblesBoolean, cancelableBoolean) {
        return {
            bubbles: bubblesBoolean,
            cancelable: cancelableBoolean
        }
    };

    var propagateUncancellable = generateEventPresets(true, false),
        propagateCancellable = generateEventPresets(true, true),
        NoPropogateUncancellable = generateEventPresets(false, false);

    return {
        click: propagateCancellable,
        focus: NoPropogateUncancellable,
        submit: propagateCancellable,
        change: propagateUncancellable,
        select: propagateUncancellable,
        blur: NoPropogateUncancellable,
        resize: NoPropogateUncancellable,
        scroll: NoPropogateUncancellable,
        reset: propagateCancellable,
        input: propagateUncancellable,
        keyup: propagateCancellable,
        mousedown: propagateCancellable,
        orientationchange: NoPropogateUncancellable,
        hashchange: NoPropogateUncancellable,
        animationend: propagateUncancellable,
        load: NoPropogateUncancellable,
        touchend: propagateCancellable,
        unload: NoPropogateUncancellable
    }[event] || null
}

/**
 * Create an event
 *
 * @param eventName
 * @param context
 */
export function createEvent(eventName, context = document) {
    var event, eventProperties = getEventProperties(eventName);

    if (!eventProperties)
        throw new Error(`Type '${eventName} not implemented yet for dispatch()!`);

    if ("function" == typeof Event) {
        event = new Event(eventName, eventProperties)
    } else {
        event = document.createEvent("Event");
        event.initEvent(eventName, eventProperties.bubbles, eventProperties.cancelable)
    }

    return context.dispatchEvent(event)
}

/**
 * Add event listener
 *
 * @param event
 * @param listener
 * @param context
 */
export function addEventListener(event, listener, context = document) {
    context.addEventListener(event, listener)
}

/**
 * Remove event listener
 *
 * @param event
 * @param listener
 * @param context
 */
export function removeEventListener(event, listener, context = document) {
    context.removeEventListener(event, listener)
}

/**
 * Event factory for managing events
 *
 * @param selector
 * @param callback
 *
 * @returns {Function}
 */
export function eventFactory(selector, callback) {
    return function (event) {
        if (event.target.nodeType) {
            // Lets make sure that we have support for the 'closest' selector, if not, we fall back
            if ("function" != typeof event.target.closest)
                throw new Error(`Method closest is not supported on element with constructor: ${event.target.constructor}, delegate selector: ${selector}`);

            var closestEventTarget = event.target.closest(selector);

            (closestEventTarget || event.target.matches(selector)) && callback(function (event, options) {
                var eventProperties = {},
                    eventPropertyParser = function (property) {
                    var descriptor = Object.getOwnPropertyDescriptor(event, property);

                    if ("function" == typeof event[property]) {
                        eventProperties[property] = function () {
                            return event[property]()
                        }
                    } else {
                        descriptor && (descriptor.get || descriptor.set)
                            ? Object.defineProperty(eventProperties, property, descriptor)
                            : eventProperties[property] = event[property]
                    }
                };

                for (var eventProperty in event) eventPropertyParser(eventProperty);

                Object.setPrototypeOf(eventProperties, event);

                return Object.keys(options).forEach(function (property) {
                    eventProperties[property] = options[property]
                }), eventProperties

            }(event, {currentTarget: closestEventTarget}))
        }
    }
}