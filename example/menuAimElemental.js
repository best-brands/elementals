import {Elemental} from "../index";

export default Elemental("menuAim", function (elemental, settings) {
    let menu = elemental.el,
        activeRow = null,
        mouseLocs = [],
        lastDelayLoc = null,
        timeoutId = null,
        options = {
            rowSelector: "> li",
            submenuSelector: "*",
            submenuDirection: "right",
            tolerance: 75, // bigger = more forgiving when entering submenu
            enter: function () {},
            exit: function () {},
            activate: function () {},
            deactivate: function () {},
            exitMenu: function () {},
            ...settings
        };

    const MOUSE_LOCS_TRACKED = 3, // number of past mouse locations to track
        DELAY = 300;  // ms delay when user appears to be entering submenu

    /**
     * Keep track of the last few locations of the mouse.
     * @param event
     */
    function mousemoveDocument(event) {
        mouseLocs.push({
            x: event.pageX,
            y: event.pageY
        });

        if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
            mouseLocs.shift();
        }
    }

    /**
     * Cancel possible row activations when leaving the menu entirely
     */
    function mouseleaveMenu() {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // If exitMenu is supplied and returns true, deactivate the
        // currently active row on menu exit.
        if (options.exitMenu(this)) {
            if (activeRow) {
                options.deactivate(activeRow);
            }

            activeRow = null;
        }
    }

    /**
     * Trigger a possible row activation whenever entering a new row.
     */
    function mouseenterRow() {
        if (timeoutId) {
            // Cancel any previous activation delays
            clearTimeout(timeoutId);
        }

        options.enter(this);
        possiblyActivate(this);
    }

    /**
     * Trigger a possible row activation whenever leaving a new row.
     */
    function mouseleaveRow() {
        options.exit(this);
    }

    /*
     * Immediately activate a row if the user clicks on it.
     */
    function clickRow() {
        activate(this);
    }

    /**
     * Activate a menu row.
     * @param row
     */
    function activate(row) {
        if (row === activeRow) {
            return;
        }

        if (activeRow) {
            options.deactivate(activeRow);
        }

        options.activate(row);
        activeRow = row;
    }

    /**
     * Possibly activate a menu row. If mouse movement indicates that we
     * shouldn't activate yet because user may be trying to enter
     * a submenu's content, then delay and check again later.
     * @param row
     */
    function possiblyActivate(row) {
        let delay = activationDelay();

        if (delay) {
            timeoutId = setTimeout(function () {
                possiblyActivate(row);
            }, delay);
        } else {
            activate(row);
        }
    }

    /**
     * Check if a selector matches
     * @param el
     * @param selector
     * @returns {*}
     */
    function matchesSelector(el, selector) {
        return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
    }

    /**
     * Return the amount of time that should be used as a delay before the
     * currently hovered row is activated.
     *
     * Returns 0 if the activation should happen immediately. Otherwise,
     * returns the number of milliseconds that should be delayed before
     * checking again to see if the row should be activated.
     */
    function activationDelay() {
        if (!activeRow || !matchesSelector(activeRow, options.submenuSelector)) {
            // If there is no other submenu row already active, then
            // go ahead and activate immediately.
            return 0;
        }

        let offset = menu.getBoundingClientRect();

        // Set the proper offsets
        let left = offset.left + document.body.scrollLeft,
            top = offset.top + document.body.scrollTop;

        let upperLeft = {
                x: left,
                y: top - options.tolerance
            },
            upperRight = {
                x: left + menu.offsetWidth,
                y: upperLeft.y
            },
            lowerLeft = {
                x: left,
                y: top + menu.offsetHeight + options.tolerance
            },
            lowerRight = {
                x: left + menu.offsetWidth,
                y: lowerLeft.y
            },
            loc = mouseLocs[mouseLocs.length - 1],
            prevLoc = mouseLocs[0];

        if (!loc) {
            return 0;
        }

        if (!prevLoc) {
            prevLoc = loc;
        }

        if (prevLoc.x < left || prevLoc.x > lowerRight.x ||
            prevLoc.y < top || prevLoc.y > lowerRight.y) {
            // If the previous mouse location was outside of the entire
            // menu's bounds, immediately activate.
            return 0;
        }

        if (lastDelayLoc &&
            loc.x === lastDelayLoc.x && loc.y === lastDelayLoc.y) {
            // If the mouse hasn't moved since the last time we checked
            // for activation status, immediately activate.
            return 0;
        }

        // Detect if the user is moving towards the currently activated
        // submenu.
        //
        // If the mouse is heading relatively clearly towards
        // the submenu's content, we should wait and give the user more
        // time before activating a new row. If the mouse is heading
        // elsewhere, we can immediately activate a new row.
        //
        // We detect this by calculating the slope formed between the
        // current mouse location and the upper/lower right points of
        // the menu. We do the same for the previous mouse location.
        // If the current mouse location's slopes are
        // increasing/decreasing appropriately compared to the
        // previous's, we know the user is moving toward the submenu.
        //
        // Note that since the y-axis increases as the cursor moves
        // down the screen, we are looking for the slope between the
        // cursor and the upper right corner to decrease over time, not
        // increase (somewhat counterintuitively).
        function slope(a, b) {
            return (b.y - a.y) / (b.x - a.x);
        }

        let decreasingCorner = upperRight,
            increasingCorner = lowerRight;

        // Our expectations for decreasing or increasing slope values
        // depends on which direction the submenu opens relative to the
        // main menu. By default, if the menu opens on the right, we
        // expect the slope between the cursor and the upper right
        // corner to decrease over time, as explained above. If the
        // submenu opens in a different direction, we change our slope
        // expectations.
        if (options.submenuDirection === "left") {
            decreasingCorner = lowerLeft;
            increasingCorner = upperLeft;
        } else if (options.submenuDirection === "below") {
            decreasingCorner = lowerRight;
            increasingCorner = lowerLeft;
        } else if (options.submenuDirection === "above") {
            decreasingCorner = upperLeft;
            increasingCorner = upperRight;
        }

        let decreasingSlope = slope(loc, decreasingCorner),
            increasingSlope = slope(loc, increasingCorner),
            prevDecreasingSlope = slope(prevLoc, decreasingCorner),
            prevIncreasingSlope = slope(prevLoc, increasingCorner);

        if (decreasingSlope < prevDecreasingSlope &&
            increasingSlope > prevIncreasingSlope) {
            // Mouse is moving from previous location towards the
            // currently activated submenu. Delay before activating a
            // new menu row, because user may be moving into submenu.
            lastDelayLoc = loc;
            return DELAY;
        }

        lastDelayLoc = null;
        return 0;
    }

    let menuSubElements

    /**
     * Install all event handlers for menuAim
     */
    function installEventHandlers() {
        menu.addEventListener("mouseleave", mouseleaveMenu);
        menuSubElements = [...menu.querySelectorAll(options.rowSelector)];
        menuSubElements.forEach(function (elem) {
            elem.addEventListener("mouseenter", mouseenterRow);
            elem.addEventListener("mouseleave", mouseleaveRow);
            elem.addEventListener("click", clickRow);
        });
        document.addEventListener("mousemove", mousemoveDocument);
    }

    /**
     * Uninstall all event handlers for menuAim
     */
    function uninstallEventHandlers() {
        menu.removeEventListener("mouseleave", mouseleaveMenu);
        menuSubElements.forEach(function (elem) {
            elem.removeEventListener("mouseenter", mouseenterRow);
            elem.removeEventListener("mouseleave", mouseleaveRow);
            elem.removeEventListener("click", clickRow);
        });
        document.removeEventListener("mousemove", mousemoveDocument);
    }

    installEventHandlers();

    return {
        pause: uninstallEventHandlers,
        resume: installEventHandlers
    }
});
