import {IWidget} from '../services/widget-wrapper';
import {IWidgetConfiguration} from '../services/widget-configuration-wrapper';

export class WidgetCoordinator {
    widget: IWidget;
    widgetConfiguration: IWidgetConfiguration;

    setWidget(widget: IWidget) {
        this.widget = widget;
        this.widget.load({
            name: "Dummy Name",
            size: { columnSpan: 1, rowSpan: 1},
            customSettings: {
                data: "",
                version: "1.0.0"
            }
        });
    }

    setWidgetConfiguration(widgetConfiguration: IWidgetConfiguration) {
        this.widgetConfiguration = widgetConfiguration;
        this.widgetConfiguration.load({
            name: "Dummy Name",
            size: { columnSpan: 1, rowSpan: 1 },
            customSettings: {
                data: "",
                version: "1.0.0"
            }
        }, { notify: (name: string, args: EventArgs) => {} });
    }

    async saveConfiguration() {
        var customSettings = this.widgetConfiguration.onSave();
        var settings: WidgetSettings = {
            name: "Dummy Name",
            size: { columnSpan: 1, rowSpan: 1 },
            customSettings: customSettings
        };
        
        await this.widget.reload(settings);
    }
}