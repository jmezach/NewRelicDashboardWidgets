import {IWidgetConfigurationWrapper} from '../../../../src/services/widget-configuration-wrapper';

export class WidgetConfigurationWrapperStub implements IWidgetConfigurationWrapper {
    notifyConfigurationChangedCalled: boolean = false;

    init() {
        return Promise.resolve();
    }

    register(widgetConfigurationName, widget) {
        // nothing to do
    }

    notifyConfigurationChanged() {
        this.notifyConfigurationChangedCalled = true;
    }
}