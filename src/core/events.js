var eventToken = 0,
    subscriptionList = [],
    autoClient = 0;

/**
 * Subscribe to an event
 *
 * @param subject
 * @param event
 * @param callback
 * @param clientId
 * @returns {number}
 */
function subscribe(subject, event, callback, clientId) {
    // Callback needs to be a function
    if ("function" != typeof callback) return -1;

    // Increment the new client token by 1 for the next client
    var newClientToken = ++eventToken;

    // Push the event and return the new client token after success
    return subscriptionList.push({
        subject: subject,
        event: event,
        token: eventToken,
        clientId: clientId,
        callback: callback
    }), newClientToken;
}

/**
 * Subscribe only once, once the vent was fired, we disappear
 *
 * @param subject
 * @param event
 * @param callback
 * @param clientId
 */
function subscribeOnce(subject, event, callback, clientId) {
    var subscription = subscribe(subject, event, function (toPublish) {
        callback(toPublish), unsubscribe(subscription)
    }, clientId);
}

/**
 * Unsubscribe from a particular client
 *
 * @param clientId
 */
function unsubscribe(clientId) {
    subscriptionList = subscriptionList.filter(function (subscription) {
        return subscription.token !== clientId
    });
}

/**
 * Publish an event with a context
 *
 * @param subject
 * @param event
 * @param toPublish
 */
function publish(subject, event, toPublish) {
    subscriptionList.forEach(function(item) {
        item.subject === subject && item.event === event && item.callback(toPublish);
    })
}

/**
 * Export all functions
 */
export default {
    subscribe: subscribe,
    subscribeOnce: subscribeOnce,
    unsubscribe: unsubscribe,
    publish: publish,
    clearAll: function() {
        subscriptionList = []
    },
    getClient: function() {
        return function (client) {
            return {
                subscribe: function (subject, event, callback) {
                    return subscribe(subject, event, callback, client)
                },
                subscribeOnce(subject, event, callback) {
                    return subscribeOnce(subject, event, callback, client)
                },
                publish: publish,
                unsubscribe: unsubscribe,
                unsubscribeAll: function () {
                    !function (clientId) {
                        subscriptionList = subscriptionList.filter(function (subscription) {
                            return subscription.clientId !== clientId
                        })
                    }(client)
                }
            }
        }(++autoClient)
    }
}