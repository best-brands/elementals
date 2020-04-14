/**
 * Get all dom elements matching the selector
 *
 * @param selector
 * @param context
 *
 * @returns {*}
 */
function selectAll(selector, context = document) {
    return [...context.querySelectorAll(selector)]
}

export {
    selectAll
}