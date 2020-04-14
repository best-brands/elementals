import {ElementalManager, Install} from "../../index";
import {default as dispatchingTest} from "./dispatchingTest";
import {default as responsiveTest} from "./responsiveTest";

ElementalManager.initElementals({
    "dispatchingTest": dispatchingTest,
    "responsiveTest": responsiveTest
});

Install()
