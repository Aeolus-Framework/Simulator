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

//plotEnergyConsumption_normalDistModel();
//plotEnergyConsumption_spikeModel();
//plotEnergyConsumption_oneHousehold();
//plotEnergyProduction_oneHousehold();
//plotWindspeedDuringYear();
//plotGuassian();
//plotTruncatedNormalDist();

new Simulator().start();
