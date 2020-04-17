import {Elemental} from "../../index";

export default Object(Elemental)("responsiveTest", function (elemental, settings) {
    function setContent(content) {
        elemental.el.innerHTML = content
    }

    return console.log("initialize"),
        setContent("initialize"), {
        resume: function () {
            setContent("resumed")
            console.log("resumed")
        },
        pause: function () {
            setContent("paused")
            console.log("paused")
        }
    }
});