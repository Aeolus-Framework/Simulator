if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

import HttpServer from "./http/server";
import { Simulator, SimulatorParameters } from "./simulator";
import { defaultCollectionsExist, generateDefaultCollections } from "./db/defaultCollections";
import "./db/dbconnect";

const httpPort = Number(process.env.SERVER_PORT) || 8080;
const simulatorOptions: SimulatorParameters = {
    windspeed: {
        maxWindspeedChange: Number(process.env.MAX_WINDSPEED_CHANGE) || 0.002,
        hellmanExponent: Number(process.env.HELLMAN_EXPONENT) || 0.34,
        initialWindspeed: Number(process.env.INITIAL_WINDSPEED) || 4.5
    },
    market: {
        demandEffect: Number(process.env.MARKET_DEMAND_EFFECT) || 1,
        name: process.env.MARKET_NAME || "default"
    },
    powerplantName: process.env.POWERPLANT_NAME || "default"
};

(async () => {
    const simulator = new Simulator(simulatorOptions);
    const server = new HttpServer(httpPort, simulator);

    if (!(await defaultCollectionsExist())) {
        await generateDefaultCollections();
    }

    simulator.start();
})();
