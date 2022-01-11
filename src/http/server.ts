import http from "http";
import { getUrl } from "./helpers";
import { IdIsValid } from "../util/validators/mongodbValidator";
import type { Simulator } from "../simulator";

export default class HttpServer {
    private server: http.Server;
    private simulator: Simulator;

    constructor(port: number, simulator: Simulator) {
        this.simulator = simulator;

        this.server = http.createServer(async (req, res) => {
            const path = getUrl(req).pathname;

            if (path === "/reload/household" && req.method === "HEAD") {
                return await this.HEAD_reloadHousehold(req, res);
            }
            if (path === "/reload/simulation" && req.method === "HEAD") {
                return await this.HEAD_reloadSimulation(req, res);
            }
            return res.writeHead(404).end();
        });

        this.server.listen(port, () => {
            console.log(`Simulator http server is running on http://localhost:${port}`);
        });
    }

    async HEAD_reloadSimulation(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<http.ServerResponse> {
        // TODO Implement
        return res.writeHead(501).end();
    }

    async HEAD_reloadHousehold(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<http.ServerResponse> {
        const searchParams = getUrl(req).searchParams;
        const householdId = searchParams.get("id");

        if (!IdIsValid(householdId)) {
            return res.writeHead(400).end();
        }

        try {
            this.simulator.reloadHouseholdToSimulator(householdId);
        } catch (error) {
            return res.writeHead(500).end();
        }

        return res.writeHead(200).end();
    }
}
