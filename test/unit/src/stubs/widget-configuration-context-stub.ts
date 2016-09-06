/// <reference path="../../../../typings/index.d.ts" />

export class WidgetConfigurationContextStub implements WidgetConfigurationContext {
    notifications : { event: string, args: EventArgs }[];

    notify(event: string, args: EventArgs) {
        this.notifications.push({ event: event, args: args });
    }
}