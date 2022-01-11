if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

import HttpServer from "./http/server";
import { Simulator } from "./simulator";
import { defaultCollectionsExist, generateDefaultCollections } from "./db/defaultCollections";
import "./db/dbconnect";

const httpPort = 8080;

(async () => {
    const simulator = new Simulator();
    const server = new HttpServer(httpPort, simulator);

    if (!(await defaultCollectionsExist())) {
        await generateDefaultCollections();
    }

    simulator.start();
})();
