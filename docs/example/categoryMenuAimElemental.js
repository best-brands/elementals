import {Elemental} from "../../index";
import {default as MenuAimElemental} from "./menuAimElemental"

// A simple example of elemental inheritance. We can manage elementals ourselves by initializing
// them on a context and by managing the instance. This way we can inherit functionality from a different
// elemental by means of the same API, this is great for re-using elementals.
export default Elemental("categoryMenuAimElemental", function (elemental, settings) {
    let menuAim = MenuAimElemental(elemental.el, {...{
        activate: function (target) {
            target.classList.add("is-active");
            target.setAttribute("tabindex", -1);
            target.focus();
        },
        deactivate: function (target) {
            target.classList.remove("is-active")
        },
        submenuDirection: "below"
    }, ...settings});

    return {
        pause: function () {
            menuAim.pause()
        },
        resume: function () {
            menuAim.resume()
        }
    }
});