/**
 * Get all dom elements matching the selector
 *
 * @param selector
 * @param context
 *
 * @returns {*}
 */
export function selectAll(selector, context = document) {
    return [...context.querySelectorAll(selector)]
}

/**
 * Get the height of an element
 * @param elem
 * @returns {number}
 */
export function height(elem) {
    return parseFloat(getComputedStyle(elem, null).height.replace("px", ""))
}
