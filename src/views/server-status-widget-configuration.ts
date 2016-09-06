/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {IServerStatusWidgetSettings} from './server-status-widget'
import {WidgetConfigurationWrapper, IWidgetConfiguration} from '../services/widget-configuration-wrapper';
import {NewRelicRestApi, NewRelicErrorScenario, INewRelicServer} from '../services/new-relic-rest-api';
import {AppInsightsManager} from '../services/app-insights-manager';

@autoinject()
export class ServerStatusWidgetConfiguration implements IWidgetConfiguration {
    newRelicApiKey: string = null;
    newRelicApiKeyError: string = null;
    newRelicServer: string = null;
    metricName: string = "cpu";
    loadingServers: boolean = false;
    servers: INewRelicServer[] = [];
    private widgetConfigurationContext: WidgetConfigurationContext;

    constructor(private widgetConfigurationWrapper: WidgetConfigurationWrapper,
                private newRelicRestApi: NewRelicRestApi,
                private appInsightsManager: AppInsightsManager) {
        widgetConfigurationWrapper.init().then(() => {
            widgetConfigurationWrapper.register("ServerStatusWidget.Configuration", this)
        }); 
    }

    public async load(widgetSettings: WidgetSettings, widgetConfigurationContext: WidgetConfigurationContext) : Promise<boolean> {
        this.widgetConfigurationContext = widgetConfigurationContext;
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings != null) {
            this.appInsightsManager.trackPageView("ServerStatusWidget.Configuration", { "unconfigured": false.toString() });
            this.newRelicApiKey = settings.newRelicApiKey;
            await this.onNewRelicApiKeyChanged();

            this.newRelicServer = settings.newRelicServer;
            this.metricName = settings.metricName;
            this.onConfigurationChanged();
        } else {
            this.appInsightsManager.trackPageView("ServerStatusWidget.Configuration", { "unconfigured": true.toString() });
        }

        return true;
    }

    public onSave(): CustomSettings {
        this.appInsightsManager.trackEvent("ServerStatusWidget.Configuration.OnSave");
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
            this.loadingServers = true;
            this.appInsightsManager.startTrackEvent("ServerStatusWidget.Configuration.OnNewRelicApiKeyChanged");
            this.newRelicRestApi.setApiKey(this.newRelicApiKey);
            this.servers = await this.newRelicRestApi.retrieveServers();
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
                    this.newRelicApiKeyError = "Unable to retrieve servers. Please try again.";
                    break;
            }
        }
        finally {
            this.loadingServers = false;
            this.appInsightsManager.stopTrackEvent("ServerStatusWidget.Configuration.OnNewRelicApiKeyChanged", {
                "serverCount": this.servers.length.toString(),
                "newRelicApiKeyError": this.newRelicApiKeyError
            });
        }
    }

    public onConfigurationChanged() {
        this.appInsightsManager.trackEvent("ServerStatusWidget.Configuration.OnConfigurationChanged");
        this.widgetConfigurationWrapper.notifyConfigurationChanged(
            this.createCustomSettings(),
            this.widgetConfigurationContext
        );
    }

    private parseCustomSettings(widgetSettings: WidgetSettings) : IServerStatusWidgetSettings {
        if (widgetSettings.customSettings === null ) {
            return null;
        }

        try {
            let settings = <IServerStatusWidgetSettings>JSON.parse(widgetSettings.customSettings.data);
            if (!settings || !settings.newRelicApiKey || !settings.newRelicServer || !settings.metricName) {
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
                newRelicServer: this.newRelicServer,
                metricName: this.metricName
            })
        };
    }
}