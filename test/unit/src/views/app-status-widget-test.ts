/// <reference path="../../../../typings/index.d.ts" />
import {AppStatusWidget} from '../../../../src/views/app-status-widget';
import {NewRelicRestApi} from '../../../../src/services/new-relic-rest-api';
import {AppInsightsManagerStub} from '../stubs/app-insights-manager-stub';
import {WidgetWrapperStub} from '../stubs/widget-wrapper-stub';
import {FetchClientStub} from '../stubs/fetch-client-stub';

describe('the AppStatusWidget module', () => {
    let sut: AppStatusWidget;
    let mockedWidgetHelper: WidgetWrapperStub;
    let mockedAppInsightsManager: AppInsightsManagerStub;
    let mockedFetchClient: FetchClientStub;

    beforeEach(() => {
        mockedWidgetHelper = new WidgetWrapperStub();
        mockedAppInsightsManager = new AppInsightsManagerStub();
        mockedFetchClient = new FetchClientStub();
        sut = new AppStatusWidget(<any>mockedWidgetHelper, new NewRelicRestApi(<any>mockedFetchClient, <any>mockedAppInsightsManager), <any>mockedAppInsightsManager);
    });

    it('initially displays the Configure Me state', () => {
        expect(sut.appName).toEqual('Configure Me');
        expect(sut.appMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('keeps displaying the Configure Me state when loading invalid settings', () => {
        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0 }, customSettings: null });
        expect(sut.appName).toEqual('Configure Me');
        expect(sut.appMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('keeps displaying the Configure Me state when loading incomplete settings', () => {
        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({ newRelicApiKey: "abc" })
        }});

        expect(sut.appName).toEqual('Configure Me');
        expect(sut.appMetric).toEqual('?');
        expect(sut.metricName).toEqual('');
    });

    it ('updates when valid settings are loaded', (done) => {
        mockedFetchClient.setupJsonCall("applications.json?filter[ids]=1234567890", 200, {
            applications: [{
                id: 123456789,
                name: "My Application",
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
        })

        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({
                newRelicApiKey: "12345678901234567890",
                newRelicApplication: "1234567890",
                metricName: "response_time"
            })
        }}).then(() => {
            expect(sut.appName).toEqual("My Application");
            expect(sut.appMetric).toEqual("213");
            expect(sut.healthStatus).toEqual("green");
            expect(sut.metricName).toEqual("Response Time");
            expect(mockedAppInsightsManager.exceptions.length).toBe(0);
            done();
        });
    });

    it ('keeps showing the unconfigured state when New Relic returns an invalid status', (done) => {
        mockedFetchClient.setupJsonCall("applications.json?filter[ids]=1234567890", 500, null);

        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({
                newRelicApiKey: "12345678901234567890",
                newRelicApplication: "1234567890",
                metricName: "response_time"
            })
        }}).then(() => {
            expect(sut.appName).toEqual("Configure Me");
            expect(sut.appMetric).toEqual("?");
            expect(sut.healthStatus).toEqual("grey");
            expect(sut.metricName).toEqual("");
            expect(mockedAppInsightsManager.exceptions.length).toBe(1);
            done();
        });
    });
})