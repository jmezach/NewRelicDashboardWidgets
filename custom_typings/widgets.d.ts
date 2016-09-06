interface WidgetHelpers {
    WidgetStatusHelper: WidgetStatusHelper;
    WidgetConfigurationSave: WidgetConfigurationSave;
    WidgetEvent: WidgetEvent;
    IncludeWidgetStyles(): void;
    IncludeWidgetConfigurationStyles() : void;
}

interface WidgetStatusHelper {
    Success(): WidgetStatus;
    Failure(message: string) : WidgetStatus;
}

interface WidgetConfigurationSave {
    Valid(customSettings: CustomSettings): WidgetStatus;
    Invalid(): WidgetStatus;
}

interface WidgetEvent {
    ConfigurationChange: string;
    Args(customSettings: CustomSettings): EventArgs;
}

interface WidgetSettings {
    name: string;
    size: WidgetSize;
    customSettings: CustomSettings;
}

interface WidgetSize {
    columnSpan: number;
    rowSpan: number;
}

interface CustomSettings {
    data: string;
    version?: string;
}

interface WidgetStatus {
    message: string;
}

interface WidgetConfigurationContext {
    notify(event: string, eventArgs: EventArgs)
}

interface EventArgs {
    data: any
}