# Elementals

A JS framework for managing HTML elements enriched by JS.

## Installation

Add the following css to the head of your body in order for the `activeOn` property to work:

```css
.responsive-tracking--visible-on-tablet,
.responsive-tracking--visible-on-desktop,
.responsive-tracking--visible-on-large-desktop {
  display: none;
  height: 1px;
  width: 1px
}

@media only screen and (min-width: 668px) {
  .responsive-tracking--visible-on-tablet {
    display: block
  }
}

@media only screen and (min-width: 1024px) {
  .responsive-tracking--visible-on-tablet {
    display: none
  }
  .responsive-tracking--visible-on-desktop {
    display: block
  }
}

@media only screen and (min-width: 1280px) {
  .responsive-tracking--visible-on-desktop {
    display: none
  }
  .responsive-tracking--visible-on-large-desktop {
    display: block
  }
}
```

## Usage

The power of Elemental components is that it can easily enrich your content without requiring janky code solutions
whenever you are in need of re-usable components. Besides, it also makes name-spacing your components very easy, which
means that if one does crash, it will log the error but load the rest of the components nonetheless.

Initializing an Elemental is really easy:

```js
import {Elemental, ElementalManager, Install} from 'src/elemental';

var elemental = Object(Elemental)("someElemental", function (elemental, options) {
    // You get access to an object with access to the current DOM you are working in.
    // .el is the javascript context
    // .pubSubClient is the event manager subscription
    // .destroy is the removal callable
    // .name is the current elemental name
    elemental.el.innerHTML = 'Testing some text';

    return {
        resume: function () {},
        destroy: function () {},
        pause: function () {}
    }
});

ElementalManager.initElementals({
    someElemental: elemental
}, document);

// bind resize events (we do this after initializing the elementals
// to avoid page jumping when we are still initializing elementals.
Install();
```

```html
<div data-elemental="someElemental"></div>
```

You can also add JSON content in the `data-elemental` tag for more control over elementals:

For optional parameters, you can pass the following json content with anything you want in "options":

```json
{
  "name": "someElemental",
  "isActiveOn": ["mobile"],
  "options": {}
}
```

You can also initialize multiple elementals on the same element:

```json
[
    {
      "name": "someElemental",
      "isActiveOn": ["mobile"],
      "options": {}
    },
    {
      "name": "someElemental2",
      "isActiveOn": ["tablet", "desktop", "desktop-large"],
      "options": {}
    }
]
```