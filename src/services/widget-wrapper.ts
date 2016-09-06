/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {AppInsightsManager} from './app-insights-manager';

export interface IWidget {
    load(settings: WidgetSettings): Promise<boolean>
    reload(settings: WidgetSettings): Promise<boolean>
}

export interface IWidgetWrapper {
    init(): Promise<void>;
    register(widgetName: string, widget: IWidget);
}

@autoinject()
export class WidgetWrapper implements IWidgetWrapper {
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
        this.tfsWidgetHelpers.IncludeWidgetStyles();
    }

    public register(widgetName: string, widget: IWidget) {
        // Register the widget with the system
        var widgetHelpers = this.tfsWidgetHelpers;
        VSS.register(widgetName, function() {
            return {
                load: function(settings) {
                    widget.load(settings);
                    return widgetHelpers.WidgetStatusHelper.Success();
                },
                reload: function(settings) {
                    widget.reload(settings);
                    return widgetHelpers.WidgetStatusHelper.Success();
                }
            }
        });

        // Indicate that we're done loading
        VSS.notifyLoadSucceeded();
    }
}