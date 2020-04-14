import {default as Events} from './events';
import jQuery from 'jquery';
import * as viewports from './viewports';

var viewport;

/**
 * Check if the current window has an offset
 *
 * @param namespace
 * @returns {boolean}
 */
function windowHasOffset(namespace) {
    // Start calculating the data required to check for offsets accordingly
    var viewContext = Object(jQuery)(namespace),
        globalContext = Object(jQuery)(window),
        heightOffset = globalContext.scrollTop(),
        totalHeight = heightOffset + globalContext.height(),
        viewHeight = viewContext.offset(),
        hasOffset = false;
    if (!viewHeight) return hasOffset;
    var topOffset = viewHeight.top;

    // Return true/false depending on whether there is an offset
    return topOffset + viewContext.height() >= heightOffset && topOffset <= totalHeight && (hasOffset = true),
        hasOffset
}

/**
 * Our event name
 *
 * @type {string}
 */
var responsiveViewChangeEventName = "global.responsiveViewChanged";


/**
 * Calculate the current viewport (expensive)
 *
 * @returns {string}
 */
function calculateViewport() {
    // Initialize variables
    var trackingElem = document.createElement("span"),
        previousViewport = viewport;

    if (trackingElem.className = "responsive-tracking", document.body.appendChild(trackingElem), viewport = function (context) {
        return createTrackingElement(context, "responsive-tracking--visible-on-large-desktop")
    }(trackingElem) ? viewports.DESKTOP_LARGE : function (context) {
        return createTrackingElement(context, "responsive-tracking--visible-on-desktop")
    }(trackingElem) ? viewports.DESKTOP : function (context) {
        return createTrackingElement(context, "responsive-tracking--visible-on-tablet")
    }(trackingElem) ? viewports.TABLET : viewports.MOBILE, document.body.removeChild(trackingElem),
    // Check if viewport has changed, if so, publish an event
    void 0 !== previousViewport && previousViewport !== viewport) {
        // Event data
        var publishData = {
            viewport: viewport,
            previousViewport: previousViewport
        };

        // Trigger events
        Events.publish(Events, responsiveViewChangeEventName, publishData);
        Object(jQuery)(window).trigger("elementals:viewport:change", publishData);
    }
    return viewport
}

/**
 * Create the viewport tracking element
 *
 * @param context
 * @param className
 */
function createTrackingElement(context, className) {
    var spanElem = document.createElement("span");

    // Return true if offset height/width is greater than 0
    return spanElem.className = className,
        context.appendChild(spanElem),
        spanElem.offsetWidth > 0 && spanElem.offsetHeight > 0
}

/**
 * Get a viewport without the danger of over-calculating
 *
 * @returns {*|string}
 */
function getViewport() {
    return viewport || calculateViewport()
}

export {
    windowHasOffset,
    responsiveViewChangeEventName as default,
    calculateViewport,
    getViewport
}