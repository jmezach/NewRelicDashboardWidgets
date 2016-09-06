/// <reference path="../../../../typings/index.d.ts" />
import {AppStatusWidgetConfiguration} from '../../../../src/views/app-status-widget-configuration';
import {NewRelicRestApi} from '../../../../src/services/new-relic-rest-api';
import {AppInsightsManagerStub} from '../stubs/app-insights-manager-stub';
import {WidgetConfigurationContextStub} from '../stubs/widget-configuration-context-stub';
import {WidgetConfigurationWrapperStub} from '../stubs/widget-configuration-wrapper-stub';
import {FetchClientStub} from '../stubs/fetch-client-stub';

describe ('the AppStatusWidgetConfiguration module', () => {
    let sut: AppStatusWidgetConfiguration;
    let mockedWidgetConfigurationContext: WidgetConfigurationContextStub;
    let mockedWidgetConfigurationWrapper: WidgetConfigurationWrapperStub;
    let mockedAppInsightsManager: AppInsightsManagerStub;
    let mockedFetchClient: FetchClientStub;
    
    beforeEach(() => {
        mockedWidgetConfigurationContext = new WidgetConfigurationContextStub();
        mockedWidgetConfigurationWrapper = new WidgetConfigurationWrapperStub();
        mockedAppInsightsManager = new AppInsightsManagerStub();
        mockedFetchClient = new FetchClientStub();
        sut = new AppStatusWidgetConfiguration(<any>mockedWidgetConfigurationWrapper, new NewRelicRestApi(<any>mockedFetchClient, <any>mockedAppInsightsManager), <any>mockedAppInsightsManager);
    });

    it ('loads settings correctly', (done) => {
        mockedFetchClient.setupJsonCall("applications.json", 200, {
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
        });

        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0}, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({
                newRelicApiKey: "12345678901234567890",
                newRelicApplication: "1234567890",
                metricName: "response_time"
            })
        }}, mockedWidgetConfigurationContext).then(result => {
            expect(result).toBeTruthy();
            expect(sut.newRelicApiKey).toBe("12345678901234567890");
            expect(sut.newRelicApplication).toBe("1234567890");
            expect(sut.metricName).toBe("response_time");
            expect(sut.applications.length).toBe(1);
            expect(sut.newRelicApiKeyError).toBeNull();
            done();           
        })
    });

    it ('loads with invalid settings and handles them as not configured', (done) => {
        sut.load({ name: 'AppStatusWidget', size: { columnSpan: 0, rowSpan: 0 }, customSettings: {
            version: "1.0.0",
            data: JSON.stringify({})
        }}, mockedWidgetConfigurationContext).then(result => {
            expect(result).toBeTruthy();
            expect(sut.newRelicApiKey).toBeNull();
            expect(sut.newRelicApplication).toBeNull();
            expect(sut.metricName).toBe("response_time");
            expect(sut.applications.length).toBe(0);
            expect(sut.newRelicApiKeyError).toBeNull();
            done();
        });
    });

    it ('reloads applications when the New Relic API key changes', (done) => {
        sut.newRelicApiKey = "12345678901234567890";
        mockedFetchClient.setupJsonCall("applications.json", 200, {
            applications: [ { id: 1234567890 }, { id: 2345678901 } ]
        })

        sut.onNewRelicApiKeyChanged().then(() => {
            expect(sut.applications.length).toBe(2);
            done();
        });
    });

    it ('displays an error when no New Relic API key is entered', (done) => {
        sut.newRelicApiKey = null;

        sut.onNewRelicApiKeyChanged().then(() => {
            expect(sut.newRelicApiKeyError).toBe("Please enter a valid New Relic API key");
            done();
        });
    });

    it ('displays an error when an invalid New Relic API key is entered', (done) => {
        sut.newRelicApiKey = "12345678901234567890";
        mockedFetchClient.setupCall("applications.json", 401);

        sut.onNewRelicApiKeyChanged().then(() => {
            expect(sut.newRelicApiKeyError).toBe("Invalid New Relic API key");
            done();
        });
    });

    it ('displays an error when New Relic API has forbidden access to the API', (done) => {
        sut.newRelicApiKey = "12345678901234567890";
        mockedFetchClient.setupCall("applications.json", 403);

        sut.onNewRelicApiKeyChanged().then(() => {
            expect(sut.newRelicApiKeyError).toBe("New Relic API access must be enabled");
            done();
        });
    });

    it ('notifies the widget when a configuration change is made', (done) => {
        sut.onConfigurationChanged();
        
        expect(mockedWidgetConfigurationWrapper.notifyConfigurationChangedCalled).toBeTruthy();
        done();
    })

    it ('provides the correct settings when the configuration is saved', (done) => {
        sut.newRelicApiKey = "12345678901234567890";
        sut.newRelicApplication = "1234567890";
        sut.metricName = "response_time";
        
        var result = sut.onSave();

        expect(result.data).toBe(JSON.stringify({
            newRelicApiKey: '12345678901234567890',
            newRelicApplication: "1234567890",
            metricName: "response_time"
        }));
        done();
    });
});