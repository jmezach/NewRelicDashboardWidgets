/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {IAppStatusWidgetSettings} from './app-status-widget'
import {WidgetConfigurationWrapper, IWidgetConfiguration} from '../services/widget-configuration-wrapper';
import {NewRelicRestApi, NewRelicErrorScenario, INewRelicApplication} from '../services/new-relic-rest-api';
import {AppInsightsManager} from '../services/app-insights-manager';

@autoinject()
export class AppStatusWidgetConfiguration implements IWidgetConfiguration {
    newRelicApiKey: string = null;
    newRelicApiKeyError: string = null;
    newRelicApplication: string = null;
    metricName: string = "response_time";
    loadingApplications: boolean = false;
    applications: INewRelicApplication[] = [];
    private widgetConfigurationContext: WidgetConfigurationContext;

    constructor(private widgetConfigurationWrapper: WidgetConfigurationWrapper,
                private newRelicRestApi: NewRelicRestApi,
                private appInsightsManager: AppInsightsManager) {
        widgetConfigurationWrapper.init().then(() => {
            widgetConfigurationWrapper.register("AppStatusWidget.Configuration", this)
        });
    }

    public async load(widgetSettings: WidgetSettings, widgetConfigurationContext: WidgetConfigurationContext) : Promise<boolean> {
        this.widgetConfigurationContext = widgetConfigurationContext;
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings != null) {
            this.appInsightsManager.trackPageView("AppStatusWidget.Configuration", { "unconfigured": false.toString() });
            this.newRelicApiKey = settings.newRelicApiKey;
            await this.onNewRelicApiKeyChanged();

            this.newRelicApplication = settings.newRelicApplication;
            this.metricName = settings.metricName;
            this.onConfigurationChanged();
        } else {
            this.appInsightsManager.trackPageView("AppStatusWidget.Configuration", { "unconfigured": true.toString() });
        }

        return true;
    }

    public onSave(): CustomSettings {
        this.appInsightsManager.trackEvent("AppStatusWidget.Configuration.OnSave");
        return this.createCustomSettings();
    }

    public async onNewRelicApiKeyChanged() {
        if (!this.newRelicApiKey) {
            this.newRelicApiKeyError = "Please enter a valid New Relic API key";
            return;
        } else {
            this.newRelicApiKeyError = null;
        }

        try {
            this.loadingApplications = true;
            this.appInsightsManager.startTrackEvent("AppStatusWidget.Configuration.OnNewRelicApiKeyChanged");
            this.newRelicRestApi.setApiKey(this.newRelicApiKey);
            this.applications = await this.newRelicRestApi.retrieveApplications();
            this.onConfigurationChanged();
        } catch (error) {
            this.appInsightsManager.trackException(error);
            switch (error.message) {
                case NewRelicErrorScenario[NewRelicErrorScenario.InvalidAPIKey]:
                    this.newRelicApiKeyError = "Invalid New Relic API key";
                    break;
                case NewRelicErrorScenario[NewRelicErrorScenario.APIAccessDisabled]:
                    this.newRelicApiKeyError = "New Relic API access must be enabled";
                    break;
                default:
                    this.newRelicApiKeyError = "Unable to retrieve applications. Please try again.";
                    break;
            }
        }
        finally {
            this.loadingApplications = false;
            this.appInsightsManager.stopTrackEvent("AppStatusWidget.Configuration.OnNewRelicApiKeyChanged", {
                "applicationCount": this.applications.length.toString(),
                "newRelicApiKeyError": this.newRelicApiKeyError
            });
        }
    }

    public onConfigurationChanged() {
        this.appInsightsManager.trackEvent("AppStatusWidget.Configuration.OnConfigurationChanged");
        this.widgetConfigurationWrapper.notifyConfigurationChanged(
            this.createCustomSettings(),
            this.widgetConfigurationContext
        );
    }

    private parseCustomSettings(widgetSettings: WidgetSettings) : IAppStatusWidgetSettings {
        if (widgetSettings.customSettings === null ) {
            return null;
        }

        try {
            let settings = <IAppStatusWidgetSettings>JSON.parse(widgetSettings.customSettings.data);
            if (!settings || !settings.newRelicApiKey || !settings.newRelicApplication || !settings.metricName) {
                return null;
            }

            return settings;
        } catch (exception) {
            this.appInsightsManager.trackException(exception);
            return null;
        }
    }

    private createCustomSettings() : CustomSettings {
        return {
            data: JSON.stringify({
                newRelicApiKey: this.newRelicApiKey,
                newRelicApplication: this.newRelicApplication,
                metricName: this.metricName
            })
        };
    }
}