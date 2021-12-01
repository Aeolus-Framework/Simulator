import {
    plotEnergyConsumption_normalDistModel,
    plotEnergyConsumption_spikeModel,
    plotEnergyConsumption_oneHousehold,
    plotEnergyProduction_oneHousehold,
    plotWindspeedDuringYear,
    plotGuassian,
    plotTruncatedNormalDist
} from "./testPlotingFunctions";
import { startSimulator } from "./simulator";
import { startSimulator as startBatSimulator } from "./batchedSimulator";

//plotEnergyConsumption_normalDistModel();
//plotEnergyConsumption_spikeModel();
//plotEnergyConsumption_oneHousehold();
//plotEnergyProduction_oneHousehold();
//plotWindspeedDuringYear();
//plotGuassian();
//plotTruncatedNormalDist();

//startSimulator();
startBatSimulator({ day: 1 });
