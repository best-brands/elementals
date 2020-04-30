# Responsive

You might see a problem if you want to create separate elementals for desktop and mobile. To solve this issue, we can
load them lazily based on the viewport. To utilize this, we make use of the `isActiveOn` property that we can define
in the given elemental object.

## Viewports

The following viewports are available by default:

| Viewport      | dimensions       |
| ------------- | ---------------- |
| mobile        | `<= 667px`       |
| tablet        | `668px - 900px`  |
| desktop       | `901px - 1023px` |
| large-desktop | `>= 1024px`      |

You can change these by changing the index.css file accordingly and by including your own styles, you will only need to
make sure these styles use the `@media` directive so that the class hides or shows the block only for ONE viewport.

## Using responsive elementals

Creating a mobile only elemental can be done as follows, as we will only have to provide the `isActiveOn` property with
an array of the viewports on which it should be available:

```html
<div data-elemental='{"name":"gettingStarted", "isActiveOn": ["mobile"]}'>Random text</div>
```

## How do the elementals get loaded?

There are a number of situations that might occur. I have laid them out in a table for you:

| Situation                             | What happens                  |
| ------------------------------------- | ----------------------------- |
| in viewport                           | elemental gets loaded         |
| not in viewport                       | elemental does not get loaded |
| in viewport after viewport change     | elemental gets loaded/resumed |
| not in viewport after viewport change | elemental gets paused         |

Basically, it comes down to the fact, that elementals will ONLY get loaded if they are in the specified viewport,
provided that the `isActiveOn` property has been set. Now, if you leave this viewport (by resizing the screen), it will
call the `pause` and `resume` methods that you return. Both act as per their mnemonic names.

```javascript
import {Elemental} from "index";

let responsiveElemental = Elemental("responsive", function (elemental, options) {
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
            elemental.el.innerHTML = 'Testing some resumed text';
        },
        pause: function () {
            elemental.el.innerHTML = 'Testing some paused text';
        },
        // there is also a destroy method, although this is only for advanced usage
    }
});
```

Note: make sure you include the "index.css" file so that the `isActiveOn` property works.


