import * as ResponsiveController from './viewport'
import {default as debounce} from './debounce';
import jQuery from "jquery";

export default function () {
    jQuery(function () {
        jQuery(window).on("resize", debounce(function () {
            ResponsiveController.calculateViewport();
            jQuery(window).trigger("checkForMobileScriptActivation")
        }, 200, false))
    });
}
