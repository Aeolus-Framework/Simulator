if (process.env.NODE_ENV === "development") {
    require("dotenv").config();
}

import {
    plotEnergyConsumption_normalDistModel,
    plotEnergyConsumption_spikeModel,
    plotEnergyConsumption_oneHousehold,
    plotEnergyProduction_oneHousehold,
    plotWindspeedDuringYear,
    plotGuassian,
    plotTruncatedNormalDist
} from "./testPlotingFunctions";
import { Simulator } from "./simulator";

import "./db/dbconnect";

//plotEnergyConsumption_normalDistModel();
//plotEnergyConsumption_spikeModel();
//plotEnergyConsumption_oneHousehold();
//plotEnergyProduction_oneHousehold();
//plotWindspeedDuringYear();
//plotGuassian();
//plotTruncatedNormalDist();

new Simulator().start();
