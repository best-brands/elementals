## Inheritance

Yes, it is possible to 'inherit' functionality from other components, as long as they give you an according API. A good
example is the [menuAim](https://github.com/harm-smits/elementals/tree/master/example/menuAimElemental.js) elemental in
the example folder. As you can see, it accepts an object of settings with the following values:

```javascript
let options = {
    rowSelector: "> li",
    submenuSelector: "*",
    submenuDirection: "right",
    tolerance: 75, // bigger = more forgiving when entering submenu
    enter: function () {},
    exit: function () {},
    activate: function () {},
    deactivate: function () {},
    exitMenu: function () {}
}
```

Now, these values, we can change by passing different values. Let's take a look at how we can inherit another elemental:

```javascript
import {Elemental} from "index";
import {default as MenuAimElemental} from "example/menuAimElemental"

// A simple example of elemental inheritance. We can manage elementals ourselves by initializing
// them on a context and by managing the instance. This way we can inherit functionality from a different
// elemental by means of the same API, this is great for re-using elementals.
export default Elemental("categoryMenuAimElemental", function (elemental, settings) {
    // we initialize the "menuAim" elemental and override some functions in the API of menuAim
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
    // we again allow settings to be passed through the elemental options tag
    }, ...settings});

    return {
        pause: function () {
            // when we pause, we will also have to pause the menuAim instance
            // manually, as it has not been registered to the elemental manager
            menuAim.pause()
        },
        resume: function () {
            menuAim.resume()
        },
        destroy: function () {
            menuAim.destroy();
            elemental.destroy();            
        }
    }
});
```