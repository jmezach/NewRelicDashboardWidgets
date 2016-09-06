/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {IWidgetConfigurationWrapper, IWidgetConfiguration} from '../services/widget-configuration-wrapper'
import {WidgetCoordinator} from './widget-coordinator'

@autoinject
export class StandaloneWidgetConfigurationWrapper implements IWidgetConfigurationWrapper {
    constructor(private widgetCoordinator: WidgetCoordinator) {

    }

    public async init() {
        // Nothing to do
    }

    public register(widgetConfigurationName: string, widgetConfiguration: IWidgetConfiguration) {
        this.widgetCoordinator.setWidgetConfiguration(widgetConfiguration);
    }

    public notifyConfigurationChanged(settings: CustomSettings, widgetConfigurationContext: WidgetConfigurationContext) {
        this.widgetCoordinator.saveConfiguration();
    }
}