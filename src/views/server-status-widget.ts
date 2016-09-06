/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {WidgetWrapper, IWidget} from '../services/widget-wrapper';
import {NewRelicRestApi} from '../services/new-relic-rest-api';
import {AppInsightsManager} from '../services/app-insights-manager';

export interface IServerStatusWidgetSettings {
    newRelicApiKey: string;
    newRelicServer: string;
    metricName: string;
}

@autoinject()
export class ServerStatusWidget implements IWidget {
    serverName: string;
    serverMetric: string;
    metricName: string;
    healthStatus: string;

    constructor(private widgetWrapper: WidgetWrapper,
                private newRelicRestApi: NewRelicRestApi,
                private appInsightsManager: AppInsightsManager) {
        this.setUnconfiguredState();
        widgetWrapper.init().then(() => {
            widgetWrapper.register("ServerStatusWidget", this)
        });
    }

    public async load(widgetSettings: WidgetSettings) : Promise<boolean> {
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings == null) {
            this.appInsightsManager.trackPageView("ServerStatusWidget", { "unconfigured": true.toString() });
            this.setUnconfiguredState();
            return;
        }

        this.appInsightsManager.trackPageView("ServerStatusWidget", {
            "metricName": settings.metricName,
            "unconfigured": false.toString()
        });

        await this.refresh(settings);
        return true;
    }

    public async reload(widgetSettings: WidgetSettings): Promise<boolean> {
        var settings = this.parseCustomSettings(widgetSettings);
        if (settings == null) {
            this.appInsightsManager.trackPageView("ServerStatusWidget", { "unconfigured": true.toString() });
            this.setUnconfiguredState();
            return;
        }

        this.appInsightsManager.trackPageView("ServerStatusWidget", {
            "metricName": settings.metricName,
            "unconfigured": false.toString()
        });

        await this.refresh(settings);
        return true;
    }

    private async refresh(settings: IServerStatusWidgetSettings) {
        this.appInsightsManager.startTrackEvent("ServerStatusWidget.Refresh");
        try {
            this.newRelicRestApi.setApiKey(settings.newRelicApiKey);
            var serverStatus = await this.newRelicRestApi.retrieveServerStatus(settings.newRelicServer);
            if (serverStatus == null) {
                this.setUnconfiguredState();
                return;
            }

            this.serverName = serverStatus.name;
            this.healthStatus = serverStatus.health_status;

            switch (settings.metricName) {
                case "cpu":
                    this.metricName = "CPU";
                    this.serverMetric = serverStatus.reporting ? serverStatus.summary.cpu.toString() : "?";
                    break;
                case "disk_io":
                    this.metricName = "Disk I/O";
                    this.serverMetric = serverStatus.reporting ? serverStatus.summary.disk_io.toString() : "?";
                    break;
                case "memory":
                    this.metricName = "Memory";
                    this.serverMetric = serverStatus.reporting ? serverStatus.summary.memory.toString() : "?";
                    break;
                case "fullest_disk":
                    this.metricName = "Fullest Disk";
                    this.serverMetric = serverStatus.reporting ? serverStatus.summary.fullest_disk.toString() : "?";
                    break;
                default:
                    this.metricName = "Unknown";
                    this.serverMetric = "?";
                    break;
            }
        } catch (error) {
            this.appInsightsManager.trackException(error);
        } finally {
            this.appInsightsManager.stopTrackEvent("ServerStatusWidget.Refresh", {
                "reporting": serverStatus != null ? serverStatus.reporting.toString() : null,
                "health_status": serverStatus != null ? serverStatus.health_status : null
            });
        }
    }

    private setUnconfiguredState() {
        this.serverName = "Configure Me";
        this.metricName = "";
        this.serverMetric ="?";
        this.healthStatus = "grey";
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
        }
    }
}