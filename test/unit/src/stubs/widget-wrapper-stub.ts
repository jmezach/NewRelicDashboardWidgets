import {IWidgetWrapper} from '../../../../src/services/widget-wrapper';

export class WidgetWrapperStub implements IWidgetWrapper {
    init() {
        return Promise.resolve();
    }
    register(widgetName, widget) {
        // nothing to do
    }
}