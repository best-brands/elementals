import {ElementalManager, Install} from "../../index";
import {default as dispatchingTest} from "./dispatchingTest";
import {default as responsiveTest} from "./responsiveTest";
import {default as multipleTest1} from "./multipleTest1";
import {default as multipleTest2} from "./multipleTest2";

ElementalManager.initElementals({
    "dispatchingTest": dispatchingTest,
    "responsiveTest": responsiveTest,
    "multipleTest1": multipleTest1,
    "multipleTest2": multipleTest2
});

Install()
