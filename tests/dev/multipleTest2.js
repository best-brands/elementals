import {Elemental} from "../../index";
import * as Storage from "../../src/core/storage";

export default Object(Elemental)("multipleTest2", function (elemental, settings) {
    elemental.el.querySelector(".content-2").innerHTML = "test2";

    /**
     * We can retrieve elementals in our current context, lets trigger that custom function we defined
     * in multipleTest1.
     */
    elemental.getInstance("multipleTest1").customFunction();

    return {}
});