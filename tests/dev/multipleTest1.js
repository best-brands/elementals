import {Elemental} from "../../index";

export default Object(Elemental)("multipleTest1", function (elemental, settings) {
    elemental.el.querySelector(".content-1").innerHTML = "test1";

    return {
        customFunction: function () {
            elemental.el.querySelector(".content-1").innerHTML = "triggered from outside";
        }
    }
});