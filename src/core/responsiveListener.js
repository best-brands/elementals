import * as ResponsiveController from './responsiveController'
import {default as debounce} from './debounce';
import jQuery from "jquery";

export default function () {
    Object(jQuery)(function () {
        Object(jQuery)(window).on("resize", debounce(function () {
            Object(ResponsiveController.calculateViewport)();
            Object(jQuery)(window).trigger("checkForMobileScriptActivation")
        }, 200, false))
    });
}
