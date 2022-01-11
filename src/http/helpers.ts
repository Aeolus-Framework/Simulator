import type http from "http";

export function getUrl(request: http.IncomingMessage): URL {
    return new URL(request.url, `http://${request.headers.host}`);
}

export function getRequestBody(request: http.IncomingMessage): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let body = "";
        request.on("error", (error: Error) => {
            reject(error);
        });
        request.on("data", data => {
            body += data.toString();
        });
        request.on("end", () => {
            resolve(body);
        });
    });
}
