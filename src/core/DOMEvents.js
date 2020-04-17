/**
 * Add event listener
 * @param context
 * @param event
 * @param listener
 * @param useCapture
 */
export function addEventListener(context, event, listener, useCapture) {
    context.addEventListener(event, listener)

    if (useCapture === undefined)
        useCapture=false;

    context.addEventListener(event,listener,useCapture);

    if (!context.eventListenerList)
        context.eventListenerList = {};

    if (!context.eventListenerList[event])
        context.eventListenerList[event] = [];

    context.eventListenerList[event].push({
        listener: listener,
        useCapture: useCapture
    });
}

/**
 * Remove event listener
 * @param context
 * @param event
 * @param listener
 * @param useCapture
 */
export function removeEventListener(context, event, listener, useCapture = false) {
    context.removeEventListener(event, listener, useCapture);

    if (!context.eventListenerList)
        context.eventListenerList = {};

    if (!context.eventListenerList[event])
        context.eventListenerList[event] = [];

    for (var i = 0; i < context.eventListenerList[event].length; i++) {
        if (context.eventListenerList[event][i].listener === listener, context.eventListenerList[event][i].useCapture === useCapture) { // Hmm..
            context.eventListenerList[event].splice(i, 1);
            break;
        }
    }

    if (context.eventListenerList[event].length === 0)
        delete context.eventListenerList[event];
}

/**
 * Get all current event listeners
 * @param context
 * @param event
 */
export function getEventListeners(context, event = undefined) {
    if (!context.eventListenerList)
        context.eventListenerList = {};
    return event === undefined ? context.eventListenerList : context.eventListenerList[event];
}

/**
 * Clear all event listeners of an element
 * @param context
 */
export function clearEventListeners(context) {
    if (!context.eventListenerList)
        context.eventListenerList = {};

    var events = getEventListeners(context);
    for (var event in events) {
        if (!events.hasOwnProperty(event))
            continue;
        var el = getEventListeners(context, event);
        if (el !== undefined) {
            for (var i = el.length - 1; i >= 0; --i) {
                removeEventListener(context, event, el[i].listener, el[i].useCapture);
            }
        }
    }
}
