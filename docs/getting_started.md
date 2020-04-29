# Getting started

The power of Elemental components is that it can easily enrich your content without requiring janky code solutions
whenever you are in need of re-usable components. Besides, it also namespaces your components, which means that if one
does crash, it will log the error but load the rest of the components nonetheless.

## Initializing your first elemental

Initializing an elemental is extremely easy. Take a look:
```javascript
import {Elemental, ElementalManager, Install} from 'elemental';

let gettingStarted = Elemental("gettingStarted", function (elemental, options) {
    // You get access to an object with access to the current DOM you are working in.
    // .name is the elemental name
    // .el is the javascript context
    // .destroy is the removal callable
    // .getInstance fetches an already instantiated instance in the current namespace
    // .getInstances fetches all elementals in the current namespace
    // .getInstanceFromElement fetches an elemental from another provided namespace
    // .pubSubClient is the event manager subscription
    elemental.el.innerHTML = 'Testing some text';

    return {
        resume: function () {
            elemental.el.innerHTML = 'The elemental is now resumed';
        },
        pause: function () {
            elemental.el.innerHTML = 'The elemental is now paused';
        }
    }
});

ElementalManager.initElementals({
    gettingStarted: gettingStarted
}, document);

// bind resize events (we do this after initializing the elementals
// to avoid page jumping when we are still initializing elementals.
Install();
```

Now, all we need to do to initialize it in the DOM, is set the `data-elemental` attribute.

```html
<div data-elemental="gettingStarted">Uninitialized text</div>
```

## Making it responsive

Now that you initialized your first elemental, you might see a problem if you will create separate elementals for
desktop and mobile. To solve this issue, we can load them lazily based on the viewport. To utilize this, we make use of
the "isActiveOn" property.

```html
<div data-elemental='{"name":"gettingStarted", "isActiveOn": ["mobile"]'>Text that will show on tablet and desktop</div>
```

To list the situations easily, the following might occur, and the following will happen:

| Situation                             | What happens                  |
| ------------------------------------- | ----------------------------- |
| in viewport                           | elemental gets loaded         |
| not in viewport                       | elemental does not get loaded |
| in viewport after viewport change     | elemental gets loaded/resumed |
| not in viewport after viewport change | elemental gets paused         |

Note: make sure you include the "index.css" file so that the `isActiveOn` property works.

## Inheritance? Tell me more!

Yes, it is possible to 'inherit' functionality from other components, as long as they give you an according API. A good
example is the menuAim elemental in the example folder. As you can see, it accepts an object of settings with the
following values:

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
import {Elemental} from "../index";
import {default as MenuAimElemental} from "./menuAimElemental"

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
        }
    }
});
```

## How do I pass data to my elementals?

Now you have somewhat of an understanding of how you can use elementals, the next question becomes, how can I
change the settings that get past to my elemental function, from the DOM?

To do this, all we have to do, is add the options tag to the elemental JSON. To be honest, it supports the following
data types in the `data-elemental` attribute:

| Type   | Contains                                     |
| ------ | -------------------------------------------- |
| String | List of elementals separated by spaces       |
| Object | A json object following the elemental schema |
| Array  | An array of elemental objects                |

## What is the elemental schema?

The elemental schema looks as follows:

```json
{
  "name": "yourElementalName",
  "options": "Any datatype of your options here, objects, arrays, really whatever",
  "isActiveOn": ["mobile", "tablet", "desktop", "large-desktop"]
}
```
