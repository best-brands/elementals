import * as ResponsiveController from './viewport'
import {default as debounce} from './debounce';
import {addEventListener} from "./DOMEvents";

export default function () {
    (function () {
        addEventListener(window, "resize", debounce(function () {
            ResponsiveController.calculateViewport();
        }, 200, false))
    })();
}
