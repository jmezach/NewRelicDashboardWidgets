/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {WidgetWrapper, IWidget} from '../services/widget-wrapper';
import {NewRelicRestApi} from '../services/new-relic-rest-api';
import {AppInsightsManager} from '../services/app-insights-manager';

export interface IAppStatusWidgetSettings {
    newRelicApiKey: string;
    newRelicApplication: string;
    metricName: string;
}

@autoinject()
export class AppStatusWidget implements IWidget {
    appName: string;
    appMetric: string;
    metricName: string;
    healthStatus: string;

    constructor(private widgetWrapper: WidgetWrapper,
                private newRelicRestApi: NewRelicRestApi,
                private appInsightsManager: AppInsightsManager) {
        this.setUnconfiguredState();
        widgetWrapper.init().then(() => {
            widgetWrapper.register("AppStatusWidget", this)
        });
    }

    public async load(widgetSettings: WidgetSettings) : Promise<boolean> {
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings == null) {
            this.appInsightsManager.trackPageView("AppStatusWidget", { "unconfigured": true.toString() })
            this.setUnconfiguredState();
            return;
        }

        this.appInsightsManager.trackPageView("AppStatusWidget", {
            "metricName": settings.metricName,
            "unconfigured": false.toString()
        });

        await this.refresh(settings);
        return true;
    }

    public async reload(widgetSettings: WidgetSettings) : Promise<boolean> {
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings == null) {
            this.appInsightsManager.trackPageView("AppStatusWidget", { "unconfigured": true.toString() });
            this.setUnconfiguredState();
            return;
        }

        this.appInsightsManager.trackPageView("AppStatusWidget", {
            "metricName": settings.metricName,
            "unconfigured": false.toString()
        });

        await this.refresh(settings);
        return true;
    }

    private async refresh(settings: IAppStatusWidgetSettings) {
        this.appInsightsManager.startTrackEvent("AppStatusWidget.Refresh");
        try {
            this.newRelicRestApi.setApiKey(settings.newRelicApiKey);
            var appStatus = await this.newRelicRestApi.retrieveApplicationStatus(settings.newRelicApplication);
            if (appStatus == null) {
                this.setUnconfiguredState();
                return;
            }

            this.appName = appStatus.name;
            this.healthStatus = appStatus.health_status;

            switch (settings.metricName) {
                case "response_time":
                    this.metricName = "Response Time";
                    this.appMetric = appStatus.reporting ? appStatus.application_summary.response_time.toString() : "?";
                    break;
                case "throughput":
                    this.metricName = "Throughput";
                    this.appMetric = appStatus.reporting ? appStatus.application_summary.throughput.toString() : "?";
                    break;
                case "error_rate":
                    this.metricName = "Error Rate";
                    this.appMetric = appStatus.reporting ? appStatus.application_summary.error_rate.toString() : "?";
                    break;
                case "apdex_score":
                    this.metricName = "Apdex Score";
                    this.appMetric = appStatus.reporting ? appStatus.application_summary.apdex_score.toString() : "?";
                    break;
                default:
                    this.metricName = "Unknown";
                    this.appMetric = "?";
                    break;
            }
        } catch (error) {
            this.appInsightsManager.trackException(error);
        } finally {
            this.appInsightsManager.stopTrackEvent("AppStatusWidget.Refresh", {
                "reporting": appStatus != null ? appStatus.reporting.toString() : null,
                "language": appStatus != null ? appStatus.language : null,
                "health_status": appStatus != null ? appStatus.health_status : null,
            });
        }
    }

    private setUnconfiguredState() {
        this.appName = "Configure Me";
        this.metricName = "";
        this.appMetric ="?";
        this.healthStatus = "grey";
    }

    private parseCustomSettings(widgetSettings: WidgetSettings) : IAppStatusWidgetSettings {
        if (widgetSettings.customSettings === null) {
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
}