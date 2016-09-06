interface ISetupCall {
    status: number,
    content: any
}

export class FetchClientStub {
    private setupCalls: { [url: string]: ISetupCall } = { };

    configure() {
        // Nothing to do
    }

    fetch(url: string) {
        var call = this.setupCalls[url];
        if (call !== undefined) {
            return {
                ok: call.status == 200,
                status: call.status,
                statusText: "OK",
                json: () => {
                    return call.content
                }
            }
        } else {
            return {
                ok: false,
                status: 404,
                statusText: "Not Found",
                json: () => {
                    throw new Error("Unexpected call to json() for 404 response.");
                }
            }
        }
    }

    setupJsonCall(url: string, status: number, content: Object) {
        this.setupCalls[url] = {
            status: status,
            content: content
        };
    }

    setupCall(url: string, status: number) {
        this.setupCalls[url] = {
            status: status,
            content: null
        }
    }
}