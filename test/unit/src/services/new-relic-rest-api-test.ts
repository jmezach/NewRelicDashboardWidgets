/// <reference path="../../../../typings/index.d.ts" />
import {NewRelicRestApi, NewRelicErrorScenario} from '../../../../src/services/new-relic-rest-api';
import {AppInsightsManagerStub} from '../stubs/app-insights-manager-stub';
import {FetchClientStub} from '../stubs/fetch-client-stub';

describe('the NewRelicRestApi module', () => {
    var sut: NewRelicRestApi;
    var mockFetchClient: FetchClientStub;
    var mockAppInsightsManager : AppInsightsManagerStub;

    beforeEach(() => {
        mockFetchClient = new FetchClientStub();
        mockAppInsightsManager = new AppInsightsManagerStub();
        sut = new NewRelicRestApi(<any>mockFetchClient, <any>mockAppInsightsManager);
        sut.setApiKey("12345678901234567890");
    });

    it ('can retrieve a list of applications', (done) => {
        mockFetchClient.setupJsonCall('applications.json', 200, {
            applications: [{ id: 123456789 }, { id: 123456780 }]
        });

        sut.retrieveApplications().then(result => {
            expect(result.length).toBe(2);
            done();
        });
    });

    it ('handles a 401 response by throwing an exception when retrieving applications', (done) => {
        mockFetchClient.setupCall('applications.json', 401);

        sut.retrieveApplications().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.InvalidAPIKey]);
            done();
        });
    });

    it ('handles a 403 response by throwing an exception when retrieving applications', (done) => {
        mockFetchClient.setupCall('applications.json', 403);

        sut.retrieveApplications().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.APIAccessDisabled]);
            done();
        });
    });

    it ('handles any non OK response by throwing an exception when retrieving applications', (done) => {
        mockFetchClient.setupCall('applications.json', 500);

        sut.retrieveApplications().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
            done();
        });
    });

    it ('tracks retrieval of applications to AppInsights', (done) => {
        mockFetchClient.setupJsonCall('applications.json', 200, {
            applications: [{ id: 123456789 }, { id: 123456780 }]
        });

        sut.retrieveApplications().then(result => {
            expect(mockAppInsightsManager.events[0]).toBe("RetrieveApplications");
            done();
        });
    });

    it ('can retrieve current status for an application', (done) => {
        mockFetchClient.setupJsonCall('applications.json?filter[ids]=123456789', 200, {
            applications: [{
                id: 123456789,
                name: "MyApplication",
                language: "dotnet",
                health_status: "green",
                reporting: true,
                last_reported_at: "2016-06-25T19:27:13+00:00",
                application_summary: {
                    response_time: 213,
                    throughput: 4,
                    error_rate: 0,
                    apdex_target: 0.85,
                    apdex_score: 0.96,
                    host_count: 8,
                    instance_count: 8
                }
            }]
        });

        sut.retrieveApplicationStatus("123456789").then(result => {
            expect(result.id).toBe(123456789);
            expect(result.name).toBe("MyApplication");
            expect(result.health_status).toBe("green");
            expect(result.reporting).toBeTruthy();
            expect(result.application_summary).toBeDefined();
            done();
        });
    });

    it ('tracks application status retrieval to AppInsights', (done) => {
        mockFetchClient.setupJsonCall('applications.json?filter[ids]=123456789', 200, {
            applications: [ { id: 123456789 } ]
        });

        sut.retrieveApplicationStatus("123456789").then(result => {
            expect(mockAppInsightsManager.events[0]).toBe("RetrieveApplicationStatus");
            done();
        })
    });

    it ('can retrieve a list of servers', (done) => {
        mockFetchClient.setupJsonCall("servers.json", 200, {
            servers: [ { id: 123456789 }, { id: 123456780 }]
        });

        sut.retrieveServers().then(result => {
            expect(result.length).toBe(2);
            done();
        });
    });

    it ('handles a 401 response by throwing an exception when retrieving servers', (done) => {
        mockFetchClient.setupCall('servers.json', 401);

        sut.retrieveServers().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.InvalidAPIKey]);
            done();
        });
    });

    it ('handles a 403 response by throwing an exception when retrieving servers', (done) => {
        mockFetchClient.setupCall('servers.json', 403);

        sut.retrieveServers().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.APIAccessDisabled]);
            done();
        });
    });

    it ('handles any non OK response by throwing an exception when retrieving servers', (done) => {
        mockFetchClient.setupCall('servers.json', 500);

        sut.retrieveServers().catch(error => {
            expect(error.message).toBe(NewRelicErrorScenario[NewRelicErrorScenario.ErrorRetrievingData]);
            done();
        });
    });

    it ('tracks servers retrieval to AppInsights', (done) => {
        mockFetchClient.setupJsonCall("servers.json", 200, {
            servers: [ { id: 123456789 }, { id: 123456780 }]
        });

        sut.retrieveServers().then(result => {
            expect(mockAppInsightsManager.events[0]).toBe("RetrieveServers");
            done();
        })
    });

    it ('can retrieve current status for a server', (done) => {
        mockFetchClient.setupJsonCall('servers.json?filter[ids]=123456789', 200, {
            servers: [{
                id: 123456789,
                account_id: 1,
                name: "MyServer",
                host: "MyServer",
                health_status: "green",
                reporting: true,
                last_reported_at: "2016-06-25T19:27:13+00:00",
                summary: {
                    cpu: 213,
                    cpu_stolen: 4,
                    disk_io: 0,
                    memory: 0.85,
                    memory_used: 0.96,
                    memory_total: 0.87,
                    fullest_disk: 8,
                    fullest_disk_free: 8
                }
            }]
        });

        sut.retrieveServerStatus("123456789").then(result => {
            expect(result.id).toBe(123456789);
            expect(result.name).toBe("MyServer");
            expect(result.host).toBe("MyServer");
            expect(result.health_status).toBe("green");
            expect(result.reporting).toBeTruthy();
            done();
        })
    });

    it ('tracks server status retrieval to AppInsights', (done) => {
        mockFetchClient.setupJsonCall("servers.json?filter[ids]=123456789", 200, {
            servers: [ { id: 123456789 } ]
        });

        sut.retrieveServerStatus("123456789").then(result => {
            expect(mockAppInsightsManager.events[0]).toBe("RetrieveServerStatus");
            done();
        })
    });
})