/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {AppInsightsManager} from './app-insights-manager';

export interface IWidgetConfiguration {
    load(settings: WidgetSettings, widgetConfigurationContext: WidgetConfigurationContext): Promise<boolean>
    onSave(): CustomSettings
}

export interface IWidgetConfigurationWrapper {
    init(): Promise<void>;
    register(widgetConfigurationName: string, widgetConfiguration: IWidgetConfiguration);
    notifyConfigurationChanged(settings: CustomSettings, widgetConfigurationContext: WidgetConfigurationContext);
}

@autoinject()
export class WidgetConfigurationWrapper implements IWidgetConfigurationWrapper {
    private tfsWidgetHelpers: WidgetHelpers;

    constructor(private appInsightsManager: AppInsightsManager) {

    }

    public async init() {
        // Initialize the extension
        VSS.init({
            explicitNotifyLoaded: true,
            usePlatformStyles: true
        });

        // Setup a callback when VSS is done
        VSS.ready(() => {
            this.appInsightsManager.init(VSS.getExtensionContext(), VSS.getWebContext());
        });

        // Load the TFS WidgetHelpers
        var promise = new Promise<WidgetHelpers>(resolve => {
            VSS.require(["TFS/Dashboards/WidgetHelpers"], widgetHelpers => {
                resolve(widgetHelpers);
            })
        });

        this.tfsWidgetHelpers = await promise;
        this.tfsWidgetHelpers.IncludeWidgetConfigurationStyles();
    }

    public register(widgetConfigurationName: string, widgetConfiguration: IWidgetConfiguration) {
        // Register the widget with the system
        var widgetHelpers = this.tfsWidgetHelpers;
        VSS.register(widgetConfigurationName, function() {
            return {
                load: function(settings, widgetConfigurationContext) {
                    widgetConfiguration.load(settings, widgetConfigurationContext);
                    return widgetHelpers.WidgetStatusHelper.Success();
                },
                onSave: function() {
                    var customSettings = widgetConfiguration.onSave();
                    return widgetHelpers.WidgetConfigurationSave.Valid(customSettings);
                }
            }
        });

        // Indicate that we're done loading
        VSS.notifyLoadSucceeded();
    }

    public notifyConfigurationChanged(settings: CustomSettings, widgetConfigurationContext: WidgetConfigurationContext) {
        var eventName = this.tfsWidgetHelpers.WidgetEvent.ConfigurationChange;
        var eventArgs = this.tfsWidgetHelpers.WidgetEvent.Args(settings);
        widgetConfigurationContext.notify(eventName, eventArgs);
    }
}