/// <reference path="../../typings/index.d.ts" />
import {autoinject} from 'aurelia-framework';
import {IWidgetWrapper, IWidget} from '../services/widget-wrapper'
import {WidgetCoordinator} from './widget-coordinator'

@autoinject()
export class StandaloneWidgetWrapper implements IWidgetWrapper {
    constructor(private widgetCoordinator: WidgetCoordinator) {

    }

    async init() {
        // Nothing to do
    }

    register(widgetName: string, widget: IWidget) {
        this.widgetCoordinator.setWidget(widget);
    }
}