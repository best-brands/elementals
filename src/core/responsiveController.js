import {default as Elemental} from "../elemental";
import * as ElementalEvents from "./elementalEvents";
import * as Events from "./events";
import * as Storage from "./storage";
import * as Viewport from "./viewport";

export default Elemental("responsiveController", function (name, settings) {
    var elemental,
        subscription,
        paused = false;

    /**
     * Get the requested elemental
     */
    function getElemental() {
        if (elemental) return;

        // Initialize the elemental
        elemental = settings.elemental(name.el, settings.elementalOptions);

        if (!elemental || elemental instanceof HTMLElement) {
            elemental = Storage.get(name.el, `elementals.${settings.elementalName}`);
        }

        if (elemental) {
            elemental.id = settings.id;
        } else {
            console.debug(`Expected instance of ${settings.elementalName} is not available.`);
        }
    }

    /**
     * Check if active on the current viewport
     * @returns {boolean}
     */
    function isViewportActive() {
        var viewport = Viewport.getViewport();
        if (void 0 === settings.isActiveOn)
            return false;
        return -1 !== settings.isActiveOn.indexOf(viewport)
    }

    /**
     * Bootstrap the manager
     * @returns {*}
     */
    function responsiveEventHandler() {
        if (!isViewportActive()) {
            // If we dont have a elemental or its paused, return
            if (!elemental || paused)
                return;
            if (elemental.pause) try {
                paused = true;
                elemental.pause();
            } catch (error) {
                console.debug(`An error occurred attempting to pause elemental: ${settings.elementalName}`);
                console.debug(error);
            } else {
                console.debug(`Unable to pause ${settings.elementalName}, it will remain active across breakpoints as it doesnt have a breakpoint.`);
            }
        } else {
            // If elemental is false, we get the elemental
            if (!paused)
                return void getElemental();

            // We have retrieved the elemental, now try resuming it
            if (elemental.resume) try {
                paused = false;
                elemental.resume();
            } catch (error) {
                console.debug(`An error occurred attempting to resume elemental: ${settings.elementalName}`);
            } else {
                console.debug(`Unable to resume ${settings.elementalName}, elemental has not implemented a "resume" method.`);
            }
        }
    }

    /**
     * The elemental destroy handler
     * @param event
     */
    function elementalDestroyHandler(event) {
        if (elemental === event.instance) {
            Events.unsubscribe(subscription);
            elemental = void 0;
            paused = false;
        }
    }

    subscription = Events.subscribe(Events, Viewport.responsiveEvent, responsiveEventHandler);
    Events.subscribeOnce(name.el, ElementalEvents.ELEMENTAL_DESTROYED_EVENT, elementalDestroyHandler);
    responsiveEventHandler();
});