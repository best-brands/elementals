let eventToken = 0,
    subscriptionList = [],
    autoClient = 0;

/**
 * This holds all global subscriptions to events
 */
export var events;

/**
 * Subscribe to an event
 * @param subject
 * @param event
 * @param callback
 * @param clientId
 * @returns {number}
 */
export function subscribe(subject, event, callback, clientId) {
    if ("function" != typeof callback)
        return -1;

    let newClientToken = ++eventToken;

    subscriptionList.push({
        subject: subject,
        event: event,
        token: eventToken,
        clientId: clientId,
        callback: callback
    });

    return newClientToken;
}

/**
 * Subscribe only once, once the vent was fired, we disappear
 * @param subject
 * @param event
 * @param callback
 * @param clientId
 */
export function subscribeOnce(subject, event, callback, clientId) {
    let subscription = subscribe(subject, event, function (toPublish) {
        callback(toPublish);
        unsubscribe(subscription)
    }, clientId);
}

/**
 * Unsubscribe from a particular client
 * @param clientId
 */
export function unsubscribe(clientId) {
    subscriptionList = subscriptionList.filter(function (subscription) {
        return subscription.token !== clientId
    });
}

/**
 * Unsubscribe from all events
 * @param clientId
 */
export function unsubscribeAll(clientId) {
    subscriptionList = subscriptionList.filter(function (subscription) {
        return subscription.clientId !== clientId
    })
}

/**
 * Publish an event with a context
 * @param subject
 * @param event
 * @param toPublish
 */
export function publish(subject, event, toPublish) {
    subscriptionList.forEach(function(item) {
        item.subject === subject && item.event === event && item.callback(toPublish);
    })
}

/**
 * Clear all events
 */
export function clearAll() {
    subscriptionList = []
}

/**
 * Create a client object
 * @param clientId
 * @return {*}
 */
function createClient(clientId) {
    return {
        subscribe: function (subject, event, callback) {
            return subscribe(subject, event, callback, clientId)
        },
        subscribeOnce: function(subject, event, callback) {
            return subscribeOnce(subject, event, callback, clientId)
        },
        publish: publish,
        unsubscribe: unsubscribe,
        unsubscribeAll: function () {
            unsubscribeAll(clientId);
        }
    }
}

/**
 * Get an event client
 */
export function getClient() {
    return createClient(++autoClient)
}