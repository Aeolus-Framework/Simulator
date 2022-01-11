if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

import { Simulator } from "./simulator";
import { defaultCollectionsExist, generateDefaultCollections } from "./db/defaultCollections";

import "./db/dbconnect";

(async () => {
    if (!(await defaultCollectionsExist())) {
        await generateDefaultCollections();
    }

    new Simulator().start();
})();
