/// <reference path="../../../../typings/index.d.ts" />
import {ServerStatusWidget} from '../../../../src/views/server-status-widget';
import {NewRelicRestApi} from '../../../../src/services/new-relic-rest-api';
import {AppInsightsManagerStub} from '../stubs/app-insights-manager-stub';
import {WidgetWrapperStub} from '../stubs/widget-wrapper-stub';
import {FetchClientStub} from '../stubs/fetch-client-stub';

describe('the ServerStatusWidget module', () => {
    let sut: ServerStatusWidget;
    let mockedWidgetHelper: WidgetWrapperStub;
    let mockedAppInsightsManager: AppInsightsManagerStub;
    let mockedFetchClient: FetchClientStub;

    beforeEach(() => {
        mockedWidgetHelper = new WidgetWrapperStub();
        mockedAppInsightsManager = new AppInsightsManagerStub();
        mockedFetchClient = new FetchClientStub();
        sut = new ServerStatusWidget(<any>mockedWidgetHelper, new NewRelicRestApi(<any>mockedFetchClient, <any>mockedAppInsightsManager), <any>mockedAppInsightsManager);
    });

    it('initially displays the Configure Me state', () => {
        expect(sut.serverName).toEqual('Configure Me');
        expect(sut.serverMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('keeps displaying the Configure Me state when loading invalid settings', () => {
        sut.load({ name: 'ServerStatusWidget', size: { columnSpan: 0, rowSpan: 0 }, customSettings: null });
        expect(sut.serverName).toEqual('Configure Me');
        expect(sut.serverMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('keeps displaying the Configure Me state when loading incomplete settings', () => {
        sut.load({ name: 'ServerStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({ newRelicApiKey: "abc" })
        }});

        expect(sut.serverName).toEqual('Configure Me');
        expect(sut.serverMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('updates when valid settings are loaded', (done) => {
        mockedFetchClient.setupJsonCall("servers.json?filter[ids]=1234567890", 200, {
            servers: [{
                id: 123456789,
                account_id: 1,
                name: "My Server",
                host: "My Server",
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
        })

        sut.load({ name: 'ServerStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({
                newRelicApiKey: "12345678901234567890",
                newRelicServer: "1234567890",
                metricName: "fullest_disk"
            })
        }}).then(() => {
            expect(sut.serverName).toEqual("My Server");
            expect(sut.serverMetric).toEqual("8");
            expect(sut.healthStatus).toEqual("green");
            expect(sut.metricName).toEqual("Fullest Disk");
            expect(mockedAppInsightsManager.exceptions.length).toBe(0);
            done();
        });
    });

    it ('keeps showing the unconfigured state when New Relic returns an invalid status', (done) => {
        mockedFetchClient.setupJsonCall("servers.json?filter[ids]=1234567890", 500, null);

        sut.load({ name: 'ServerStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({
                newRelicApiKey: "12345678901234567890",
                newRelicServer: "1234567890",
                metricName: "fullest_disk"
            })
        }}).then(() => {
            expect(sut.serverName).toEqual("Configure Me");
            expect(sut.serverMetric).toEqual("?");
            expect(sut.healthStatus).toEqual("grey");
            expect(sut.metricName).toEqual("");
            expect(mockedAppInsightsManager.exceptions.length).toBe(1);
            done();
        });
    });
})