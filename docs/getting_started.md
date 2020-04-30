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
        resume: function () {},
        pause: function () {},
        // there is also a destroy method, although this is only for advanced usage
    }
});

// Lets initialize the elementals in a global context. We can also initialize them
// in a given context, which is great for using them in e.g. popups.
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

The following attributes can be added:
- name: the name of the elemental to initialize;
- options (optional): any type of json that will be passed as the second parameter to the elemental wrapper;
- isActiveOn (optional): an array of viewports on which the elemental is active.
