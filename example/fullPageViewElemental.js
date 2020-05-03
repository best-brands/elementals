import {Elemental, Viewports} from "../index";
import htmlTemplate from "./fullPageViewElemental.html"
import sassTemplate from "./fullPageViewElemental.sass"
import * as Viewport from "../src/core/viewport";
import * as Events from "../src/core/events";

/**
 * Convert an HTML string to an element
 * @returns {*}
 */
function stringToElem(html = "") {
    let parsed = null;

    try {
        "function" == typeof DOMParser &&
        (new DOMParser).parseFromString("", "text/html") &&
        (parsed = (new DOMParser).parseFromString(html, "text/html").body.childNodes)
    } catch (error) {}

    if (!parsed) {
        let elem = document.createElement("template");
        if (elem.content) {
            elem.innerHTML = html
            parsed = elem.content.childNodes;
        } else {
            let element = document.createElement("div");
            element.innerHTML = html;
            parsed = element.childNodes
        }
    }

    return parsed.length > 1 ? parsed : parsed[0]
}

/**
 * An elemental that provides an easy way to create fold-out menus
 */
export default Elemental("fullPageView", function (elemental, settings) {
    let context,
        target = getTarget(),
        overlayElement,
        contextScrollPaneElement,
        contextPageContentElement,
        contextPageTitleElement,
        overlayHtml = '<div class="full-page-overlay"></div>',
        scrollPos = 0,
        transition,
        subscription;

    /**
     * Get the selector
     * @returns {string}
     */
    function getTarget() {
        return isCurrentView() ? "" : "#" . concat(window.location.hash)
    }

    /**
     * Get the view key from the options
     * @returns {*}
     */
    function getViewKey() {
        return settings.viewKey
    }

    /**
     * Check if the current view is opened
     * @returns {boolean}
     */
    function isCurrentView() {
        return window.location.hash.substr(1) === getViewKey()
    }

    /**
     * Get the action context
     * @returns {*}
     */
    function getActionContext() {
        return settings.openActionElement || elemental.el
    }

    /**
     * Set the direction of the panel
     * @param direction
     */
    function setDirection(direction) {
        if (direction === "rtl")
            context.classList.add("alt-rtl")
    }

    /**
     * Check if the current panel is open
     * @returns {boolean}
     */
    function isOpened() {
        return getActionContext().classList.contains("is-open")
    }

    /**
     * Set the history accordingly
     */
    function setHistory() {
        if (window.history)
            window.history.replaceState(null, document.title, window.location.search + target)
    }

    /**
     * Set the title of the full page view instance
     * @param title
     */
    function setTitle(title) {
        contextPageTitleElement.textContent = title
    }

    /**
     * Set the content of the full page view elemental
     * @param content
     * @param indent
     */
    function setContent(content, indent = false) {
        if (indent) {
            content = `<div class="full-page-view--indented-content">${content}</div>`;
        }

        contextPageContentElement.appendChild = stringToElem(content ? content : "");
    }

    /**
     * Set the footer content of our full page view elemental
     * @param content
     */
    function setFooterContent(content = null) {
        let footer = context.querySelector(".js-full-page-view-footer")
        if (content) {
            if (footer.length) {
                while (footer.firstChild) footer.removeChild(footer.firstChild);
                footer.appendChild(stringToElem(content));
            } else {
                context.appendChild(stringToElem(`<div class="js-full-page-view-footer">${content}</div>`))
            }
        } else {
            footer.parentNode.removeChild(footer);
        }
    }

    /**
     * Set the open handler on the action context
     */
    function setOpenHandler() {
        getActionContext().addEventListener("click", openHandler)
    }

    /**
     * Handles events that will open the full page view elemental
     * @param event
     */
    function openHandler(event) {
        event.preventDefault();
        event.stopPropagation();

        if (isOpened())
            closeHandler()

        overlayElement = stringToElem(overlayHtml);
        document.body.appendChild(overlayHtml);

        overlayElement.addEventListener("click", closeHandler);
        context.querySelector(".js-full-page-view-close").addEventListener("click", closeHandler);

        if (!transition) {
            context.classList.add("is-transition-enabled");
            transition = true;
        }

        getActionContext().classList.add("is-open");
        context.classList.add("is-active");
        contextScrollPaneElement.addClass("is-scrollable").scrollTop = 0;

        scrollPos = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;

        setTimeout(function() {
            return document.body.classList.add("is-non-scrollable");
        }, 200);

        Events.publish(Events.events, `full-page-view-${settings.viewKey}`, ".opened", {
            actionSource: getActionContext(),
            fullPageViewElement: context
        });

        window.location.hash = getViewKey()
        target = getTarget();
    }

    /**
     * Handle events that will close the full page view elemental
     */
    function closeHandler() {
        isCurrentView() && (setHistory(), window.history.back());

        context.querySelector(".js-full-page-view-close").removeEventListener("click", closeHandler);
        overlayElement.removeEventListener("click", closeHandler);

        overlayElement.addClass("is-being-removed");
        setTimeout(function () {
            overlayElement.parentNode.removeChild(overlayElement);
        }, 200);

        document.body.classList.remove("is-non-scrollable");
        getActionContext().classList.remove("is-open");
        context.classList.remove("is-scrollable");

        setTimeout(function () {
            return window.scrollTo(0, scrollPos);
        }, 0)

        Events.publish(Events.events, `full-page-view-${settings.viewKey}`, ".closed");
    }

    /**
     * The event listener for hash change events
     */
    function hashChangeHandler() {
        isCurrentView() && !isOpened() && (setHistory(), window.history.back());
        isOpened() && !isCurrentView() && closeHandler();
    }

    /**
     * The initializer of the full page view elemental
     */
    function init() {
        context = stringToElem(htmlTemplate);
        document.body.appendChild(context);

        contextScrollPaneElement = context.querySelector(".js-full-page-view-scroll-pane");
        contextPageContentElement = context.querySelector(".js-full-page-view-content");
        contextPageTitleElement = context.querySelector(".js-full-page-view-title");

        if (settings.indentedContent) setContent(settings.indentedContent) else setContent(settings.content)
        if (settings.direction) setDirection(settings.direction);
        if (settings.title) setTitle(settings.title);
        if (settings.footerContent) setFooterContent(settings.footerContent);

        setOpenHandler();

        getActionContext().disabled = true
        getActionContext().removeAttribute("title")

        subscription = Elemental.pubSubClient.subscribe(Events.events, Viewport.responsiveEvent, function (data) {
            if (data.viewport !== Viewports.MOBILE && context.classList.contains("is-active")) closeHandler();
        })

        if (isCurrentView() && !isOpened()) setHistory();
        window.addEventListener("hashchange", hashChangeHandler)
    }

    /**
     * Now export the elemental
     */
    return init(), {
        close: closeHandler,
        setContent: setContent,
        setFooterContent: setFooterContent,
        setTitle: setTitle,
        setAction: function (target, location) {
            let selector = {
                "top-left": ".js-full-page-view-top-left-action-container",
                "top-right": ".js-full-page-view-top-right-action-container"
            }[location];

            let topActionContainer = context.querySelector(selector),
                el = stringToElem(target);

            while (topActionContainer.firstChild)
                topActionContainer.removeChild(topActionContainer.firstChild)

            topActionContainer.appendChild(el);
            return el
        },
        pause: function () {
            Elemental.pubSubClient.unsubscribe(subscription);
            window.removeEventListener("hashchange", hashChangeHandler)
        },
        resume: function () {
            setOpenHandler();
            window.addEventListener("hashchange", hashChangeHandler)
        }
    }
});