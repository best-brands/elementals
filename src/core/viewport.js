import * as Events from './events';
import * as viewports from './viewports';

let viewport;

/**
 * Our event name
 * @type {string}
 */
export var responsiveEvent = "global.responsiveViewChanged";

/**
 * Calculate the current viewport (expensive)
 * @returns {string}
 */
export function calculateViewport() {
    // Initialize variables
    let elem = document.createElement("span"),
        previousViewport = viewport;

    elem.className = "responsive-tracking";
    document.body.appendChild(elem);

    if (elemVisibleWithClass(elem, "responsive-tracking--visible-on-large-desktop")) {
        viewport = viewports.DESKTOP_LARGE;
    } else if (elemVisibleWithClass(elem, "responsive-tracking--visible-on-desktop")) {
        viewport = viewports.DESKTOP;
    } else if (elemVisibleWithClass(elem, "responsive-tracking--visible-on-tablet")) {
        viewport = viewports.TABLET;
    } else {
        viewport = viewports.MOBILE;
    }

    document.body.removeChild(elem);

    if (void 0 !== previousViewport && previousViewport !== viewport) {
        // Event data
        let publishData = {
            viewport: viewport,
            previousViewport: previousViewport
        };

        // Trigger events
        Events.publish(Events.events, responsiveEvent, publishData);
    }

    return viewport;
}

/**
 * Create the viewport tracking element
 * @param context
 * @param className
 */
function elemVisibleWithClass(context, className) {
    let spanElem = document.createElement("span");

    spanElem.className = className;
    context.appendChild(spanElem);

    return spanElem.offsetWidth > 0 && spanElem.offsetHeight > 0
}

/**
 * Get a viewport without the danger of over-calculating
 * @returns {*|string}
 */
export function getViewport() {
    return viewport || calculateViewport()
}