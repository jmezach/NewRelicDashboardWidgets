/// <reference path="../../typings/index.d.ts" />
import 'applicationinsights-js';

export interface IAppInsightsManager {
    init(extensionContext: IExtensionContext, webContext: WebContext);
    trackException(exception: Error);
    trackPageView(name: string, properties?: { [name: string]: string; });
    trackEvent(name: string, properties?: { [name: string]: string; });
    startTrackEvent(name: string);
    stopTrackEvent(name: string, properties?: { [name: string]: string; });
}

export class AppInsightsManager implements IAppInsightsManager {
    private appInsights: Microsoft.ApplicationInsights.IAppInsights = null;

    init(extensionContext: IExtensionContext, webContext: WebContext) {
        // Initialize AppInsights with correct instrumentation key depending on the extension ID (public/private)
        this.appInsights = (<any>window).appInsights;
        if (extensionContext.extensionId === "new-relic-dashboard-widgets") {
            this.appInsights.downloadAndSetup({ instrumentationKey: "ff5f05d5-f1f3-484a-8fca-2c001689ad24" });
        } else if (extensionContext.extensionId === "test") {
            this.appInsights.downloadAndSetup({ instrumentationKey: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" });
        } else {
            this.appInsights.downloadAndSetup({ instrumentationKey: "23dc9f12-314d-45e5-87e7-1bdd088e394c" });
        }
        
        // Set the authenticated user context
        this.appInsights.setAuthenticatedUserContext(webContext.account.id, webContext.collection.id);
    }

    trackException(exception: Error) {
        this.ensureInstrumentationKeySet();
        this.appInsights.trackException(exception);
    }

    trackPageView(name: string, properties?: { [name: string]: string; }) {
        this.ensureInstrumentationKeySet();
        this.appInsights.trackPageView(name, null, properties);
    }

    trackEvent(name: string, properties?: { [name: string]: string; }) {
        this.ensureInstrumentationKeySet();
        this.appInsights.trackEvent(name, properties);
    }

    startTrackEvent(name: string) {
        this.ensureInstrumentationKeySet();
        this.appInsights.startTrackEvent(name);
    }

    stopTrackEvent(name: string, properties?: { [name: string]: string; }) {
        this.ensureInstrumentationKeySet();
        this.appInsights.stopTrackEvent(name, properties);
    }

    private ensureInstrumentationKeySet() {
        if (this.appInsights === null) {
            throw new Error("Set the instrumentationKey before tracking");
        }
    }
}