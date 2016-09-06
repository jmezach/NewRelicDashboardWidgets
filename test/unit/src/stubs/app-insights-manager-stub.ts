import {IAppInsightsManager} from '../../../../src/services/app-insights-manager';

export class AppInsightsManagerStub implements IAppInsightsManager {
    pageViews: string[] = [];
    exceptions: Error[] = [];
    events: string[] = [];
    trackingEvents: string[] = [];

    init(extensionContext: IExtensionContext, webContext: WebContext) {
        console.debug("[AppInsightsManagerStub] Init");
    }

    trackPageView(name: string) {
        console.debug("[AppInsightsManagerStub] Page view: " + name);
        this.pageViews.push(name);
    }
    
    trackException(exception: Error) {
        console.warn("[AppInsightsManagerStub] Exception: " + exception.message);
        this.exceptions.push(exception);
    }

    trackEvent(name: string) {
        console.debug("[AppInsightsManagerStub] Event: " + name);
        this.events.push(name);
    }

    startTrackEvent(name: string) {
        console.debug("[AppInsightsManagerStub]: StartTrackEvent: " + name);
        this.trackingEvents.push(name);
    }

    stopTrackEvent(name: string) {
        if (this.trackingEvents.length === 0) {
            throw new Error("Call to stopTrackEvent before startTrackEvent.");
        }
        
        let trackingEvent = this.trackingEvents.pop();
        if (trackingEvent !== name) {
            throw new Error("Call to stopTrackEvent for event '" + name + "' while tracking '" + trackingEvent + "'.");
        }

        console.debug("[AppInsightsManagerStub] StopTrackEvent: " + name);
        this.events.push(name);
    }
}