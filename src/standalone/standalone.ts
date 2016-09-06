/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {WidgetCoordinator} from './widget-coordinator'

@autoinject()
export class Standalone {
    selectedWidget: string = "app-status-widget";

    constructor(private widgetCoordinator: WidgetCoordinator) {

    }

    public save() {
        this.widgetCoordinator.saveConfiguration();
    }
}